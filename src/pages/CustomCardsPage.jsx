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
  ArrowLeft,
  Layers,
  Eye,
  EyeOff,
  Search,
  Filter,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';
import { cardDeck } from '../data/cards';

const CustomCardsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { 
    customCards, 
    addCustomCard, 
    updateCustomCard, 
    removeCustomCard,
    customDecks,
    createCustomDeck,
    addCardToDeck
  } = useGameStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterIntensity, setFilterIntensity] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Truth',
    target: 'one',
    intensity: 1,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedCardForDeck, setSelectedCardForDeck] = useState(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

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

  const handleAddToDeck = (card) => {
    setSelectedCardForDeck(card);
    setShowDeckModal(true);
    setIsCreatingDeck(false);
    setNewDeckName('');
  };

  const handleSelectDeck = (deckId) => {
    if (selectedCardForDeck) {
      addCardToDeck(deckId, selectedCardForDeck.id);
      setShowDeckModal(false);
      setSelectedCardForDeck(null);
      alert(t('cardAddedToDeck') || 'Card added to deck successfully!');
    }
  };

  const handleCreateNewDeck = () => {
    if (!newDeckName.trim()) {
      alert(t('enterDeckName') || 'Please enter deck name');
      return;
    }
    const newDeckId = createCustomDeck({
      name: newDeckName.trim(),
      description: '',
      isPublic: false,
      tags: []
    });
    if (selectedCardForDeck) {
      addCardToDeck(newDeckId, selectedCardForDeck.id);
      setShowDeckModal(false);
      setSelectedCardForDeck(null);
      setIsCreatingDeck(false);
      setNewDeckName('');
      alert(t('cardAddedToDeck') || 'Card added to deck successfully!');
    }
  };

  // Get all cards (built-in + custom) with filtering
  const allCards = [...(cardDeck || []), ...(customCards || [])];
  const displayCards = showAllCards ? allCards : customCards;

  // Filter cards based on search and filters
  const filteredCards = displayCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || card.type === filterType;
    const matchesIntensity = !filterIntensity || card.intensity === parseInt(filterIntensity);

    return matchesSearch && matchesType && matchesIntensity;
  });

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
              {showAllCards ? (t('allCards') || 'All Cards') : (t('customCards') || 'Custom Cards')}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAllCards(!showAllCards)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAllCards
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {showAllCards ? <EyeOff size={20} /> : <Eye size={20} />}
              <span>{showAllCards ? (t('showCustom') || 'Show Custom') : (t('showAll') || 'Show All')}</span>
            </button>
            <button
              onClick={() => navigate('/custom-decks')}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Layers size={20} />
              <span>{t('manageDecks') || 'Manage Decks'}</span>
            </button>
            {!showAllCards && (
              <button
                onClick={handleCreateCard}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>{t('createCard') || 'Create Card'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Search and Filter Bar */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('searchCards') || 'Search cards...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">{t('allTypes') || 'All Types'}</option>
                {cardTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterIntensity}
                onChange={(e) => setFilterIntensity(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">{t('allIntensities') || 'All Intensities'}</option>
                {intensityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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

        {/* Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
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
                  {showAllCards && (
                    <button
                      onClick={() => handleAddToDeck(card)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title={t('addToDeck') || 'Add to Deck'}
                    >
                      <BookOpen size={16} className="text-purple-400" />
                    </button>
                  )}
                  {!showAllCards && (
                    <button
                      onClick={() => handleEditCard(card)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit size={16} className="text-blue-400" />
                    </button>
                  )}
                  {!showAllCards && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  )}
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
                {card.updatedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(card.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Tags */}
              {(card.tags || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(card.tags || []).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      <Tag size={10} />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {(card.tags || []).length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{(card.tags || []).length - 3} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Deck Selection Modal */}
        <AnimatePresence>
          {showDeckModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => {
                setShowDeckModal(false);
                setSelectedCardForDeck(null);
                setIsCreatingDeck(false);
                setNewDeckName('');
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {isCreatingDeck 
                      ? (t('createNewDeck') || 'Create New Deck')
                      : (t('selectDeck') || 'Select Deck')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeckModal(false);
                      setSelectedCardForDeck(null);
                      setIsCreatingDeck(false);
                      setNewDeckName('');
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {!isCreatingDeck ? (
                  <>
                    {customDecks.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">
                          {t('noDecksAvailable') || 'No decks available'}
                        </p>
                        <button
                          onClick={() => setIsCreatingDeck(true)}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors mx-auto"
                        >
                          <Plus size={20} />
                          <span>{t('createNewDeck') || 'Create New Deck'}</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 max-h-64 overflow-y-auto">
                          {customDecks.map((deck) => (
                            <button
                              key={deck.id}
                              onClick={() => handleSelectDeck(deck.id)}
                              className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg mb-2 transition-colors"
                            >
                              <div className="font-medium">{deck.name}</div>
                              {deck.description && (
                                <div className="text-sm text-gray-400 mt-1">{deck.description}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {(deck.cards || []).length} {t('cards') || 'cards'}
                              </div>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setIsCreatingDeck(true)}
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Plus size={20} />
                          <span>{t('createNewDeck') || 'Create New Deck'}</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('deckName') || 'Deck Name'} *
                    </label>
                    <input
                      type="text"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 mb-4"
                      placeholder={t('enterDeckName') || 'Enter deck name...'}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateNewDeck}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Save size={20} />
                        <span>{t('createAndAdd') || 'Create and Add'}</span>
                      </button>
                      <button
                        onClick={() => setIsCreatingDeck(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {t('cancel') || 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredCards.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {showAllCards
                ? (t('noCardsFound') || 'No cards found')
                : (t('noCustomCards') || 'No custom cards yet')
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {showAllCards
                ? (t('tryDifferentFilters') || 'Try different search terms or filters')
                : (t('createYourFirstCard') || 'Create your first custom card to get started')
              }
            </p>
            {!showAllCards && (
              <button
                onClick={handleCreateCard}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors mx-auto"
              >
                <Plus size={20} />
                <span>{t('createFirstCard') || 'Create First Card'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCardsPage; 