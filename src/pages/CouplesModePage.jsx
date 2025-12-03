import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Clock, 
  Settings, 
  Play, 
  ArrowLeft,
  Star,
  Zap,
  Brain,
  Gamepad2,
  Timer,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

const CouplesModePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { 
    initializeGame, 
    startGame, 
    updateSettings,
    customCards 
  } = useGameStore();
  
  const [gameSettings, setGameSettings] = useState({
    // Card categories
    categories: {
      intimate: true,
      psychological: true,
      fun: true,
      romantic: true,
      adventurous: false
    },
    
    // Game duration
    roundDuration: 30, // seconds
    totalRounds: 10,
    timeLimit: true,
    
    // Card limits
    maxQuestions: 5,
    maxChallenges: 5,
    maxIntensity: 3,
    
    // Custom cards
    includeCustomCards: true,
    customCardsOnly: false,
    
    // Game rules
    allowSkip: true,
    allowSafeWord: true,
    intensityEscalation: true,
    
    // Couple specific
    partnerMode: true,
    sharedExperience: true,
    intimacyLevel: 'moderate' // low, moderate, high
  });

  const t = (key) => getTranslation(key, language);

  const cardCategories = [
    { 
      key: 'intimate', 
      label: t('intimate') || 'Intimate', 
      icon: Heart, 
      color: '#EF4444',
      description: t('intimateDesc') || 'Deep personal questions and intimate activities'
    },
    { 
      key: 'psychological', 
      label: t('psychological') || 'Psychological', 
      icon: Brain, 
      color: '#8B5CF6',
      description: t('psychologicalDesc') || 'Mind games and psychological challenges'
    },
    { 
      key: 'fun', 
      label: t('fun') || 'Fun', 
      icon: Gamepad2, 
      color: '#10B981',
      description: t('funDesc') || 'Light-hearted and entertaining activities'
    },
    { 
      key: 'romantic', 
      label: t('romantic') || 'Romantic', 
      icon: Star, 
      color: '#F59E0B',
      description: t('romanticDesc') || 'Sweet and romantic moments'
    },
    { 
      key: 'adventurous', 
      label: t('adventurous') || 'Adventurous', 
      icon: Zap, 
      color: '#3B82F6',
      description: t('adventurousDesc') || 'Bold and exciting challenges'
    }
  ];

  const intimacyLevels = [
    { value: 'low', label: t('lowIntimacy') || 'Low', color: '#10B981' },
    { value: 'moderate', label: t('moderateIntimacy') || 'Moderate', color: '#F59E0B' },
    { value: 'high', label: t('highIntimacy') || 'High', color: '#EF4444' }
  ];

  const handleCategoryToggle = (category) => {
    setGameSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const handleSettingChange = (setting, value) => {
    setGameSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleStartGame = () => {
    // Validate settings
    const selectedCategories = Object.values(gameSettings.categories).filter(Boolean);
    if (selectedCategories.length === 0) {
      alert(t('selectAtLeastOneCategory') || 'Please select at least one card category');
      return;
    }

    if (gameSettings.customCardsOnly && customCards.length === 0) {
      alert(t('noCustomCardsAvailable') || 'No custom cards available. Please create some cards first.');
      return;
    }

    // Initialize game with couple mode settings
    initializeGame();
    updateSettings({
      gameMode: 'couples',
      ...gameSettings
    });

    // Navigate to game
    navigate('/game');
  };

  const getSelectedCategoriesCount = () => {
    return Object.values(gameSettings.categories).filter(Boolean).length;
  };

  const getAvailableCardsCount = () => {
    // Mock calculation - in real app this would filter actual cards
    const baseCards = 50; // System cards
    const customCardsCount = gameSettings.includeCustomCards ? customCards.length : 0;
    return gameSettings.customCardsOnly ? customCardsCount : baseCards + customCardsCount;
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
            <div className="flex items-center space-x-2">
              <Heart size={24} className="text-red-400" />
              <h1 className="text-xl font-bold">
                {t('couplesMode') || 'Couples Mode'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {t('availableCards') || 'Available Cards'}: {getAvailableCardsCount()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Game Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Target size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold">
                {t('cardCategories') || 'Card Categories'}
              </h2>
            </div>
            
            <div className="space-y-3">
              {cardCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.key}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      gameSettings.categories[category.key]
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                    onClick={() => handleCategoryToggle(category.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon size={20} style={{ color: category.color }} />
                        <div>
                          <h3 className="font-medium">{category.label}</h3>
                          <p className="text-sm text-gray-400">{category.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        gameSettings.categories[category.key]
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {gameSettings.categories[category.key] && (
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">
                {t('selectedCategories') || 'Selected'}: {getSelectedCategoriesCount()} / {cardCategories.length}
              </p>
            </div>
          </motion.div>

          {/* Game Duration & Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Clock size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold">
                {t('gameDuration') || 'Game Duration & Rules'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Round Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('roundDuration') || 'Round Duration'} ({gameSettings.roundDuration}s)
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={gameSettings.roundDuration}
                  onChange={(e) => handleSettingChange('roundDuration', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>15s</span>
                  <span>60s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Total Rounds */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('totalRounds') || 'Total Rounds'}: {gameSettings.totalRounds}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={gameSettings.totalRounds}
                  onChange={(e) => handleSettingChange('totalRounds', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                </div>
              </div>

              {/* Max Intensity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('maxIntensity') || 'Maximum Intensity'}: {gameSettings.maxIntensity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={gameSettings.maxIntensity}
                  onChange={(e) => handleSettingChange('maxIntensity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{t('mild') || 'Mild'}</span>
                  <span>{t('moderate') || 'Moderate'}</span>
                  <span>{t('extreme') || 'Extreme'}</span>
                </div>
              </div>

              {/* Intimacy Level */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('intimacyLevel') || 'Intimacy Level'}
                </label>
                <div className="flex space-x-2">
                  {intimacyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleSettingChange('intimacyLevel', level.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                        gameSettings.intimacyLevel === level.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-sm font-medium" style={{ color: level.color }}>
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Custom Cards Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Star size={20} className="text-yellow-400" />
              <h2 className="text-lg font-semibold">
                {t('customCards') || 'Custom Cards'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Include Custom Cards */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('includeCustomCards') || 'Include Custom Cards'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('includeCustomCardsDesc') || 'Use your own created cards in the game'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('includeCustomCards', !gameSettings.includeCustomCards)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.includeCustomCards ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.includeCustomCards ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Custom Cards Only */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('customCardsOnly') || 'Custom Cards Only'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('customCardsOnlyDesc') || 'Play only with your own cards'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('customCardsOnly', !gameSettings.customCardsOnly)}
                  disabled={!gameSettings.includeCustomCards}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.customCardsOnly && gameSettings.includeCustomCards ? 'bg-blue-500' : 'bg-gray-600'
                  } ${!gameSettings.includeCustomCards ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.customCardsOnly && gameSettings.includeCustomCards ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Custom Cards Count */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('availableCustomCards') || 'Available Custom Cards'}</span>
                  <span className="text-sm text-blue-400">{customCards.length}</span>
                </div>
                {customCards.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t('noCustomCardsYet') || 'No custom cards yet. Create some in the Custom Cards section.'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Game Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Settings size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold">
                {t('gameRules') || 'Game Rules'}
              </h2>
            </div>
            
            <div className="space-y-3">
              {/* Allow Skip */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('allowSkip') || 'Allow Skip Cards'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('allowSkipDesc') || 'Players can skip cards they don\'t want to do'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowSkip', !gameSettings.allowSkip)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.allowSkip ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.allowSkip ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Allow Safe Word */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('allowSafeWord') || 'Allow Safe Word'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('allowSafeWordDesc') || 'Players can use safe word to pause the game'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowSafeWord', !gameSettings.allowSafeWord)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.allowSafeWord ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.allowSafeWord ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Intensity Escalation */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('intensityEscalation') || 'Intensity Escalation'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('intensityEscalationDesc') || 'Cards get more intense as the game progresses'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('intensityEscalation', !gameSettings.intensityEscalation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.intensityEscalation ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.intensityEscalation ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Game Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleStartGame}
              disabled={getSelectedCategoriesCount() === 0}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl text-lg font-semibold transition-all ${
                getSelectedCategoriesCount() === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <Heart size={24} />
              <span>{t('startCouplesGame') || 'Start Couples Game'}</span>
              <Play size={24} />
            </button>

            <button
              onClick={() => navigate('/intimate-guessing')}
              className="flex items-center space-x-3 px-6 py-4 rounded-xl text-lg font-semibold transition-all bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
            >
              <Target size={24} />
              <span>{t('intimateGuessingGame') || 'Intimate Guessing Game'}</span>
              <Brain size={24} />
            </button>
          </div>
          
          {getSelectedCategoriesCount() === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {t('selectAtLeastOneCategory') || 'Please select at least one card category'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CouplesModePage; 