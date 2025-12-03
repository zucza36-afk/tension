import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Users, Play, Settings, Shield, Star, Plus, Brain, Target } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import toast from 'react-hot-toast'

const HomePage = () => {
  const navigate = useNavigate()
  const { createSession, joinSession } = useGameStore()
  const { language } = useLanguageStore()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [sessionCode, setSessionCode] = useState('')

  const t = (key) => getTranslation(key, language)

  const handleCreateGame = async () => {
    console.log('Creating game...')
    try {
      const result = await createSession()
      console.log('Session created:', result)
      
      if (result && result.sessionCode) {
        toast.success(`${t('gameCreated') || 'Gra utworzona'} ${result.sessionCode}`)
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/setup')
        }, 100)
      } else {
        console.error('No sessionCode returned:', result)
        toast.error(t('errorCreatingGame') || 'Błąd tworzenia gry')
      }
    } catch (error) {
      console.error('Error creating game:', error)
      toast.error(t('errorCreatingGame') || 'Błąd tworzenia gry: ' + error.message)
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
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-6"
        >
          <Heart className="w-24 h-24 text-primary-500 mx-auto" />
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-white text-shadow-lg mb-4">
          {t('gameTitle')}
        </h1>
        
        <p className="text-xl md:text-2xl text-dark-200 font-sans max-w-2xl mx-auto">
          {t('gameSubtitle')}
        </p>
      </motion.div>

      {/* Main Actions */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-md space-y-4"
      >
        <button
          onClick={handleCreateGame}
          type="button"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6" />
          <span>{t('createGame') || 'Utwórz grę'}</span>
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
        >
          <Users className="w-6 h-6" />
          <span>{t('joinGame')}</span>
        </button>

        {/* New Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={() => navigate('/couples-mode')}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">{t('couplesMode') || 'Couples Mode'}</span>
          </button>

          <button
            onClick={() => navigate('/intimate-guessing')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Target className="w-5 h-5" />
            <span className="text-sm">{t('intimateGuessingGame') || 'Intimate Guessing'}</span>
          </button>

          <button
            onClick={() => navigate('/custom-cards')}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">{t('customCards') || 'Custom Cards'}</span>
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Brain className="w-5 h-5" />
            <span>{t('biofeedbackMode') || 'Biofeedback Mode'}</span>
          </button>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <div className="bg-dark-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('tensionBuilding')}</h3>
          <p className="text-dark-300">{t('tensionBuildingDesc')}</p>
        </div>

        <div className="text-center">
          <div className="bg-dark-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('safety')}</h3>
          <p className="text-dark-300">{t('safetyDesc')}</p>
        </div>

        <div className="text-center">
          <div className="bg-dark-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('groupPlay')}</h3>
          <p className="text-dark-300">{t('groupPlayDesc')}</p>
        </div>
      </motion.div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 glass-effect rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-serif text-white mb-4">{t('joinSession')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-dark-200 mb-2">{t('sessionCode')}</label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder={t('sessionCodePlaceholder')}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                  maxLength={6}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleJoinGame}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('join')}
                </button>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default HomePage 