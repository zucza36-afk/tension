import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Lightbulb, Sparkles } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import aiService from '../services/aiService'
import toast from 'react-hot-toast'

const AIBot = () => {
  const {
    aiBotEnabled,
    aiBotMessages,
    currentCard,
    currentRound,
    gamePhase,
    players,
    currentPlayerIndex,
    playerScores,
    localPlayerId,
    requestHint,
    addAIBotMessage
  } = useGameStore()

  const [isOpen, setIsOpen] = useState(false)
  const [isRequestingHint, setIsRequestingHint] = useState(false)
  const messagesEndRef = useRef(null)
  const lastCardIdRef = useRef(null)
  const lastGamePhaseRef = useRef(null)

  // Aktualizuj kontekst AI przy zmianie gry
  useEffect(() => {
    if (aiBotEnabled) {
      aiService.setGameContext({
        players,
        currentCard,
        currentRound,
        gamePhase,
        playerScores
      })
    }
  }, [aiBotEnabled, players, currentCard, currentRound, gamePhase, playerScores])

  // Generuj komentarze przy wydarzeniach
  useEffect(() => {
    if (!aiBotEnabled || !isOpen) return

    const generateComment = async (event) => {
      try {
        const comment = await aiService.generateGameComment(event)
        addAIBotMessage({
          type: 'comment',
          message: comment,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('Error generating comment:', error)
        // Fallback message if AI fails
        addAIBotMessage({
          type: 'system',
          message: 'Bot AI jest chwilowo niedostępny. Spróbuj ponownie później.',
          timestamp: Date.now()
        })
      }
    }

    // Komentuj przy zmianie karty
    if (currentCard && currentCard.id !== lastCardIdRef.current) {
      lastCardIdRef.current = currentCard.id
      const currentPlayer = players[currentPlayerIndex]
      if (currentPlayer) {
        generateComment(`Gracz ${currentPlayer.nickname} wylosował kartę: "${currentCard.title}"`)
      }
    }

    // Komentuj przy zmianie fazy
    if (gamePhase !== lastGamePhaseRef.current) {
      lastGamePhaseRef.current = gamePhase
      if (gamePhase === 'result') {
        generateComment(`Runda ${currentRound} zakończona! Sprawdźmy wyniki!`)
      } else if (gamePhase === 'answer') {
        const currentPlayer = players[currentPlayerIndex]
        if (currentPlayer) {
          generateComment(`${currentPlayer.nickname} wpisuje odpowiedź...`)
        }
      } else if (gamePhase === 'guess') {
        const guessingPlayer = players[(currentPlayerIndex + 1) % players.length]
        if (guessingPlayer) {
          generateComment(`${guessingPlayer.nickname} próbuje odgadnąć odpowiedź!`)
        }
      }
    }
  }, [currentCard, gamePhase, currentRound, aiBotEnabled, isOpen, players, currentPlayerIndex, addAIBotMessage])

  const handleRequestHint = async () => {
    if (!currentCard) {
      toast.error('Brak aktywnej karty')
      return
    }

    setIsRequestingHint(true)
    try {
      const currentPlayer = players.find(p => p.id === localPlayerId) || players[currentPlayerIndex]
      const hint = await aiService.requestHint(
        currentCard.title,
        currentPlayer?.nickname || 'Gracz'
      )

      // Wyślij prośbę o podpowiedź
      await requestHint({
        playerId: localPlayerId || currentPlayer?.id,
        playerName: currentPlayer?.nickname || 'Gracz',
        question: currentCard.title,
        hint: hint
      })

      toast.success('Prośba o podpowiedź wysłana! Przeciwnik zdecyduje czy pomóc.')
    } catch (error) {
      console.error('Error requesting hint:', error)
      toast.error('Błąd podczas prośby o podpowiedź. Sprawdź czy masz ustawiony VITE_OPENAI_API_KEY.')
    } finally {
      setIsRequestingHint(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [aiBotMessages])

  if (!aiBotEnabled) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        <Bot className="w-6 h-6" />
        {aiBotMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {aiBotMessages.length > 9 ? '9+' : aiBotMessages.length}
          </span>
        )}
      </button>

      {/* Bot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 100, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-32 right-4 w-full max-w-sm h-[500px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Bot Prowadzący</h3>
                  <p className="text-xs text-gray-400">Komentuje i pomaga w grze</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesEndRef}
              className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3"
            >
              {aiBotMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Bot będzie komentował wydarzenia w grze!
                  </p>
                </div>
              ) : (
                aiBotMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${
                      msg.type === 'system' ? 'items-center' : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-[85%] ${
                        msg.type === 'comment'
                          ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200'
                          : msg.type === 'hint'
                          ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {msg.type === 'hint' && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-xs font-semibold">Podpowiedź</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      {msg.playerName && (
                        <p className="text-xs opacity-70 mt-1">- {msg.playerName}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-700 space-y-2">
              {currentCard && gamePhase === 'answer' && (
                <button
                  onClick={handleRequestHint}
                  disabled={isRequestingHint}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>
                    {isRequestingHint
                      ? 'Proszę o podpowiedź...'
                      : 'Poproś o podpowiedź (-2 pkt)'}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIBot

