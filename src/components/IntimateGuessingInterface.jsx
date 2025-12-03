import { motion } from 'framer-motion'
import { Target, Brain, Ruler, CheckCircle, AlertTriangle, Trophy, Info } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

import { useCoupleStore } from '../store/coupleStore'

const IntimateGuessingInterface = ({ card, onComplete }) => {
  const {
    player1,
    player2,
    intimateGuessingActive,
    selectedMethod,
    playerGuess,
    partnerAnswer,
    currentPlayer,
    startIntimateGuessing,
    setPlayerGuess,
    setPartnerAnswer,
    evaluateGuess,
    requestMeasurementProof,
    getGuessingStats,
    resetIntimateGuessing,
  } = useCoupleStore()

  const [showPartnerInput, setShowPartnerInput] = useState(false)
  const [result, setResult] = useState(null)
  const [showMeasurementHelp, setShowMeasurementHelp] = useState(false)
  const [countdown, setCountdown] = useState(null)

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (countdown !== null) {
        setCountdown(null)
      }
    },
    []
  )

  const handleStartGuessing = () => {
    startIntimateGuessing(card)
    toast.success(`AI wybrało metodę badania!`)
  }

  const handlePlayerGuessSubmit = () => {
    if (!playerGuess.trim()) {
      toast.error('Wpisz swoją odpowiedź')
      return
    }
    setShowPartnerInput(true)
    toast('Teraz partner potwierdza prawdziwość...', { icon: 'ℹ️' })
  }

  const handleEvaluate = () => {
    if (!partnerAnswer.trim()) {
      toast.error('Partner musi podać prawdziwą wartość')
      return
    }

    const evaluationResult = evaluateGuess()
    setResult(evaluationResult)

    // Toast z wynikiem
    if (evaluationResult.accuracy >= 80) {
      toast.success(`Świetnie! Trafność: ${evaluationResult.accuracy}%`)
    } else if (evaluationResult.accuracy >= 60) {
      toast('Nieźle! Trafność: ' + evaluationResult.accuracy + '%', { icon: '👍' })
    } else {
      toast('Spróbuj ponownie! Trafność: ' + evaluationResult.accuracy + '%', { icon: '🎯' })
    }

    // Rozpocznij countdown do następnej karty
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleMeasurementProof = () => {
    const proofInfo = requestMeasurementProof()
    setShowMeasurementHelp(true)
    toast('Sprawdź instrukcje pomiaru!', { icon: '📏' })
  }

  const handleComplete = () => {
    resetIntimateGuessing()
    // Defer onComplete to avoid setState during render
    setTimeout(() => {
      onComplete()
    }, 0)
  }

  const stats = getGuessingStats()
  const currentPlayerName = currentPlayer === 1 ? player1.name : player2.name
  const partnerName = currentPlayer === 1 ? player2.name : player1.name

  return (
    <div>
      {/* Start Interface */}
      {!intimateGuessingActive && !result && (
        <motion.div
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="text-purple-400" size={24} />
              <h3 className="text-lg font-bold text-purple-300">Intymna Zgadywanka</h3>
            </div>

            <div className="bg-purple-800/30 rounded-lg p-4 mb-4">
              <h4 className="text-white font-medium mb-2">{card.title}</h4>
              <p className="text-purple-200 text-sm mb-3">{card.description}</p>
              <div className="text-purple-300 text-xs">
                <strong>Część ciała:</strong> {card.bodyPart} | <strong>Jednostka:</strong>{' '}
                {card.measurementUnit}
              </div>
            </div>

            <button
              onClick={handleStartGuessing}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            >
              <Target size={16} />
              <span>Rozpocznij AI Zgadywankę</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Guessing Interface */}
      {intimateGuessingActive && selectedMethod && !result && (
        <motion.div
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* AI Selected Method */}
          <div className="bg-purple-700/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="text-purple-300" size={20} />
              <h4 className="text-purple-200 font-medium">AI wybrało metodę:</h4>
            </div>
            <p className="text-white font-bold">{selectedMethod.method}</p>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-purple-300">Dokładność: {selectedMethod.accuracy}</span>
              <span className="text-purple-300">Poziom: {selectedMethod.level}/3</span>
            </div>
          </div>

          {/* Player Guess Input */}
          {!showPartnerInput && (
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  {currentPlayerName}, wykonaj metodę i wpisz swój wynik:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={playerGuess}
                    onChange={e => setPlayerGuess(e.target.value)}
                    placeholder={`Wpisz ${card.measurementUnit}...`}
                    className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handlePlayerGuessSubmit}
                    disabled={!playerGuess.trim()}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Zatwierdź
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Partner Confirmation */}
          {showPartnerInput && (
            <div className="space-y-4">
              <div className="bg-pink-700/30 rounded-lg p-4">
                <h4 className="text-pink-200 font-medium mb-2">
                  {currentPlayerName} zgaduje:{' '}
                  <span className="text-white">
                    {playerGuess} {card.measurementUnit}
                  </span>
                </h4>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {partnerName}, podaj prawdziwą wartość:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={partnerAnswer}
                    onChange={e => setPartnerAnswer(e.target.value)}
                    placeholder={`Prawdziwa wartość (${card.measurementUnit})...`}
                    className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    onClick={handleEvaluate}
                    disabled={!partnerAnswer.trim()}
                    className="px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Sprawdź
                  </button>
                </div>
              </div>

              <button
                onClick={handleMeasurementProof}
                className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Ruler size={16} />
                <span>Potrzebujesz pomocy z pomiarem?</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Interface */}
      {result && (
        <motion.div
          className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {result.accuracy >= 80 ? (
                <Trophy className="text-green-400" size={24} />
              ) : (
                <Target className="text-blue-400" size={24} />
              )}
              <h3 className="text-lg font-bold text-white">Wynik Zgadywanki</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-700/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">Zgadywanie</h4>
                <p className="text-white text-lg">
                  {result.playerGuess} {card.measurementUnit}
                </p>
                <p className="text-blue-200 text-sm">Metoda: {result.method}</p>
              </div>

              <div className="bg-green-700/30 rounded-lg p-4">
                <h4 className="text-green-300 font-medium mb-2">Rzeczywistość</h4>
                <p className="text-white text-lg">
                  {result.partnerAnswer} {card.measurementUnit}
                </p>
                {result.difference !== undefined && (
                  <p className="text-green-200 text-sm">Różnica: {result.difference.toFixed(1)}</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-white mb-2">Trafność: {result.accuracy}%</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    result.accuracy >= 80
                      ? 'bg-green-500'
                      : result.accuracy >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.accuracy}%` }}
                ></div>
              </div>
            </div>

            {stats && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <h4 className="text-gray-300 font-medium mb-2">Statystyki sesji:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Łącznie zgadywań:</span>
                    <span className="text-white ml-2">{stats.totalGuesses}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Średnia trafność:</span>
                    <span className="text-white ml-2">{stats.averageAccuracy}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {countdown !== null && countdown > 0 && (
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 text-orange-300">
                  <div className="animate-pulse">⏰</div>
                  <span className="text-sm">Następna karta za: </span>
                  <span className="text-lg font-bold">{countdown}s</span>
                </div>
                <div className="w-full bg-orange-800/50 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            >
              <CheckCircle size={16} />
              <span>{countdown > 0 ? 'Przejdź teraz' : 'Zakończ zgadywankę'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Measurement Help Modal */}
      {showMeasurementHelp && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Info className="text-orange-400" size={20} />
              <h3 className="text-lg font-bold text-white">Pomoc z pomiarem</h3>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <strong>Sugerowane narzędzia:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Linijka (najdokładniejsza)</li>
                <li>Taśma miernicza (do obwodów)</li>
                <li>Sznurek + linijka (alternatywa)</li>
              </ul>
              <p>
                <strong>Część ciała:</strong> {card.bodyPart}
              </p>
              <p>
                <strong>Jednostka:</strong> {card.measurementUnit}
              </p>
            </div>

            <button
              onClick={() => setShowMeasurementHelp(false)}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Rozumiem
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default IntimateGuessingInterface 