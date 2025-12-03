import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X } from 'lucide-react'

const AnswerModal = ({ card, currentPlayer, onSubmit, onSkip }) => {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer.trim()) {
      onSubmit(answer)
      setAnswer('')
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
          <h2 className="text-2xl font-bold text-white">Twoja odpowiedź</h2>
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
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-purple-400">{currentPlayer?.nickname}</span>, 
            wpisz prawidłową odpowiedź na pytanie. Przeciwnik będzie musiał ją odgadnąć!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Wpisz odpowiedź..."
            className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
            rows={4}
            autoFocus
            maxLength={200}
          />
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!answer.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Wyślij odpowiedź</span>
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

export default AnswerModal

