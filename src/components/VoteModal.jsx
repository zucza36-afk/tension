import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import { useNavigate } from 'react-router-dom'

const VoteModal = ({ isOpen, onClose, card }) => {
  const { players, votes, submitVote, getVoteResults } = useGameStore()
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [voteResults, setVoteResults] = useState({})

  const t = (key) => getTranslation(key, language)

  const handleVote = () => {
    if (!selectedPlayer) return
    
    submitVote(selectedPlayer)
    const results = getVoteResults()
    setVoteResults(results)
    setShowResults(true)
  }

  const handleContinue = () => {
    onClose()
    setShowResults(false)
    setSelectedPlayer(null)
  }

  const handleBackToMain = () => {
    navigate('/')
  }

  if (!isOpen || !card) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-800 glass-effect rounded-lg p-6 max-w-md w-full mx-4"
      >
        {!showResults ? (
          // Voting Phase
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h2 className="text-xl font-serif text-white mb-2">
                {t('voting')}
              </h2>
              <p className="text-dark-300 text-sm">
                {card.description}
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">
                {t('selectPlayerToVote')}:
              </h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={`w-full p-3 rounded-lg transition-all ${
                      selectedPlayer === player.id
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-dark-700 hover:bg-dark-600 text-white border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{player.nickname}</span>
                      {selectedPlayer === player.id && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleVote}
              disabled={!selectedPlayer}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {t('vote')}
            </button>
          </div>
        ) : (
          // Results Phase
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h2 className="text-xl font-serif text-white mb-2">
                {t('votingResults')}
              </h2>
            </div>

            <div className="space-y-3">
              {Object.entries(voteResults).map(([playerId, voteCount]) => {
                const player = players.find(p => p.id === playerId)
                return (
                  <div
                    key={playerId}
                    className="flex justify-between items-center p-3 bg-dark-700 rounded-lg"
                  >
                    <span className="text-white">{player?.nickname}</span>
                    <span className="text-purple-400 font-semibold">
                      {voteCount} {voteCount === 1 ? t('voteCount') : t('voteCountPlural')}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="text-center p-4 bg-green-600/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 font-semibold">
                {t('winner')}: {(() => {
                  const winner = Object.entries(voteResults).reduce((a, b) => 
                    voteResults[a[0]] > voteResults[b[0]] ? a : b
                  )
                  const winnerPlayer = players.find(p => p.id === winner[0])
                  return winnerPlayer?.nickname
                })()}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBackToMain}
                className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('back')}
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('continueGame')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default VoteModal 