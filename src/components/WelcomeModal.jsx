import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Heart, Shield, Users } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'

const WelcomeModal = ({ isOpen, onClose }) => {
  const { language, setLanguage, verifyAge } = useLanguageStore()
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [step, setStep] = useState('language') // 'language' or 'age'

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang)
  }

  const handleContinue = () => {
    if (step === 'language') {
      setLanguage(selectedLanguage)
      setStep('age')
    }
  }

  const handleAgeVerification = (isAdult) => {
    verifyAge(isAdult)
    onClose()
  }

  const t = (key) => getTranslation(key, selectedLanguage)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-800 glass-effect rounded-lg p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
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
            <Heart className="w-16 h-16 text-primary-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-3xl font-serif text-white mb-2">
            {t('welcome')}
          </h1>
        </div>

        {step === 'language' ? (
          // Language Selection Step
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
              <h2 className="text-xl font-serif text-white mb-4">
                {t('selectLanguage')}
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleLanguageSelect('pl')}
                className={`w-full p-4 rounded-lg transition-all ${
                  selectedLanguage === 'pl'
                    ? 'bg-primary-600 text-white border-2 border-primary-400'
                    : 'bg-dark-700 hover:bg-dark-600 text-white border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">🇵🇱 Polski</span>
                  {selectedLanguage === 'pl' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-white rounded-full"
                    />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleLanguageSelect('en')}
                className={`w-full p-4 rounded-lg transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-primary-600 text-white border-2 border-primary-400'
                    : 'bg-dark-700 hover:bg-dark-600 text-white border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">🇺🇸 English</span>
                  {selectedLanguage === 'en' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-white rounded-full"
                    />
                  )}
                </div>
              </button>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {t('enter')}
            </button>
          </div>
        ) : (
          // Age Verification Step
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <h2 className="text-xl font-serif text-white mb-4">
                {t('ageVerification')}
              </h2>
              <p className="text-dark-300 text-sm">
                This game contains adult content and is intended for players 18 years or older.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAgeVerification(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('yes')}
              </button>
              <button
                onClick={() => handleAgeVerification(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('no')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default WelcomeModal 