import { create } from 'zustand'

// Intimate guessing cards data
const intimateGuessingCards = [
  {
    id: 'intimate_001',
    title: 'Wrist Circumference',
    description: 'Measure the circumference of the wrist at its widest point',
    method: 'Use your fingers to estimate, then measure with tape',
    scoring: 'Points based on accuracy: ±0.5cm = 50pts, ±1cm = 30pts, ±2cm = 10pts',
    difficulty: 'easy',
    targetGender: 'any'
  },
  {
    id: 'intimate_002',
    title: 'Neck Circumference',
    description: 'Measure the neck circumference at throat level',
    method: 'Gently wrap hands around neck, then measure with tape',
    scoring: 'Points based on accuracy: ±0.5cm = 50pts, ±1cm = 30pts, ±2cm = 10pts',
    difficulty: 'medium',
    targetGender: 'any'
  },
  {
    id: 'intimate_003',
    title: 'Hand Length',
    description: 'Measure hand length from wrist to middle finger tip',
    method: 'Compare with your own hand, then measure with ruler',
    scoring: 'Points based on accuracy: ±0.5cm = 50pts, ±1cm = 30pts, ±2cm = 10pts',
    difficulty: 'easy',
    targetGender: 'any'
  },
  {
    id: 'intimate_004',
    title: 'Arm Circumference',
    description: 'Measure the arm circumference at its widest point',
    method: 'Wrap hands around arm, then measure with tape',
    scoring: 'Points based on accuracy: ±1cm = 50pts, ±2cm = 30pts, ±3cm = 10pts',
    difficulty: 'medium',
    targetGender: 'any'
  },
  {
    id: 'intimate_005',
    title: 'Foot Length',
    description: 'Measure foot length from heel to longest toe',
    method: 'Compare with your own foot, then measure with ruler',
    scoring: 'Points based on accuracy: ±0.5cm = 50pts, ±1cm = 30pts, ±2cm = 10pts',
    difficulty: 'easy',
    targetGender: 'any'
  },
  {
    id: 'intimate_006',
    title: 'Waist Circumference',
    description: 'Measure waist circumference at the narrowest point',
    method: 'Wrap arms around waist, then measure with tape',
    scoring: 'Points based on accuracy: ±2cm = 50pts, ±4cm = 30pts, ±6cm = 10pts',
    difficulty: 'hot',
    targetGender: 'any'
  },
  {
    id: 'intimate_007',
    title: 'Hair Length',
    description: 'Measure hair length from roots to tips',
    method: 'Run fingers through hair, then measure with ruler',
    scoring: 'Points based on accuracy: ±2cm = 50pts, ±4cm = 30pts, ±6cm = 10pts',
    difficulty: 'medium',
    targetGender: 'any'
  },
  {
    id: 'intimate_008',
    title: 'Thigh Circumference',
    description: 'Measure thigh circumference at its widest point',
    method: 'Wrap hands around thigh, then measure with tape',
    scoring: 'Points based on accuracy: ±2cm = 50pts, ±4cm = 30pts, ±6cm = 10pts',
    difficulty: 'hot',
    targetGender: 'any'
  },
  {
    id: 'intimate_009',
    title: 'Chest/Bust Circumference',
    description: 'Measure chest or bust circumference at the fullest point',
    method: 'Gentle measurement with tape around the torso',
    scoring: 'Points based on accuracy: ±2cm = 50pts, ±4cm = 30pts, ±6cm = 10pts',
    difficulty: 'hot',
    targetGender: 'any'
  },
  {
    id: 'intimate_010',
    title: 'Hip Circumference',
    description: 'Measure hip circumference at the widest point',
    method: 'Wrap tape around hips at widest part',
    scoring: 'Points based on accuracy: ±2cm = 50pts, ±4cm = 30pts, ±6cm = 10pts',
    difficulty: 'hot',
    targetGender: 'any'
  }
]

export const useCoupleStore = create((set, get) => ({
  // Players
  player1: { name: 'Gracz 1', gender: 'any' },
  player2: { name: 'Gracz 2', gender: 'any' },
  currentPlayer: 1,

  // Intimate guessing state
  intimateGuessingActive: false,
  selectedMethod: null,
  playerGuess: '',
  partnerAnswer: '',
  guessingStats: [],

  // Actions
  setPlayer1: (player) => set({ player1: player }),
  setPlayer2: (player) => set({ player2: player }),
  switchPlayer: () => set((state) => ({ currentPlayer: state.currentPlayer === 1 ? 2 : 1 })),

  // Intimate guessing actions
  startIntimateGuessing: (card) => {
    set({
      intimateGuessingActive: true,
      selectedMethod: card?.method || 'Manual measurement',
      playerGuess: '',
      partnerAnswer: ''
    })
  },

  setPlayerGuess: (guess) => set({ playerGuess: guess }),
  setPartnerAnswer: (answer) => set({ partnerAnswer: answer }),

  evaluateGuess: () => {
    const { playerGuess, partnerAnswer, selectedMethod, currentPlayer } = get()
    const guess = parseFloat(playerGuess) || 0
    const actual = parseFloat(partnerAnswer) || 0
    const difference = Math.abs(guess - actual)

    let points = 0
    // Simple scoring based on accuracy
    if (difference <= 0.5) points = 50
    else if (difference <= 1) points = 30
    else if (difference <= 2) points = 10
    else points = 0

    const result = {
      playerGuess: guess,
      partnerAnswer: actual,
      difference,
      points,
      method: selectedMethod || 'Manual',
      player: currentPlayer,
      timestamp: Date.now()
    }

    set((state) => ({
      guessingStats: [...state.guessingStats, result]
    }))

    return result
  },

  requestMeasurementProof: () => {
    return {
      tools: ['Linijka', 'Taśma miernicza', 'Sznurek + linijka'],
      tips: 'Użyj dokładnych narzędzi pomiarowych dla najlepszych wyników'
    }
  },

  getGuessingStats: () => {
    const { guessingStats } = get()
    if (guessingStats.length === 0) return null

    const totalGuesses = guessingStats.length
    const totalPoints = guessingStats.reduce((sum, stat) => sum + (stat.points || 0), 0)
    const averagePoints = Math.round(totalPoints / totalGuesses)

    return {
      totalGuesses,
      totalPoints,
      averagePoints,
      bestScore: Math.max(...guessingStats.map(s => s.points || 0)),
      worstScore: Math.min(...guessingStats.map(s => s.points || 0))
    }
  },

  resetIntimateGuessing: () => {
    set({
      intimateGuessingActive: false,
      selectedMethod: null,
      playerGuess: '',
      partnerAnswer: ''
    })
  },

  getIntimateGuessingCards: () => intimateGuessingCards
})) 