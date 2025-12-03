import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Users, Play, Settings, Shield, Star, Plus, Brain, Target, Layers, Eye, X, DoorOpen } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import CreateRoomModal from '../components/CreateRoomModal'
import OpenRoomsList from '../components/OpenRoomsList'
import PlayerJoinNotification from '../components/PlayerJoinNotification'
import toast from 'react-hot-toast'

const HomePage = () => {
  const navigate = useNavigate()
  const { createSession, joinSession } = useGameStore()
  const { language } = useLanguageStore()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [sessionCode, setSessionCode] = useState('')

  const t = (key) => getTranslation(key, language)

  const handleCreateGame = async () => {
    try {
      // Create session first
      const { sessionId, sessionCode: newSessionCode } = await createSession()
      console.log('[HomePage] Session created:', { sessionId, sessionCode: newSessionCode })
      toast.success(t('sessionCreated') || `Sesja utworzona! Kod: ${newSessionCode}`)
      navigate('/setup')
    } catch (error) {
      console.error('[HomePage] Error creating session:', error)
      // Still navigate to setup even if session creation fails
      navigate('/setup')
    }
  }

  const handleCreateRoom = async (settings) => {
    try {
      const { sessionId, sessionCode: newSessionCode } = await createSession(settings)
      console.log('[HomePage] Room created:', { sessionId, sessionCode: newSessionCode })
      toast.success(t('roomCreated') || `Pokój utworzony! Kod: ${newSessionCode}`)
      navigate('/setup')
    } catch (error) {
      console.error('[HomePage] Error creating room:', error)
      toast.error(t('errorCreatingRoom') || 'Błąd tworzenia pokoju')
    }
  }

  const handleJoinGame = async () => {
    if (sessionCode.trim().length === 0) {
      toast.error(t('enterSessionCode') || 'Wprowadź kod sesji')
      return
    }
    
    try {
      await joinSession(sessionCode.toUpperCase())
      toast.success(t('joinedGame') || 'Dołączono do gry')
      navigate('/setup')
    } catch (error) {
      console.error('Error joining game:', error)
      toast.error(t('invalidSessionCode') || 'Nieprawidłowy kod sesji')
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-3 md:p-4 py-8 md:py-12 relative">
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl"></div>
            <Heart className="w-20 h-20 md:w-24 md:h-24 text-purple-400 relative z-10 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
          </div>
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white text-shadow-lg mb-4 md:mb-6 tracking-tight px-2">
          {t('gameTitle')}
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
          {t('gameSubtitle')}
        </p>
      </motion.div>

      {/* Main Actions */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-2xl space-y-4 md:space-y-6 px-2"
      >
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('[HomePage] Button clicked')
              handleCreateGame()
            }}
            type="button"
            className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden glow-effect text-base md:text-lg"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span>{t('createGame') || 'Utwórz grę'}</span>
          </button>

          <button
            onClick={() => setShowCreateRoomModal(true)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center space-x-3 group relative overflow-hidden glow-effect text-base md:text-lg"
          >
            <DoorOpen className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span>{t('createRoom') || 'Utwórz pokój'}</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group text-base md:text-lg"
          >
            <Users className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span>{t('joinGame')}</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-8 w-full">
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/couples-mode')}
            className="bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md glow-border text-white font-medium py-4 md:py-6 px-2 md:px-4 rounded-xl md:rounded-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-2 md:space-y-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-2 md:p-3 bg-pink-500/20 rounded-lg md:rounded-xl group-hover:bg-pink-500/30 transition-colors relative z-10">
              <Heart className="w-5 h-5 md:w-7 md:h-7 text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
            </div>
            <span className="text-xs md:text-sm font-semibold relative z-10 text-center">{t('couplesMode') || 'Couples Mode'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/intimate-guessing')}
            className="bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md glow-border text-white font-medium py-6 px-4 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors relative z-10">
              <Target className="w-7 h-7 text-purple-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            </div>
            <span className="text-sm font-semibold relative z-10">{t('intimateGuessingGame') || 'Intimate Guessing'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/custom-cards')}
            className="bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md glow-border text-white font-medium py-6 px-4 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors relative z-10">
              <Eye className="w-7 h-7 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            </div>
            <span className="text-sm font-semibold relative z-10">{t('browseCards') || 'Browse Cards'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/custom-decks')}
            className="bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md glow-border text-white font-medium py-4 md:py-6 px-2 md:px-4 rounded-xl md:rounded-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-2 md:space-y-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-2 md:p-3 bg-amber-500/20 rounded-lg md:rounded-xl group-hover:bg-amber-500/30 transition-colors relative z-10">
              <Layers className="w-5 h-5 md:w-7 md:h-7 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            </div>
            <span className="text-xs md:text-sm font-semibold relative z-10 text-center">{t('customDecks') || 'Custom Decks'}</span>
          </motion.button>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-emerald-500 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center space-x-3 group relative overflow-hidden glow-effect text-base md:text-lg"
          >
            <Brain className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span>{t('biofeedbackMode') || 'Biofeedback Mode'}</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Open Rooms Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-8 md:mt-12 w-full max-w-4xl mx-auto px-2"
      >
        <OpenRoomsList />
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto w-full px-2"
      >
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          className="text-center bg-gray-900/50 backdrop-blur-md glow-border rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity"></div>
          <div className="bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-pink-500/20">
            <Heart className="w-12 h-12 text-pink-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t('tensionBuilding')}</h3>
          <p className="text-gray-300 text-sm leading-relaxed relative z-10">{t('tensionBuildingDesc')}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          className="text-center bg-gray-900/50 backdrop-blur-md glow-border rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity"></div>
          <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-green-500/20">
            <Shield className="w-12 h-12 text-green-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t('safety')}</h3>
          <p className="text-gray-300 text-sm leading-relaxed relative z-10">{t('safetyDesc')}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          className="text-center bg-gray-900/50 backdrop-blur-md glow-border rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity"></div>
          <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-blue-500/20">
            <Users className="w-12 h-12 text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t('groupPlay')}</h3>
          <p className="text-gray-300 text-sm leading-relaxed relative z-10">{t('groupPlayDesc')}</p>
        </motion.div>
      </motion.div>

      {/* Join Modal */}
      {showJoinModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowJoinModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('joinSession')}</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{t('sessionCode')}</label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder={t('sessionCodePlaceholder')}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  maxLength={6}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleJoinGame}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t('join')}
                </button>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onCreate={handleCreateRoom}
      />

      {/* Player Join Notifications */}
      <PlayerJoinNotification />
    </div>
  )
}

export default HomePage 