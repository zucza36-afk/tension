import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Settings, Play, ArrowLeft, Plus, X, Sliders, Wifi, WifiOff } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import Chat from '../components/Chat'
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
    sessionId,
    isOnlineSession,
    gameMode,
    maxIntensity,
    consensualFilter,
    intensityEscalation,
    setGameMode,
    setMaxIntensity,
    setConsensualFilter,
    setIntensityEscalation,
    startGame,
    aiBotEnabled,
    setAIBotEnabled
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
    <div className="min-h-screen gradient-bg p-3 md:p-4 pb-6 md:pb-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('back')}</span>
          </button>

          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-serif text-white mb-3">{t('gameSetup')}</h1>
            {sessionCode && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300 text-sm">{t('sessionCode')}:</span>
                  <span className="font-mono text-lg md:text-xl font-bold text-purple-400 tracking-wider">{sessionCode}</span>
                </div>
                {isOnlineSession ? (
                  <div className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-gray-700/50 border border-gray-600/30 rounded-lg px-2 py-1">
                    <WifiOff className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Lokalnie</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('settings')}</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Players Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 md:p-6"
          >
            <h2 className="text-xl md:text-2xl font-serif text-white mb-4 md:mb-6 flex items-center space-x-3">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span>{t('players')} ({players.length})</span>
            </h2>

            {/* Add Player Form */}
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              <div>
                <label className="block text-gray-300 mb-2 text-sm md:text-base">{t('nickname')}</label>
                <input
                  type="text"
                  value={newPlayer.nickname}
                  onChange={(e) => setNewPlayer({ ...newPlayer, nickname: e.target.value })}
                  placeholder={t('nicknamePlaceholder')}
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm md:text-base"
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
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
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-serif text-white mb-4 md:mb-6 flex items-center space-x-3">
                <Sliders className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-base md:text-xl">Ustawienia gry</span>
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
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiBotEnabled}
                      onChange={(e) => setAIBotEnabled(e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-white">AI Bot Prowadzący</span>
                    <span className="text-xs text-gray-400">(Komentuje grę i pomaga)</span>
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
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3 text-base md:text-lg"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6" />
              <span>Rozpocznij grę</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
      
      {/* Chat Component */}
      {(sessionId || isOnlineSession) && <Chat />}
    </div>
  )
}

export default SetupPage 