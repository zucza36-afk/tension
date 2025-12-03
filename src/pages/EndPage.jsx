import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  BarChart3, 
  Play, 
  Home, 
  Share2, 
  Mail,
  Heart,
  Users,
  Clock,
  Star
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import toast from 'react-hot-toast'

const EndPage = () => {
  const navigate = useNavigate()
  const { 
    players, 
    analytics, 
    currentRound,
    usedCards,
    initializeGame,
    getAnalyticsReport
  } = useGameStore()

  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const handleReplay = () => {
    initializeGame()
    navigate('/setup')
  }

  const handleNewGame = () => {
    initializeGame()
    navigate('/')
  }

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error('Proszę ocenić grę')
      return
    }

    // Here you would typically send feedback to your backend
    console.log('Feedback submitted:', { email, rating, feedback })
    toast.success('Dziękujemy za opinie!')
    setShowFeedback(false)
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getIntensityDistribution = () => {
    return analytics.intensityDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }

  const intensityDistribution = getIntensityDistribution()
  const analyticsReport = getAnalyticsReport()

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
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
            <Trophy className="w-24 h-24 text-accent-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white text-shadow-lg mb-4">
            Gra zakończona!
          </h1>
          
          <p className="text-xl text-dark-300">
            Dziękujemy za grę w Napięcie
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Game Summary */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-800/50 glass-effect rounded-lg p-6"
          >
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center space-x-3">
              <BarChart3 className="w-6 h-6" />
              <span>Podsumowanie gry</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Gracze</span>
                </div>
                <span className="text-white font-semibold">{players.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-white">Rozegrane karty</span>
                </div>
                <span className="text-white font-semibold">{analytics.cardsPlayed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-white">Czas gry</span>
                </div>
                <span className="text-white font-semibold">
                  {formatDuration(analytics.gameDuration)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Pominięte karty</span>
                </div>
                <span className="text-white font-semibold">{analytics.cardsSkipped}</span>
              </div>
            </div>
          </motion.div>

          {/* Intensity Distribution */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-800/50 glass-effect rounded-lg p-6"
          >
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center space-x-3">
              <BarChart3 className="w-6 h-6" />
              <span>Rozkład intensywności</span>
            </h2>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((intensity) => (
                <div key={intensity} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm intensity-1">
                    {intensity}
                  </div>
                  <div className="flex-1 bg-dark-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-red-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(intensityDistribution[intensity] / Math.max(...Object.values(intensityDistribution))) * 100}%` 
                      }}
                      transition={{ duration: 1, delay: intensity * 0.1 }}
                    />
                  </div>
                  <span className="text-white font-semibold min-w-[2rem] text-right">
                    {intensityDistribution[intensity]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        {analyticsReport && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            {/* Type Distribution */}
            <div className="bg-dark-800/50 glass-effect rounded-lg p-6">
              <h2 className="text-xl font-serif text-white mb-4 flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" />
                <span>Rozkład typów kart</span>
              </h2>
              <div className="space-y-2">
                {Object.entries(analyticsReport.typeDistribution || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-dark-700/50 rounded">
                    <span className="text-white text-sm">{type}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Stats */}
            <div className="bg-dark-800/50 glass-effect rounded-lg p-6">
              <h2 className="text-xl font-serif text-white mb-4 flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Statystyki graczy</span>
              </h2>
              <div className="space-y-2">
                {Object.entries(analyticsReport.playerStats || {}).map(([playerId, stats]) => {
                  const player = players.find(p => p.id === playerId)
                  const avgIntensity = stats.intensities?.length > 0
                    ? (stats.intensities.reduce((a, b) => a + b, 0) / stats.intensities.length).toFixed(1)
                    : '0'
                  return (
                    <div key={playerId} className="p-2 bg-dark-700/50 rounded">
                      <div className="text-white font-semibold text-sm">{player?.nickname || 'Unknown'}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        Karty: {stats.cardsPlayed} | Śr. intensywność: {avgIntensity}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
        >
          <button
            onClick={handleReplay}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Play className="w-6 h-6" />
            <span>Zagraj ponownie</span>
          </button>

          <button
            onClick={handleNewGame}
            className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Home className="w-6 h-6" />
            <span>Nowa gra</span>
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Mail className="w-6 h-6" />
            <span>Wyślij opinię</span>
          </button>
        </motion.div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-dark-800 glass-effect rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-serif text-white mb-4">Wyślij opinię</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark-200 mb-2">Email (opcjonalnie)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-dark-200 mb-2">Ocena gry</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= rating ? 'text-yellow-400' : 'text-dark-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 mb-2">Opinia (opcjonalnie)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Podziel się swoimi wrażeniami..."
                    rows={4}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Wyślij
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EndPage 