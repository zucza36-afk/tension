import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Users, 
  Play, 
  ArrowLeft, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff,
  Settings,
  UserPlus,
  Star,
  Zap,
  Brain,
  Gamepad2,
  Target,
  Clock,
  Plus,
  X
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import Chat from '../components/Chat'
import toast from 'react-hot-toast'

const CouplesLobbyPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguageStore()
  const {
    players,
    sessionCode,
    sessionId,
    isOnlineSession,
    localPlayerId,
    gameMode,
    maxIntensity,
    totalRounds,
    intensityEscalation,
    addPlayer,
    removePlayer,
    startGame,
    joinSession
  } = useGameStore()

  const [isHost, setIsHost] = useState(location.state?.isHost || false)
  const [gameSettings, setGameSettings] = useState(location.state?.gameSettings || null)
  const [copied, setCopied] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [newPlayer, setNewPlayer] = useState({ nickname: '', comfortLevel: 3 })

  const t = (key) => getTranslation(key, language)

  useEffect(() => {
    // Jeśli nie jesteś hostem i nie masz sesji, pokaż modal dołączenia
    if (!isHost && !sessionCode && !isOnlineSession) {
      setShowJoinModal(true)
    }
  }, [isHost, sessionCode, isOnlineSession])

  const handleCopyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode)
      setCopied(true)
      toast.success(t('codeCopied') || 'Kod skopiowany!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast.error(t('enterSessionCode') || 'Wprowadź kod sesji')
      return
    }

    try {
      await joinSession(joinCode.toUpperCase())
      toast.success(t('joinedGame') || 'Dołączono do gry')
      setShowJoinModal(false)
      setIsHost(false)
    } catch (error) {
      console.error('Error joining session:', error)
      toast.error(t('invalidSessionCode') || 'Nieprawidłowy kod sesji')
    }
  }

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
      console.error('Error starting game:', error)
      toast.error(error.message || t('errorStartingGame') || 'Błąd rozpoczynania gry')
    }
  }

  const cardCategories = [
    { key: 'intimate', label: t('intimate') || 'Intimate', icon: Heart, color: '#EF4444' },
    { key: 'psychological', label: t('psychological') || 'Psychological', icon: Brain, color: '#8B5CF6' },
    { key: 'fun', label: t('fun') || 'Fun', icon: Gamepad2, color: '#10B981' },
    { key: 'romantic', label: t('romantic') || 'Romantic', icon: Star, color: '#F59E0B' },
    { key: 'adventurous', label: t('adventurous') || 'Adventurous', icon: Zap, color: '#3B82F6' }
  ]

  const getSelectedCategories = () => {
    if (!gameSettings?.categories) return []
    return Object.entries(gameSettings.categories)
      .filter(([_, selected]) => selected)
      .map(([key]) => key)
  }

  const selectedCategories = getSelectedCategories()

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Header */}
      <div className="bg-gray-800/60 backdrop-blur-md border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/couples-mode')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <Heart size={24} className="text-pink-400" />
              <h1 className="text-xl font-bold">
                {t('couplesLobby') || 'Couples Lobby'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {sessionCode && (
              <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-sm text-gray-300">{t('sessionCode') || 'Kod'}:</span>
                <span className="font-mono text-pink-400 font-bold">{sessionCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="ml-2 p-1 hover:bg-gray-600 rounded transition-colors"
                >
                  {copied ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
            )}
            {isOnlineSession ? (
              <div className="flex items-center space-x-1 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">{t('online') || 'Online'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">{t('local') || 'Local'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Players & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold">
                    {t('players') || 'Players'} ({players.length})
                  </h2>
                </div>
                {isHost && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <UserPlus size={16} />
                    <span>{t('invitePlayer') || 'Zaproś'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg border-2 ${
                        player.id === localPlayerId
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            player.id === localPlayerId
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">
                              {player.nickname}
                              {player.id === localPlayerId && (
                                <span className="ml-2 text-xs text-pink-400">({t('you') || 'You'})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {t('comfortLevel') || 'Comfort'}: {player.comfortLevel || 3}/5
                            </div>
                          </div>
                        </div>
                        {isHost && player.id !== localPlayerId && (
                          <button
                            onClick={() => removePlayer(player.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {players.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>{t('noPlayersYet') || 'Brak graczy. Czekaj na dołączenie...'}</p>
                  </div>
                )}
              </div>

              {/* Add Player Form (for host) */}
              {isHost && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPlayer.nickname}
                      onChange={(e) => setNewPlayer({ ...newPlayer, nickname: e.target.value })}
                      placeholder={t('enterNickname') || 'Wprowadź pseudonim...'}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                    />
                    <button
                      onClick={handleAddPlayer}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Game Settings Preview */}
            {gameSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Settings size={20} className="text-purple-400" />
                  <h2 className="text-lg font-semibold">
                    {t('gameSettings') || 'Game Settings'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target size={16} className="text-blue-400" />
                      <span className="text-sm font-medium">{t('categories') || 'Categories'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((key) => {
                        const category = cardCategories.find(c => c.key === key)
                        if (!category) return null
                        const Icon = category.icon
                        return (
                          <div
                            key={key}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded text-xs"
                            style={{ color: category.color }}
                          >
                            <Icon size={12} />
                            <span>{category.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-sm font-medium">{t('maxIntensity') || 'Max Intensity'}</span>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">{maxIntensity}/5</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock size={16} className="text-green-400" />
                      <span className="text-sm font-medium">{t('totalRounds') || 'Total Rounds'}</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">{totalRounds}</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings size={16} className="text-purple-400" />
                      <span className="text-sm font-medium">{t('intensityEscalation') || 'Escalation'}</span>
                    </div>
                    <div className="text-sm">
                      {intensityEscalation ? (
                        <span className="text-green-400">{t('enabled') || 'Enabled'}</span>
                      ) : (
                        <span className="text-gray-400">{t('disabled') || 'Disabled'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Start Game Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
            >
              <button
                onClick={handleStartGame}
                disabled={players.length < 2 || !isHost}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  players.length < 2 || !isHost
                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl glow-effect'
                }`}
              >
                <Play size={24} />
                <span>{t('startGame') || 'Start Game'}</span>
              </button>

              {players.length < 2 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {t('needMinPlayers') || 'Potrzeba minimum 2 graczy'}
                </p>
              )}

              {!isHost && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {t('waitingForHost') || 'Czekaj na rozpoczęcie przez hosta...'}
                </p>
              )}
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
            >
              <h3 className="font-semibold mb-3">{t('howToPlay') || 'How to Play'}</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {isHost ? (
                  <>
                    <p>• {t('shareCodeWithPlayers') || 'Udostępnij kod sesji innym graczom'}</p>
                    <p>• {t('waitForPlayersToJoin') || 'Czekaj na dołączenie graczy'}</p>
                    <p>• {t('startWhenReady') || 'Rozpocznij grę, gdy wszyscy są gotowi'}</p>
                  </>
                ) : (
                  <>
                    <p>• {t('waitForHostToStart') || 'Czekaj na rozpoczęcie gry przez hosta'}</p>
                    <p>• {t('youCanChat') || 'Możesz czatować z innymi graczami'}</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Chat Component */}
        {isOnlineSession && <Chat />}
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('joinGame') || 'Join Game'}</h2>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('sessionCode') || 'Session Code'}
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    maxLength={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 text-center text-2xl font-mono tracking-widest"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleJoinByCode}
                  className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  {t('join') || 'Join'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CouplesLobbyPage

