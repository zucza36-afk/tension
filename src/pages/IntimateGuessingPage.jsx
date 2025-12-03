import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Target, 
  Brain, 
  Trophy, 
  Clock, 
  Users, 
  ArrowLeft,
  Star,
  Zap,
  Gamepad2,
  Timer,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Settings,
  Play,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCoupleStore } from '../store/coupleStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';
import IntimateGuessingGame from '../components/IntimateGuessingGame';
import IntimateGuessingInterface from '../components/IntimateGuessingInterface';

const IntimateGuessingPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { 
    player1, 
    player2, 
    setPlayer1, 
    setPlayer2,
    getIntimateGuessingCards,
    resetIntimateGuessing
  } = useCoupleStore();
  
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, finished
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    rounds: 5,
    timeLimit: 60,
    showTimer: true,
    allowHints: true,
    scoringSystem: 'accuracy', // accuracy, speed, combined
    privacyMode: false,
    allowSkipping: true,
    intensityLevel: 'moderate' // low, moderate, high
  });

  const t = (key) => getTranslation(key, language);

  const difficultyLevels = [
    { 
      key: 'easy', 
      label: t('easy') || 'Easy', 
      icon: Eye, 
      color: '#10B981',
      description: t('easyDesc') || 'Basic measurements, simple scoring',
      points: 10
    },
    { 
      key: 'medium', 
      label: t('medium') || 'Medium', 
      icon: Target, 
      color: '#F59E0B',
      description: t('mediumDesc') || 'Detailed measurements, bonus points',
      points: 25
    },
    { 
      key: 'hot', 
      label: t('hot') || 'Hot', 
      icon: Zap, 
      color: '#EF4444',
      description: t('hotDesc') || 'Advanced measurements, multipliers',
      points: 50
    }
  ];

  const intensityLevels = [
    { value: 'low', label: t('lowIntensity') || 'Low', color: '#10B981' },
    { value: 'moderate', label: t('moderateIntensity') || 'Moderate', color: '#F59E0B' },
    { value: 'high', label: t('highIntensity') || 'High', color: '#EF4444' }
  ];

  const handlePlayerSetup = (player, data) => {
    if (player === 1) {
      setPlayer1(data);
    } else {
      setPlayer2(data);
    }
  };

  const handleStartGame = () => {
    if (!player1.name || !player2.name) {
      alert(t('enterPlayerNames') || 'Please enter both player names');
      return;
    }
    if (!selectedDifficulty) {
      alert(t('selectDifficulty') || 'Please select a difficulty level');
      return;
    }
    
    setGamePhase('playing');
  };

  const handleGameComplete = () => {
    setGamePhase('finished');
  };

  const handleNewGame = () => {
    resetIntimateGuessing();
    setGamePhase('setup');
    setSelectedDifficulty(null);
  };

  const handleBackToMenu = () => {
    navigate('/couples-mode');
  };

  const getAvailableCardsCount = () => {
    return getIntimateGuessingCards().length;
  };

  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <IntimateGuessingGame 
          difficulty={selectedDifficulty}
          settings={gameSettings}
          onComplete={handleGameComplete}
        />
      </div>
    );
  }

  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToMenu}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <Target size={24} className="text-red-400" />
                <h1 className="text-xl font-bold">
                  {t('intimateGuessingGame') || 'Intimate Guessing Game'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              {t('gameCompleted') || 'Game Completed!'}
            </h2>
            <p className="text-gray-400 mb-8">
              {t('gameCompletedDesc') || 'Congratulations on completing the Intimate Guessing Game!'}
            </p>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleNewGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>{t('playAgain') || 'Play Again'}</span>
              </button>
              <button
                onClick={handleBackToMenu}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>{t('backToMenu') || 'Back to Menu'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
              <Target size={24} className="text-red-400" />
              <h1 className="text-xl font-bold">
                {t('intimateGuessingGame') || 'Intimate Guessing Game'}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Player Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold">
                {t('playerSetup') || 'Player Setup'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Player 1 */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">{t('player1') || 'Player 1'}</h3>
                <input
                  type="text"
                  value={player1.name}
                  onChange={(e) => handlePlayerSetup(1, { ...player1, name: e.target.value })}
                  placeholder={t('enterPlayerName') || 'Enter player name'}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <div className="mt-2 flex space-x-2">
                  {['any', 'male', 'female'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handlePlayerSetup(1, { ...player1, gender })}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        player1.gender === gender
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {t(gender) || gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player 2 */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">{t('player2') || 'Player 2'}</h3>
                <input
                  type="text"
                  value={player2.name}
                  onChange={(e) => handlePlayerSetup(2, { ...player2, name: e.target.value })}
                  placeholder={t('enterPlayerName') || 'Enter player name'}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <div className="mt-2 flex space-x-2">
                  {['any', 'male', 'female'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handlePlayerSetup(2, { ...player2, gender })}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        player2.gender === gender
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {t(gender) || gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Difficulty Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Target size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold">
                {t('difficultyLevel') || 'Difficulty Level'}
              </h2>
            </div>
            
            <div className="space-y-3">
              {difficultyLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <div
                    key={level.key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDifficulty === level.key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedDifficulty(level.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon size={20} style={{ color: level.color }} />
                        <div>
                          <h3 className="font-medium">{level.label}</h3>
                          <p className="text-sm text-gray-400">{level.description}</p>
                          <p className="text-xs text-gray-500">
                            {t('maxPoints') || 'Max Points'}: {level.points}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedDifficulty === level.key
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {selectedDifficulty === level.key && (
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
          </motion.div>

          {/* Game Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Settings size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold">
                {t('gameSettings') || 'Game Settings'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Rounds */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('numberOfRounds') || 'Number of Rounds'}: {gameSettings.rounds}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={gameSettings.rounds}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, rounds: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                  <span>10</span>
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('timeLimit') || 'Time Limit'} ({gameSettings.timeLimit}s)
                </label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={gameSettings.timeLimit}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Intensity Level */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('intensityLevel') || 'Intensity Level'}
                </label>
                <div className="flex space-x-2">
                  {intensityLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setGameSettings(prev => ({ ...prev, intensityLevel: level.value }))}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                        gameSettings.intensityLevel === level.value
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

              {/* Privacy Mode */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">{t('privacyMode') || 'Privacy Mode'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('privacyModeDesc') || 'Hide sensitive information during gameplay'}
                  </p>
                </div>
                <button
                  onClick={() => setGameSettings(prev => ({ ...prev, privacyMode: !prev.privacyMode }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameSettings.privacyMode ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    gameSettings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Game Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Star size={20} className="text-yellow-400" />
              <h2 className="text-lg font-semibold">
                {t('gameFeatures') || 'Game Features'}
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <Trophy size={20} className="text-yellow-400" />
                <div>
                  <h3 className="font-medium">{t('accuracyScoring') || 'Accuracy Scoring'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('accuracyScoringDesc') || 'Points based on how close your guess is'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <Timer size={20} className="text-green-400" />
                <div>
                  <h3 className="font-medium">{t('timeBonus') || 'Time Bonus'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('timeBonusDesc') || 'Extra points for quick responses'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <TrendingUp size={20} className="text-blue-400" />
                <div>
                  <h3 className="font-medium">{t('progressiveDifficulty') || 'Progressive Difficulty'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('progressiveDifficultyDesc') || 'Challenges get harder as you progress'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <Award size={20} className="text-purple-400" />
                <div>
                  <h3 className="font-medium">{t('achievementSystem') || 'Achievement System'}</h3>
                  <p className="text-sm text-gray-400">
                    {t('achievementSystemDesc') || 'Unlock achievements for special performances'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Start Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={handleStartGame}
            disabled={!player1.name || !player2.name || !selectedDifficulty}
            className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all mx-auto ${
              !player1.name || !player2.name || !selectedDifficulty
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Target size={24} />
            <span>{t('startIntimateGuessing') || 'Start Intimate Guessing Game'}</span>
            <Play size={24} />
          </button>
          
          {(!player1.name || !player2.name || !selectedDifficulty) && (
            <p className="text-sm text-gray-400 mt-2">
              {t('completeSetup') || 'Please complete the setup to start the game'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default IntimateGuessingPage; 