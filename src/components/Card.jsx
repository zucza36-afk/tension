import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, User, Target, Zap } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'

const Card = ({ card, isFlipped, onFlip, onSkip, onComplete }) => {
  const [isHovered, setIsHovered] = useState(false)
  const { language } = useLanguageStore()

  const t = (key) => getTranslation(key, language)

  const getTypeIcon = (type) => {
    const icons = {
      'Truth': <User className="w-6 h-6" />,
      'Dare': <Zap className="w-6 h-6" />,
      'Vote': <Users className="w-6 h-6" />,
      'Icebreaker': <Heart className="w-6 h-6" />,
      'Touch': <Target className="w-6 h-6" />,
      'Strip': <Zap className="w-6 h-6" />,
      'Group': <Users className="w-6 h-6" />
    }
    return icons[type] || <Heart className="w-6 h-6" />
  }

  const getTypeColor = (type) => {
    const colors = {
      'Truth': 'text-blue-400',
      'Dare': 'text-red-400',
      'Vote': 'text-purple-400',
      'Icebreaker': 'text-green-400',
      'Touch': 'text-yellow-400',
      'Strip': 'text-pink-400',
      'Group': 'text-indigo-400'
    }
    return colors[type] || 'text-gray-400'
  }

  const getTargetLabel = (target) => {
    const labels = {
      'one': t('onePerson'),
      'two': t('twoPeople'),
      'group': t('everyone'),
      'random': t('randomPerson')
    }
    return labels[target] || 'Unknown'
  }

  if (!card) return null

  return (
    <div className="relative w-full max-w-md mx-auto">
      {!isFlipped ? (
        // Card Front
        <motion.div
          className={`w-full aspect-[3/4] rounded-xl glass-effect border-2 intensity-${card.intensity} flex flex-col items-center justify-center p-6 text-center cursor-pointer`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onClick={onFlip}
        >
          <div className="absolute top-4 right-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(card.type)} bg-dark-800/50`}>
              {getTypeIcon(card.type)}
            </div>
          </div>

          <div className="absolute top-4 left-4">
            <div className="flex space-x-1">
              {[...Array(card.intensity)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary-500 rounded-full" />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-serif text-white mb-4 text-shadow">
              {card.title}
            </h3>
            
            <div className="text-dark-300 text-sm mb-4">
              <span className={`${getTypeColor(card.type)} font-semibold`}>
                {t(card.type.toLowerCase())}
              </span>
              <span className="mx-2">•</span>
              <span>{getTargetLabel(card.target)}</span>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              ❓
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <p className="text-dark-300 text-sm">{t('clickToFlip')}</p>
          </div>
        </motion.div>
      ) : (
        // Card Back
        <motion.div
          className={`w-full aspect-[3/4] rounded-xl glass-effect border-2 intensity-${card.intensity} flex flex-col p-6`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-4 right-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(card.type)} bg-dark-800/50`}>
              {getTypeIcon(card.type)}
            </div>
          </div>

          <div className="absolute top-4 left-4">
            <div className="flex space-x-1">
              {[...Array(card.intensity)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary-500 rounded-full" />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-serif text-white mb-4 text-center text-shadow">
              {card.title}
            </h3>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white text-lg leading-relaxed text-center">
                {card.description}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm text-dark-300">
                <span>{t('type')}: <span className={getTypeColor(card.type)}>{t(card.type.toLowerCase())}</span></span>
                <span>{t('target')}: {getTargetLabel(card.target)}</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onSkip}
                  className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('skip')}
                </button>
                <button
                  onClick={onComplete}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('completed')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Card 