import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Tag,
  FileText,
  Zap,
  Heart,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

const CustomCardsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { customCards, addCustomCard, updateCustomCard, removeCustomCard } = useGameStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Truth',
    target: 'one',
    intensity: 1,
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const t = (key) => getTranslation(key, language);

  const cardTypes = [
    { value: 'Truth', label: t('truth') || 'Truth', icon: FileText },
    { value: 'Dare', label: t('dare') || 'Dare', icon: Zap },
    { value: 'Icebreaker', label: t('icebreaker') || 'Icebreaker', icon: Heart },
    { value: 'Touch', label: t('touch') || 'Touch', icon: Users }
  ];

  const targetTypes = [
    { value: 'one', label: t('onePerson') || 'One Person' },
    { value: 'random', label: t('randomPerson') || 'Random Person' },
    { value: 'two', label: t('twoPeople') || 'Two People' },
    { value: 'group', label: t('everyone') || 'Everyone' }
  ];

  const intensityLevels = [
    { value: 1, label: t('intensity1') || 'Mild', color: '#10B981' },
    { value: 2, label: t('intensity2') || 'Gentle', color: '#3B82F6' },
    { value: 3, label: t('intensity3') || 'Moderate', color: '#8B5CF6' },
    { value: 4, label: t('intensity4') || 'Intense', color: '#F59E0B' },
    { value: 5, label: t('intensity5') || 'Extreme', color: '#EF4444' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Truth',
      target: 'one',
      intensity: 1,
      tags: []
    });
    setNewTag('');
  };

  const handleCreateCard = () => {
    setIsCreating(true);
    setEditingCard(null);
    resetForm();
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsCreating(false);
    setFormData({
      title: card.title,
      description: card.description,
      type: card.type,
      target: card.target,
      intensity: card.intensity,
      tags: [...card.tags]
    });
  };

  const handleSaveCard = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert(t('fillAllFields') || 'Please fill all required fields');
      return;
    }

    const cardData = {
      id: editingCard ? editingCard.id : `custom_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      target: formData.target,
      intensity: formData.intensity,
      tags: formData.tags,
      isCustom: true,
      createdAt: editingCard ? editingCard.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    if (editingCard) {
      updateCustomCard(cardData);
    } else {
      addCustomCard(cardData);
    }

    setIsCreating(false);
    setEditingCard(null);
    resetForm();
  };

  const handleDeleteCard = (cardId) => {
    if (confirm(t('confirmDeleteCard') || 'Are you sure you want to delete this card?')) {
      removeCustomCard(cardId);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getCardTypeIcon = (type) => {
    const cardType = cardTypes.find(t => t.value === type);
    return cardType ? cardType.icon : FileText;
  };

  const getIntensityColor = (intensity) => {
    const level = intensityLevels.find(l => l.value === intensity);
    return level ? level.color : '#6B7280';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">
              {t('customCards') || 'Custom Cards'}
            </h1>
          </div>
          <button
            onClick={handleCreateCard}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>{t('createCard') || 'Create Card'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Card Creation/Edit Form */}
        <AnimatePresence>
          {(isCreating || editingCard) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingCard ? t('editCard') || 'Edit Card' : t('createNewCard') || 'Create New Card'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCard(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t('cardTitle') || 'Card Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t('enterCardTitle') || 'Enter card title...'}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t('cardDescription') || 'Card Description'} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder={t('enterCardDescription') || 'Enter card description...'}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('cardType') || 'Card Type'}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {cardTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('target') || 'Target'}
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {targetTypes.map(target => (
                      <option key={target.value} value={target.value}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intensity */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('intensity') || 'Intensity'}
                  </label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {intensityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('tags') || 'Tags'}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder={t('addTag') || 'Add tag...'}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags Display */}
              {formData.tags.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    {t('currentTags') || 'Current Tags'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm"
                      >
                        <Tag size={12} />
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveCard}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  <span>{t('saveCard') || 'Save Card'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {React.createElement(getCardTypeIcon(card.type), { 
                    size: 20, 
                    className: "text-blue-400" 
                  })}
                  <span className="text-sm font-medium text-gray-300">
                    {cardTypes.find(t => t.value === card.type)?.label || card.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <h3 className="font-semibold mb-2 text-white">{card.title}</h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">{card.description}</p>

              {/* Card Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: getIntensityColor(card.intensity) + '20', color: getIntensityColor(card.intensity) }}
                  >
                    {intensityLevels.find(l => l.value === card.intensity)?.label || `Level ${card.intensity}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {targetTypes.find(t => t.value === card.target)?.label || card.target}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(card.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {card.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      <Tag size={10} />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {card.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{card.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {customCards.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {t('noCustomCards') || 'No custom cards yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('createYourFirstCard') || 'Create your first custom card to get started'}
            </p>
            <button
              onClick={handleCreateCard}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <Plus size={20} />
              <span>{t('createFirstCard') || 'Create First Card'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCardsPage; 