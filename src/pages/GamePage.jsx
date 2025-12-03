import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  Users, 
  BarChart3,
  Settings,
  RotateCcw,
  Brain
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import Card from '../components/Card'
import SafeWordButton from '../components/SafeWordButton'
import VoteModal from '../components/VoteModal'
import EnhancedGameIntegration from '../components/EnhancedGameIntegration'
import BiofeedbackDashboard from '../components/BiofeedbackDashboard'
import Chat from '../components/Chat'
import AnswerModal from '../components/AnswerModal'
import GuessModal from '../components/GuessModal'
import ResultModal from '../components/ResultModal'
import AIBot from '../components/AIBot'
import HintRequestModal from '../components/HintRequestModal'
import MusicSync from '../components/MusicSync'
import toast from 'react-hot-toast'

const GamePage = () => {
  const navigate = useNavigate()
  const {
    players,
    currentPlayerIndex,
    currentCard,
    deck,
    gameStatus,
    currentRound,
    totalRounds,
    safeWordActivated,
    drawCard,
    skipCard,
    nextPlayer,
    pauseGame,
    resumeGame,
    endGame,
    updateAnalytics,
    startAnalytics,
    endAnalytics,
    gamePhase,
    currentAnswer,
    currentGuess,
    playerScores,
    submitAnswer,
    submitGuess,
    continueToNextRound
  } = useGameStore()

  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [showWearableIntegration, setShowWearableIntegration] = useState(false)
  const [showBiofeedbackDashboard, setShowBiofeedbackDashboard] = useState(false)

  useEffect(() => {
    startAnalytics()
    return () => endAnalytics()
  }, [startAnalytics, endAnalytics])

  const handleDrawCard = async () => {
    if (deck.length === 0) {
      toast.error('Brak kart w talii!')
      return
    }

    const card = await drawCard()
    setIsCardFlipped(false)
    updateAnalytics({ cardsPlayed: currentRound + 1 })
    
    // Handle vote cards
    if (card.type === 'Vote') {
      setShowVoteModal(true)
    } else if (card.type === 'Truth' || card.type === 'Dare') {
      // For Truth/Dare cards, go to answer phase
      // The answer modal will be shown automatically
    }
  }
  
  const handleSubmitAnswer = async (answer) => {
    await submitAnswer(answer)
    toast.success('Odpowiedź zapisana! Czekaj na odgadnięcie...')
  }
  
  const handleSubmitGuess = async (guess) => {
    await submitGuess(guess)
  }
  
  const handleContinueAfterResult = async () => {
    await continueToNextRound()
    setIsCardFlipped(false)
  }
  
  const handleSkipAnswer = async () => {
    await skipCard()
    setIsCardFlipped(false)
    await nextPlayer()
  }

  const handleCardFlip = () => {
    setIsCardFlipped(true)
    // For Truth/Dare cards, automatically go to answer phase after flip
    if (currentCard && (currentCard.type === 'Truth' || currentCard.type === 'Dare')) {
      // The answer phase is already set when card is drawn
      // Just ensure we're in answer phase
    }
  }

  const handleCardSkip = async () => {
    await skipCard()
    setIsCardFlipped(false)
    updateAnalytics({ cardsSkipped: currentRound })
    toast.success('Karta pominięta')
  }

  const handleCardComplete = async () => {
    setIsCardFlipped(false)
    // For Truth/Dare cards, go to answer phase automatically
    // The answer modal will be shown when gamePhase changes to 'answer'
    if (!currentCard || (currentCard.type !== 'Truth' && currentCard.type !== 'Dare')) {
      await nextPlayer()
      setTimeout(() => {
        handleDrawCard()
      }, 400)
      toast.success('Karta wykonana!')
    }
  }

  const handleVoteComplete = async () => {
    setShowVoteModal(false)
    await nextPlayer()
    setTimeout(() => {
      handleDrawCard()
    }, 400)
  }

  const handleEndGame = async () => {
    await endGame()
    navigate('/end')
  }

  const currentPlayer = players[currentPlayerIndex]
  const progress = (currentRound / totalRounds) * 100

  if (safeWordActivated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🛑</div>
          <h1 className="text-3xl font-serif text-white mb-4">Gra wstrzymana</h1>
          <p className="text-dark-300 mb-8">
            Słowo bezpieczeństwa zostało aktywowane. 
            Gra jest wstrzymana do momentu wznowienia.
          </p>
          <button
            onClick={resumeGame}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Wznów grę
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/setup')}
            className="flex items-center space-x-2 text-dark-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Powrót</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-serif text-white mb-2">Napięcie</h1>
            <div className="flex items-center justify-center space-x-4 text-dark-300">
              <span>Runda {currentRound + 1} z {totalRounds}</span>
              <span>•</span>
              <span>{deck.length} kart pozostało</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWearableIntegration(!showWearableIntegration)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showWearableIntegration 
                  ? 'bg-blue-600 text-white' 
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Wearable</span>
            </button>
            <button
              onClick={() => setShowBiofeedbackDashboard(!showBiofeedbackDashboard)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showBiofeedbackDashboard 
                  ? 'bg-green-600 text-white' 
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span className="hidden sm:inline">Biofeedback</span>
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="text-dark-200 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleEndGame}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Zakończ grę
            </button>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="mb-8"
        >
          <div className="bg-dark-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players Panel */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-dark-800/50 glass-effect rounded-lg p-6">
              <h2 className="text-xl font-serif text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Gracze</span>
              </h2>

              <div className="space-y-3">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg transition-all ${
                      index === currentPlayerIndex
                        ? 'bg-primary-600/20 border border-primary-500/30'
                        : 'bg-dark-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                          index === currentPlayerIndex ? 'bg-primary-600' : 'bg-dark-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-white font-semibold">{player.nickname}</span>
                          <div className="text-xs text-gray-400">
                            Punkty: <span className="text-yellow-400 font-bold">{playerScores[player.id] || 0}</span>
                          </div>
                        </div>
                      </div>
                      {index === currentPlayerIndex && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Play className="w-4 h-4 text-primary-400" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Game Area */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="flex flex-col items-center justify-center min-h-[600px]">
              {currentCard && gamePhase === 'draw' ? (
                <div className="w-full max-w-md">
                  <Card
                    card={currentCard}
                    isFlipped={isCardFlipped}
                    onFlip={handleCardFlip}
                    onSkip={handleCardSkip}
                    onComplete={handleCardComplete}
                  />
                </div>
              ) : currentCard && gamePhase === 'answer' ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-6">✍️</div>
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Czekaj na odpowiedź gracza
                  </h2>
                  <p className="text-dark-300">
                    {currentPlayer?.nickname} wpisuje odpowiedź...
                  </p>
                </motion.div>
              ) : currentCard && gamePhase === 'guess' ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-6">🎯</div>
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Czekaj na odgadnięcie
                  </h2>
                  <p className="text-dark-300">
                    {players[(currentPlayerIndex + 1) % players.length]?.nickname} próbuje odgadnąć...
                  </p>
                </motion.div>
              ) : currentCard && gamePhase === 'result' ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Wynik rundy
                  </h2>
                  <p className="text-dark-300">
                    Sprawdź wynik w modalu!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-8xl mb-6">🎴</div>
                  <h2 className="text-2xl font-serif text-white mb-4">
                    {currentPlayer ? `Tura gracza: ${currentPlayer.nickname}` : 'Przygotuj się'}
                  </h2>
                  <p className="text-dark-300 mb-8">
                    Kliknij "Dobierz kartę" aby rozpocząć
                  </p>
                  <button
                    onClick={handleDrawCard}
                    className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span>Dobierz kartę</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Game Controls */}
        {currentCard && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-8 flex justify-center space-x-4"
          >
            <button
              onClick={pauseGame}
              className="bg-dark-600 hover:bg-dark-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Pause className="w-5 h-5" />
              <span>Pauza</span>
            </button>
            
            <button
              onClick={handleCardSkip}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <SkipForward className="w-5 h-5" />
              <span>Pomiń kartę</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Wearable Integration Panel */}
      {showWearableIntegration && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-0 right-0 h-full z-40"
        >
          <EnhancedGameIntegration />
        </motion.div>
      )}

      {/* Biofeedback Dashboard Panel */}
      {showBiofeedbackDashboard && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-0 right-0 h-full z-40 w-96 overflow-y-auto"
        >
          <BiofeedbackDashboard />
        </motion.div>
      )}

      {/* Safe Word Button */}
      <SafeWordButton />

      {/* Vote Modal */}
      <VoteModal
        card={currentCard}
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        onComplete={handleVoteComplete}
      />

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 glass-effect rounded-lg p-8 max-w-md mx-4 text-center"
          >
            <h3 className="text-2xl font-serif text-white mb-4">Ustawienia</h3>
            <p className="text-dark-300 mb-6">Panel ustawień będzie dostępny w przyszłych wersjach.</p>
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Zamknij
            </button>
          </motion.div>
        </div>
      )}
      
      {/* Chat Component */}
      <Chat />
      
      {/* Answer Modal */}
      {currentCard && gamePhase === 'answer' && (
        <AnswerModal
          card={currentCard}
          currentPlayer={currentPlayer}
          onSubmit={handleSubmitAnswer}
          onSkip={handleSkipAnswer}
        />
      )}
      
      {/* Guess Modal */}
      {currentCard && gamePhase === 'guess' && currentAnswer && (
        <GuessModal
          card={currentCard}
          currentAnswer={currentAnswer}
          guessingPlayer={players[(currentPlayerIndex + 1) % players.length]}
          onSubmit={handleSubmitGuess}
          onSkip={handleSkipAnswer}
        />
      )}
      
      {/* Result Modal */}
      {currentCard && gamePhase === 'result' && currentAnswer && currentGuess && (
        <ResultModal
          currentAnswer={currentAnswer}
          currentGuess={currentGuess}
          score={currentGuess.score}
          onContinue={handleContinueAfterResult}
        />
      )}
      
      {/* AI Bot */}
      <AIBot />

      {/* Music Sync */}
      <MusicSync />

      {/* Hint Request Modal */}
      <HintRequestModal />
    </div>
  )
}

export default GamePage 