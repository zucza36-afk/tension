import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Play } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'

const SafeWordButton = () => {
  const { safeWordActivated, activateSafeWord, resumeGame } = useGameStore()
  const { language } = useLanguageStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const t = (key) => getTranslation(key, language)

  const handleSafeWordClick = () => {
    if (safeWordActivated) {
      resumeGame()
    } else {
      setShowConfirm(true)
    }
  }

  const handleConfirm = () => {
    activateSafeWord()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      {/* Safe Word Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSafeWordClick}
        className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all duration-200 z-40 ${
          safeWordActivated
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={safeWordActivated ? t('resumeGame') : t('safeWord')}
      >
        {safeWordActivated ? (
          <Play className="w-6 h-6" />
        ) : (
          <AlertTriangle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 glass-effect rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-serif text-white mb-2">
                {t('confirmStop')}
              </h2>
              <p className="text-dark-300">
                {t('safeWordConfirm')}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('activateStop')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default SafeWordButton 