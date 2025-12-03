import { motion } from 'framer-motion'
import { Trophy, X, Star } from 'lucide-react'

const ResultModal = ({ currentAnswer, currentGuess, score, onContinue }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    if (score >= 3) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreMessage = (score) => {
    if (score === 10) return 'Doskonale! Idealna odpowiedź! 🎯'
    if (score >= 8) return 'Świetnie! Bardzo blisko! ⭐'
    if (score >= 5) return 'Dobrze! Nieźle odgadnięte! 👍'
    if (score >= 3) return 'Prawie! Trochę dalej... 🤔'
    return 'Spróbuj następnym razem! 💪'
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-4"
          >
            <div className={`text-6xl mb-2 ${getScoreColor(score)}`}>
              {score === 10 ? '🏆' : score >= 8 ? '⭐' : score >= 5 ? '👍' : '💪'}
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}/10
            </div>
            <p className="text-gray-300 text-lg">{getScoreMessage(score)}</p>
          </motion.div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">Prawidłowa odpowiedź:</p>
            <p className="text-white font-medium">{currentAnswer?.answer}</p>
            <p className="text-xs text-gray-500 mt-1">- {currentAnswer?.playerName}</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">Twoja odpowiedź:</p>
            <p className="text-white font-medium">{currentGuess?.guess}</p>
            <p className="text-xs text-gray-500 mt-1">- {currentGuess?.playerName}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Zdobyte punkty:</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                +{score}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <Star className="w-5 h-5" />
          <span>Kontynuuj grę</span>
        </button>
      </motion.div>
    </div>
  )
}

export default ResultModal

