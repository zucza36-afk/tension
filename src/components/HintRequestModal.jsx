import { motion } from 'framer-motion'
import { Lightbulb, X, Check, XCircle } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

const HintRequestModal = () => {
  const {
    pendingHintRequest,
    localPlayerId,
    players,
    acceptHint,
    declineHint
  } = useGameStore()

  if (!pendingHintRequest) return null

  const isRequestingPlayer = pendingHintRequest.playerId === localPlayerId
  const requestingPlayer = players.find(p => p.id === pendingHintRequest.playerId)

  const handleAccept = () => {
    acceptHint()
  }

  const handleDecline = () => {
    declineHint()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isRequestingPlayer ? 'Twoja prośba' : 'Prośba o podpowiedź'}
            </h2>
          </div>
          {!isRequestingPlayer && (
            <button
              onClick={handleDecline}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isRequestingPlayer ? (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Pytanie:</p>
              <p className="text-white font-medium">{pendingHintRequest.question}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 text-sm">
                Czekasz na decyzję przeciwnika. Jeśli pomoże, stracisz 2 punkty.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">
                <span className="font-semibold text-pink-400">
                  {pendingHintRequest.playerName}
                </span>{' '}
                prosi o podpowiedź do pytania:
              </p>
              <p className="text-white font-medium">{pendingHintRequest.question}</p>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 text-sm font-medium mb-2">Podpowiedź AI:</p>
              <p className="text-purple-200">{pendingHintRequest.hint}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 text-sm">
                Jeśli pomożesz, gracz straci <span className="font-bold">2 punkty</span>.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                <Check className="w-5 h-5" />
                <span>Pomóż (-2 pkt)</span>
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                <XCircle className="w-5 h-5" />
                <span>Nie pomagaj</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default HintRequestModal

