import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Brain, Trophy, Clock, Users, Star, CheckCircle, XCircle, ArrowRight, RotateCcw, Zap, Award, TrendingUp, Eye, EyeOff,
  Heart, Crown, Flame, Sparkles, Gift, Bell, Volume2, VolumeX, Settings, Play, Pause, SkipForward, SkipBack
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useCoupleStore } from '../store/coupleStore'

const IntimateGuessingGame = ({ difficulty, settings, onComplete }) => {
  const { 
    player1, 
    player2, 
    currentPlayer, 
    getIntimateGuessingCards, 
    switchPlayer,
    resetIntimateGuessing,
    getGuessingStats
  } = useCoupleStore()
  
  const [gameState, setGameState] = useState('setup') // setup, playing, paused, finished
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(settings?.rounds || 5)
  const [timeLeft, setTimeLeft] = useState(settings?.timeLimit || 60)
  const [currentCard, setCurrentCard] = useState(null)
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [roundResults, setRoundResults] = useState([])
  const [achievements, setAchievements] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [gameHistory, setGameHistory] = useState([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [bonusPoints, setBonusPoints] = useState(0)

  const cards = getIntimateGuessingCards()
  const currentPlayerData = currentPlayer === 1 ? player1 : player2
  const opponentData = currentPlayer === 1 ? player2 : player1

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return
    
    // In a real app, you would load actual sound files
    // For now, we'll use browser audio API to create simple sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        break
      case 'incorrect':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1)
        break
      case 'achievement':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        break
      case 'streak':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
        break
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleTimeUp()
    }
  }, [timeLeft, gameState])

  // Initialize game
  useEffect(() => {
    if (gameState === 'setup') {
      setGameState('playing')
      drawNewCard()
    }
  }, [gameState])

  const drawNewCard = () => {
    const availableCards = cards.filter(card => 
      card.difficulty === difficulty || 
      (difficulty === 'hot' && card.difficulty === 'medium') ||
      (difficulty === 'medium' && card.difficulty === 'easy')
    )
    
    if (availableCards.length === 0) {
      setCurrentCard(cards[0]) // Fallback to any card
    } else {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
      setCurrentCard(randomCard)
    }
    
    setTimeLeft(settings?.timeLimit || 60)
  }

  const handleTimeUp = () => {
    playSound('incorrect')
    toast.error('Time\'s up!')
    endRound(0, 'timeout')
  }

  const handleSkip = () => {
    if (!settings?.allowSkipping) return
    
    playSound('incorrect')
    toast('Card skipped')
    endRound(0, 'skipped')
  }

  const handlePause = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing')
  }

  const endRound = (points, reason) => {
    const roundResult = {
      round: currentRound,
      player: currentPlayerData.name,
      card: currentCard,
      points,
      reason,
      timeLeft,
      streak: currentStreak,
      multiplier
    }
    
    setRoundResults([...roundResults, roundResult])
    setScores(prev => ({
      ...prev,
      [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + points
    }))
    
    // Update streaks and multipliers
    if (points > 0) {
      const newStreak = currentStreak + 1
      setCurrentStreak(newStreak)
      setBestStreak(Math.max(bestStreak, newStreak))
      
      // Multiplier increases with streaks
      const newMultiplier = Math.min(3, 1 + Math.floor(newStreak / 3))
      setMultiplier(newMultiplier)
      
      if (newStreak % 3 === 0) {
        playSound('streak')
        toast.success(`Streak of ${newStreak}! Multiplier: ${newMultiplier}x`)
      }
    } else {
      setCurrentStreak(0)
      setMultiplier(1)
    }
    
    // Check for achievements
    checkAchievements(points, reason)
    
    if (currentRound >= totalRounds) {
      endGame()
    } else {
      setCurrentRound(currentRound + 1)
      switchPlayer()
      drawNewCard()
    }
  }

  const checkAchievements = (points, reason) => {
    const newAchievements = []
    
    // Perfect score achievement
    if (points >= 50) {
      newAchievements.push({
        id: 'perfect_score',
        title: 'Perfect Score!',
        description: 'Achieved maximum points in a round',
        icon: '🎯'
      })
    }
    
    // Streak achievements
    if (currentStreak >= 5) {
      newAchievements.push({
        id: 'streak_master',
        title: 'Streak Master!',
        description: 'Maintained a 5+ round streak',
        icon: '🔥'
      })
    }
    
    // Speed achievement
    if (timeLeft > 45 && points > 0) {
      newAchievements.push({
        id: 'speed_demon',
        title: 'Speed Demon!',
        description: 'Answered correctly with 45+ seconds remaining',
        icon: '⚡'
      })
    }
    
    // Multiplier achievement
    if (multiplier >= 2) {
      newAchievements.push({
        id: 'multiplier_master',
        title: 'Multiplier Master!',
        description: 'Reached 2x or higher multiplier',
        icon: '💎'
      })
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements])
      playSound('achievement')
      newAchievements.forEach(achievement => {
        toast.success(`${achievement.icon} ${achievement.title}: ${achievement.description}`)
      })
    }
  }

  const endGame = () => {
    setGameState('finished')
    
    // Calculate final scores with bonuses
    const finalScores = {
      player1: scores.player1 + bonusPoints,
      player2: scores.player2 + bonusPoints
    }
    
    // Determine winner
    const winner = finalScores.player1 > finalScores.player2 ? player1.name : 
                  finalScores.player2 > finalScores.player1 ? player2.name : 'Tie'
    
    // Save game history
    const gameRecord = {
      date: new Date().toISOString(),
      difficulty,
      settings,
      scores: finalScores,
      winner,
      achievements,
      bestStreak,
      totalRounds,
      roundResults
    }
    
    setGameHistory([...gameHistory, gameRecord])
    
    // Show final results
    setTimeout(() => {
      if (winner !== 'Tie') {
        toast.success(`🎉 ${winner} wins with ${Math.max(finalScores.player1, finalScores.player2)} points!`)
      } else {
        toast.success('🤝 It\'s a tie!')
      }
      onComplete()
    }, 2000)
  }

  const handleRestart = () => {
    resetIntimateGuessing()
    setGameState('setup')
    setCurrentRound(1)
    setScores({ player1: 0, player2: 0 })
    setRoundResults([])
    setAchievements([])
    setCurrentStreak(0)
    setBestStreak(0)
    setMultiplier(1)
    setBonusPoints(0)
    setTimeLeft(settings?.timeLimit || 60)
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Game Results */}
          <div className="bg-gray-800 rounded-xl p-8 mb-6">
            <div className="text-center mb-8">
              <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
              <p className="text-gray-400">Final Results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{player1.name}</h3>
                <div className="text-4xl font-bold text-blue-400 mb-2">{scores.player1}</div>
                <p className="text-gray-400">points</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{player2.name}</h3>
                <div className="text-4xl font-bold text-red-400 mb-2">{scores.player2}</div>
                <p className="text-gray-400">points</p>
              </div>
            </div>
            
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Achievements Unlocked</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{bestStreak}</div>
                <p className="text-sm text-gray-400">Best Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{totalRounds}</div>
                <p className="text-sm text-gray-400">Rounds Played</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{achievements.length}</div>
                <p className="text-sm text-gray-400">Achievements</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{difficulty}</div>
                <p className="text-sm text-gray-400">Difficulty</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <TrendingUp size={20} />
                <span>View Stats</span>
              </button>
            </div>
          </div>
          
          {/* Detailed Stats */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Round Details</h3>
              <div className="space-y-3">
                {roundResults.map((result, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">Round {result.round}</span>
                        <span className="text-gray-400 ml-2">- {result.player}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${result.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.points} pts
                        </span>
                        {result.streak > 1 && (
                          <span className="text-orange-400 text-sm">🔥 {result.streak}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {result.card.title} - {result.reason}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Intimate Guessing Game</h1>
              <p className="text-gray-400">Round {currentRound} of {totalRounds}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              {/* Pause Button */}
              <button
                onClick={handlePause}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {gameState === 'playing' ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              {/* Skip Button */}
              {settings?.allowSkipping && (
                <button
                  onClick={handleSkip}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <SkipForward size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{scores.player1}</div>
            <p className="text-sm text-gray-400">{player1.name}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{scores.player2}</div>
            <p className="text-sm text-gray-400">{player2.name}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{timeLeft}s</div>
            <p className="text-sm text-gray-400">Time Left</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{currentStreak}</div>
            <p className="text-sm text-gray-400">Streak</p>
          </div>
        </div>

        {/* Current Player & Multiplier */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Current Player: {currentPlayerData.name}</h2>
              <p className="text-gray-400">Difficulty: {difficulty}</p>
            </div>
            
            {multiplier > 1 && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg px-4 py-2">
                                 <div className="flex items-center space-x-2">
                   <Flame size={20} className="text-yellow-400" />
                   <span className="font-bold text-yellow-400">{multiplier}x Multiplier</span>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Card */}
        {currentCard && gameState === 'playing' && (
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-8 mb-6"
          >
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4">{currentCard.title}</h3>
                <p className="text-lg text-gray-300 mb-6">{currentCard.description}</p>
                
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">Measurement Method:</h4>
                  <p className="text-gray-300">{currentCard.method}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Scoring:</h4>
                  <p className="text-gray-300">{currentCard.scoring}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Paused State */}
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-xl p-8 text-center"
          >
            <Pause size={64} className="text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <p className="text-gray-400 mb-6">Take a break or continue when ready</p>
            <button
              onClick={handlePause}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Play size={20} />
              <span>Resume Game</span>
            </button>
          </motion.div>
        )}

        {/* Achievements Display */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 mb-6"
          >
            <h3 className="text-lg font-semibold mb-3">Recent Achievements</h3>
            <div className="flex space-x-3 overflow-x-auto">
              {achievements.slice(-3).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700 rounded-lg p-3 flex-shrink-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default IntimateGuessingGame 