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
  Play,
  Settings,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';
import { cardDeck } from '../data/cards';

const CustomDecksPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const {
    customDecks,
    customCards,
    cardDeck,
    createCustomDeck,
    updateCustomDeck,
    removeCustomDeck,
    addCardToDeck,
    removeCardFromDeck,
    getDeckCards,
    setSelectedDeck
  } = useGameStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [selectedDeck, setSelectedDeckState] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const t = (key) => getTranslation(key, language);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      tags: []
    });
    setNewTag('');
  };

  const handleCreateDeck = () => {
    setIsCreating(true);
    setEditingDeck(null);
    setSelectedDeckState(null);
    resetForm();
  };

  const handleEditDeck = (deck) => {
    setEditingDeck(deck);
    setIsCreating(false);
    setSelectedDeckState(null);
    setFormData({
      name: deck.name,
      description: deck.description,
      isPublic: deck.isPublic,
      tags: [...deck.tags]
    });
  };

  const handleViewDeck = (deck) => {
    setSelectedDeckState(deck);
    setIsCreating(false);
    setEditingDeck(null);
  };

  const handleSaveDeck = () => {
    if (!formData.name.trim()) {
      alert(t('enterDeckName') || 'Please enter deck name');
      return;
    }

    const deckData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isPublic: formData.isPublic,
      tags: formData.tags,
      cards: editingDeck ? editingDeck.cards : []
    };

    if (editingDeck) {
      updateCustomDeck({ ...editingDeck, ...deckData });
    } else {
      createCustomDeck(deckData);
    }

    setIsCreating(false);
    setEditingDeck(null);
    resetForm();
  };

  const handleDeleteDeck = (deckId) => {
    if (confirm(t('confirmDeleteDeck') || 'Are you sure you want to delete this deck?')) {
      removeCustomDeck(deckId);
      if (selectedDeck && selectedDeck.id === deckId) {
        setSelectedDeckState(null);
      }
    }
  };

  const handleUseDeck = (deck) => {
    setSelectedDeck(deck.id);
    navigate('/setup');
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

  // Get all available cards (built-in + custom)
  const allCards = [...(cardDeck || []), ...(customCards || [])];

  // Filter decks based on search and tag
  const filteredDecks = customDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || deck.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = [...new Set(customDecks.flatMap(deck => deck.tags))];

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
              {t('customDecks') || 'Custom Decks'}
            </h1>
          </div>
          <button
            onClick={handleCreateDeck}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>{t('createDeck') || 'Create Deck'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('searchDecks') || 'Search decks...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">{t('allTags') || 'All Tags'}</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="flex bg-gray-800 border border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'} rounded-l-lg transition-colors`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'} rounded-r-lg transition-colors`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Deck Creation/Edit Form */}
        <AnimatePresence>
          {(isCreating || editingDeck) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingDeck ? t('editDeck') || 'Edit Deck' : t('createNewDeck') || 'Create New Deck'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingDeck(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t('deckName') || 'Deck Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t('enterDeckName') || 'Enter deck name...'}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t('deckDescription') || 'Deck Description'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder={t('enterDeckDescription') || 'Enter deck description...'}
                  />
                </div>

                {/* Public/Private */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-600"
                    />
                    <span className="text-sm font-medium">
                      {t('publicDeck') || 'Public Deck'}
                    </span>
                  </label>
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
                  onClick={handleSaveDeck}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  <span>{t('saveDeck') || 'Save Deck'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deck Detail View */}
        <AnimatePresence>
          {selectedDeck && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedDeck.name}</h2>
                  <p className="text-gray-400">{selectedDeck.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUseDeck(selectedDeck)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play size={16} />
                    <span>{t('useDeck') || 'Use Deck'}</span>
                  </button>
                  <button
                    onClick={() => handleEditDeck(selectedDeck)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => setSelectedDeckState(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Deck Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedDeck.cards.length}</div>
                  <div className="text-sm text-gray-400">{t('cards') || 'Cards'}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {getDeckCards(selectedDeck.id).filter(c => c.intensity <= 2).length}
                  </div>
                  <div className="text-sm text-gray-400">{t('gentle') || 'Gentle'}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {getDeckCards(selectedDeck.id).filter(c => c.intensity >= 3 && c.intensity <= 4).length}
                  </div>
                  <div className="text-sm text-gray-400">{t('intense') || 'Intense'}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {getDeckCards(selectedDeck.id).filter(c => c.intensity === 5).length}
                  </div>
                  <div className="text-sm text-gray-400">{t('extreme') || 'Extreme'}</div>
                </div>
              </div>

              {/* Deck Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDeckCards(selectedDeck.id).map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-blue-400">{card.type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        card.intensity === 1 ? 'bg-green-600' :
                        card.intensity === 2 ? 'bg-blue-600' :
                        card.intensity === 3 ? 'bg-purple-600' :
                        card.intensity === 4 ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {card.intensity}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">{card.title}</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">{card.description}</p>
                    <button
                      onClick={() => removeCardFromDeck(selectedDeck.id, card.id)}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      {t('removeFromDeck') || 'Remove from Deck'}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Add Cards Section */}
              <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('addCardsToDeck') || 'Add Cards to Deck'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCards.filter(card => !selectedDeck.cards.includes(card.id)).slice(0, 12).map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer"
                      onClick={() => addCardToDeck(selectedDeck.id, card.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-blue-400">{card.type}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          card.intensity === 1 ? 'bg-green-600' :
                          card.intensity === 2 ? 'bg-blue-600' :
                          card.intensity === 3 ? 'bg-purple-600' :
                          card.intensity === 4 ? 'bg-orange-600' : 'bg-red-600'
                        }`}>
                          {card.intensity}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{card.title}</h4>
                      <p className="text-sm text-gray-300 line-clamp-2">{card.description}</p>
                      <div className="mt-2 text-blue-400 text-sm">
                        {t('clickToAdd') || 'Click to Add'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decks Grid/List */}
        {!selectedDeck && (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredDecks.map((deck) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Deck Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {deck.isPublic ? (
                        <Eye className="text-green-400" size={20} />
                      ) : (
                        <EyeOff className="text-gray-400" size={20} />
                      )}
                      <h3 className="font-semibold">{deck.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewDeck(deck)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Eye size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleEditDeck(deck)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Deck Content */}
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{deck.description}</p>

                  {/* Deck Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{deck.cards.length} {t('cards') || 'cards'}</span>
                      <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleUseDeck(deck)}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition-colors text-sm"
                    >
                      <Play size={14} />
                      <span>{t('use') || 'Use'}</span>
                    </button>
                  </div>

                  {/* Tags */}
                  {deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {deck.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          <Tag size={10} />
                          <span>{tag}</span>
                        </span>
                      ))}
                      {deck.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{deck.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredDecks.length === 0 && !isCreating && !selectedDeck && (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {t('noCustomDecks') || 'No custom decks yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('createYourFirstDeck') || 'Create your first custom deck to get started'}
            </p>
            <button
              onClick={handleCreateDeck}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <Plus size={20} />
              <span>{t('createFirstDeck') || 'Create First Deck'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDecksPage;
