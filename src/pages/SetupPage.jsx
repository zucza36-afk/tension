import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Settings, Play, ArrowLeft, Plus, X, Sliders, Wifi, WifiOff } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import toast from 'react-hot-toast'

const SetupPage = () => {
  const navigate = useNavigate()
  const { language } = useLanguageStore()
  const { 
    players, 
    addPlayer, 
    removePlayer, 
    updatePlayer,
    sessionCode,
    isOnlineSession,
    gameMode,
    maxIntensity,
    consensualFilter,
    intensityEscalation,
    setGameMode,
    setMaxIntensity,
    setConsensualFilter,
    setIntensityEscalation,
    startGame
  } = useGameStore()

  const [newPlayer, setNewPlayer] = useState({ nickname: '', comfortLevel: 3 })
  const [showSettings, setShowSettings] = useState(false)

  const t = (key) => getTranslation(key, language)

  const handleAddPlayer = async () => {
    if (!newPlayer.nickname.trim()) {
      toast.error(t('enterNickname') || 'Wprowadź pseudonim')
      return
    }

    if (players.some(p => p.nickname.toLowerCase() === newPlayer.nickname.toLowerCase())) {
      toast.error(t('playerExists') || 'Gracz już istnieje')
      return
    }

    try {
      await addPlayer({
        nickname: newPlayer.nickname.trim(),
        comfortLevel: newPlayer.comfortLevel,
        isActive: true
      })

      setNewPlayer({ nickname: '', comfortLevel: 3 })
      toast.success(t('playerAdded') || 'Gracz dodany')
    } catch (error) {
      console.error('Error adding player:', error)
      toast.error(t('errorAddingPlayer') || 'Błąd dodawania gracza')
    }
  }

  const handleStartGame = async () => {
    if (players.length < 2) {
      toast.error(t('needMinPlayers') || 'Potrzeba minimum 2 graczy')
      return
    }

    try {
      await startGame()
      navigate('/game')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getIntensityColor = (level) => {
    const colors = {
      1: 'text-green-400',
      2: 'text-yellow-400', 
      3: 'text-orange-400',
      4: 'text-red-400',
      5: 'text-purple-400'
    }
    return colors[level] || 'text-gray-400'
  }

  const getIntensityLabel = (level) => {
    const labels = {
      1: t('intensity1'),
      2: t('intensity2'),
      3: t('intensity3'),
      4: t('intensity4'),
      5: t('intensity5')
    }
    return labels[level] || 'Unknown'
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* DEBUG: Show page loaded */}
        <div style={{position: 'fixed', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px', zIndex: 9999}}>
          SETUP PAGE LOADED
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-dark-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back')}</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-serif text-white mb-2">{t('gameSetup')}</h1>
            {sessionCode && (
              <div className="flex items-center justify-center space-x-2">
                <p className="text-dark-300">{t('sessionCode')}: <span className="font-mono text-accent-400">{sessionCode}</span></p>
                {isOnlineSession ? (
                  <div className="flex items-center space-x-1 text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-dark-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs">Lokalnie</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 text-dark-200 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>{t('settings')}</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-800/50 glass-effect rounded-lg p-6"
          >
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <span>{t('players')} ({players.length})</span>
            </h2>

            {/* Add Player Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-dark-200 mb-2">{t('nickname')}</label>
                <input
                  type="text"
                  value={newPlayer.nickname}
                  onChange={(e) => setNewPlayer({ ...newPlayer, nickname: e.target.value })}
                  placeholder={t('nicknamePlaceholder')}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-dark-200 mb-2">
                  {t('comfortLevel')}: {getIntensityLabel(newPlayer.comfortLevel)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newPlayer.comfortLevel}
                  onChange={(e) => setNewPlayer({ ...newPlayer, comfortLevel: parseInt(e.target.value) })}
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-dark-400 mt-1">
                  <span>{t('mild')}</span>
                  <span>{t('extreme')}</span>
                </div>
              </div>

              <button
                onClick={handleAddPlayer}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{t('addPlayer')}</span>
              </button>
            </div>

            {/* Players List */}
            <div className="space-y-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-700/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.nickname}</p>
                      <p className={`text-sm ${getIntensityColor(player.comfortLevel)}`}>
                        {getIntensityLabel(player.comfortLevel)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Game Settings */}
            <div className="bg-dark-800/50 glass-effect rounded-lg p-6">
              <h2 className="text-2xl font-serif text-white mb-6 flex items-center space-x-3">
                <Sliders className="w-6 h-6" />
                <span>Ustawienia gry</span>
              </h2>

              <div className="space-y-6">
                {/* Game Mode */}
                <div>
                  <label className="block text-dark-200 mb-3">Tryb gry</label>
                  <div className="space-y-2">
                    {[
                      { value: 'classic', label: 'Klasyczny', desc: 'Tury z kartami dla osób, par lub grupy' },
                      { value: 'elimination', label: 'Eliminacja', desc: 'Głosowanie usuwa graczy lub zwiększa wyzwania' },
                      { value: 'freeplay', label: 'Swobodny', desc: 'Karty pojawiają się bez struktury tur' }
                    ].map((mode) => (
                      <label key={mode.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="gameMode"
                          value={mode.value}
                          checked={gameMode === mode.value}
                          onChange={(e) => setGameMode(e.target.value)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="text-white font-semibold">{mode.label}</p>
                          <p className="text-dark-300 text-sm">{mode.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Intensity */}
                <div>
                  <label className="block text-dark-200 mb-2">
                    Maksymalna intensywność: {getIntensityLabel(maxIntensity)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={maxIntensity}
                    onChange={(e) => setMaxIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-dark-400 mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consensualFilter}
                      onChange={(e) => setConsensualFilter(e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-white">Filtr konsensualny</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intensityEscalation}
                      onChange={(e) => setIntensityEscalation(e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-white">Eskalacja intensywności</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Start Game Button */}
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="w-full bg-accent-600 hover:bg-accent-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <Play className="w-6 h-6" />
              <span>Rozpocznij grę</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SetupPage 