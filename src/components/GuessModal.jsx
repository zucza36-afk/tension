import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Target } from 'lucide-react'

const GuessModal = ({ card, currentAnswer, guessingPlayer, onSubmit, onSkip }) => {
  const [guess, setGuess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (guess.trim()) {
      onSubmit(guess)
      setGuess('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Odgadnij odpowiedź</h2>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">Pytanie:</p>
            <p className="text-white font-medium">{card?.title}</p>
            {card?.description && (
              <p className="text-gray-300 text-sm mt-2">{card.description}</p>
            )}
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-purple-300 mb-1">
              <span className="font-semibold">{currentAnswer?.playerName}</span> wpisał odpowiedź
            </p>
            <p className="text-gray-300 text-xs">Spróbuj odgadnąć! Im bliżej, tym więcej punktów (0-10)</p>
          </div>
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-blue-400">{guessingPlayer?.nickname}</span>, 
            wpisz swoją odpowiedź:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Wpisz swoją odpowiedź..."
            className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={4}
            autoFocus
            maxLength={200}
          />
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!guess.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Odgadnij</span>
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Pomiń
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default GuessModal

