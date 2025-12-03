import { create } from 'zustand'
import { cardDeck, getCardsByIntensity, shuffleDeck } from '../data/cards'
import * as sessionService from '../firebase/sessionService'
import { ref, set } from 'firebase/database'
import { realtimeDb } from '../firebase/config'
import aiService from '../services/aiService'

const useGameStore = create((set, get) => ({
  // Game state
  gameMode: 'classic', // classic, elimination, freeplay, quick, marathon, random, challenge
  gameStatus: 'setup', // setup, playing, paused, ended
  currentRound: 0,
  totalRounds: 10,
  specialMode: null, // quick, marathon, random, challenge
  
  // Players
  players: [],
  currentPlayerIndex: 0,
  playerScores: {}, // { playerId: score }
  
  // Answer system
  gamePhase: 'draw', // 'draw', 'answer', 'guess', 'result'
  currentAnswer: null, // { playerId, answer, cardId }
  currentGuess: null, // { playerId, guess }
  waitingForAnswer: false,
  
  // Cards
  deck: [],
  currentCard: null,
  usedCards: [],
  customCards: [],

  // Custom decks
  customDecks: [],
  selectedDeckId: null,
  
  // Settings
  maxIntensity: 3,
  consensualFilter: true,
  intensityEscalation: true,
  
  // Session
  sessionId: null,
  sessionCode: null,
  isOnlineSession: false,
  localPlayerId: null,
  unsubscribeFunctions: [],
  isHost: false,
  openRooms: [],
  playerJoinNotifications: [],
  
  // Chat
  chatMessages: [],
  
  // AI Bot
  aiBotEnabled: false,
  aiBotMessages: [], // { id, type: 'comment'|'hint'|'system', message, timestamp, playerId? }
  pendingHintRequest: null, // { playerId, playerName, question, hint }
  hintPenalty: 2, // Punkty odejmowane za podpowiedź
  aiBotPersonality: 'funny', // funny, serious, flirty
  
  // Initialize game
  initializeGame: async () => {
    // Clean up any existing online session
    await get().cleanupOnlineSession()

    // Load saved custom cards and decks
    get().loadCustomCards()
    get().loadCustomDecks()

    set({
      gameMode: 'classic',
      gameStatus: 'setup',
      currentRound: 0,
      totalRounds: 10,
      players: [],
      currentPlayerIndex: 0,
      deck: [],
      currentCard: null,
      usedCards: [],
      maxIntensity: 3,
      consensualFilter: true,
      intensityEscalation: true,
      sessionId: null,
      sessionCode: null,
      isOnlineSession: false,
      localPlayerId: null,
      unsubscribeFunctions: [],
      selectedDeckId: null,
    })
  },
  
  // Player management
  addPlayer: async (player) => {
    const { players, sessionId, isOnlineSession, localPlayerId } = get()
    const newPlayer = { ...player, id: player.id || `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` }
    
    if (isOnlineSession && sessionId) {
      try {
        // Add player to Firebase
        const firebasePlayerId = await sessionService.addPlayerToSession(sessionId, {
          ...newPlayer,
          addedBy: localPlayerId
        })
        // Don't update local state here - wait for subscription to sync
        // This prevents duplicates
      } catch (error) {
        console.error('Error adding player to session:', error)
        // Fallback to local only
        set({ players: [...players, newPlayer] })
      }
    } else {
      // Local only
      set({ players: [...players, newPlayer] })
    }
  },
  
  removePlayer: async (playerId) => {
    const { players, sessionId, isOnlineSession } = get()
    const player = players.find(p => p.id === playerId)
    
    if (isOnlineSession && sessionId && player?.firebaseId) {
      try {
        await sessionService.removePlayerFromSession(sessionId, player.firebaseId)
        // Local state will be synced via subscription
      } catch (error) {
        console.error('Error removing player from session:', error)
        // Fallback to local only
        set({ players: players.filter(p => p.id !== playerId) })
      }
    } else {
      set({ players: players.filter(p => p.id !== playerId) })
    }
  },
  
  updatePlayer: (playerId, updates) => {
    const { players } = get()
    set({
      players: players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      )
    })
  },
  
  // Card management
  initializeDeck: () => {
    const { maxIntensity, consensualFilter, selectedDeckId, customDecks, customCards } = get()

    let filteredDeck = cardDeck

    // If custom deck is selected, use it
    if (selectedDeckId) {
      const selectedDeck = customDecks.find(d => d.id === selectedDeckId)
      if (selectedDeck && selectedDeck.cards.length > 0) {
        // Get actual card objects from deck's card IDs
        const deckCards = selectedDeck.cards.map(cardId => {
          // First check custom cards
          const customCard = customCards.find(c => c.id === cardId)
          if (customCard) return customCard

          // Then check built-in cards
          const builtInCard = cardDeck.find(c => c.id === cardId)
          return builtInCard
        }).filter(Boolean)

        if (deckCards.length > 0) {
          filteredDeck = deckCards
        }
      }
    }

    // Apply intensity filtering if consensual filter is enabled and not using custom deck
    if (consensualFilter && !selectedDeckId) {
      filteredDeck = getCardsByIntensity(maxIntensity)
    }

    const shuffledDeck = shuffleDeck(filteredDeck)
    set({ deck: shuffledDeck })
  },
  
  drawCard: async () => {
    const { deck, usedCards, currentRound, intensityEscalation, maxIntensity, specialMode } = get()
    
    if (deck.length === 0) {
      // Reshuffle used cards if deck is empty
      const reshuffledDeck = shuffleDeck(usedCards)
      set({ deck: reshuffledDeck, usedCards: [] })
      return get().drawCard()
    }
    
    let card = deck[0]
    const remainingDeck = deck.slice(1)
    
    // Special mode logic
    if (specialMode === 'random') {
      // Completely random card from all available cards
      const allCards = [...cardDeck, ...get().customCards]
      const availableCards = allCards.filter(c => 
        !usedCards.some(uc => uc.id === c.id)
      )
      if (availableCards.length > 0) {
        card = availableCards[Math.floor(Math.random() * availableCards.length)]
      }
    } else if (specialMode === 'challenge') {
      // Only high intensity cards (4-5)
      const challengeCards = deck.filter(c => c.intensity >= 4)
      if (challengeCards.length > 0) {
        card = challengeCards[Math.floor(Math.random() * challengeCards.length)]
      }
    }
    
    // Intensity escalation over time
    if (intensityEscalation && currentRound > 5 && specialMode !== 'challenge') {
      const escalatedCards = cardDeck.filter(c => 
        c.intensity <= Math.min(maxIntensity + 1, 5) && 
        c.intensity > card.intensity
      )
      if (escalatedCards.length > 0) {
        card = escalatedCards[Math.floor(Math.random() * escalatedCards.length)]
      }
    }
    
    // Set game phase based on card type
    let newPhase = 'draw'
    if (card.type === 'Truth' || card.type === 'Dare') {
      newPhase = 'answer'
    }
    
    set({
      deck: remainingDeck,
      currentCard: card,
      usedCards: [...usedCards, card],
      currentRound: currentRound + 1,
      gamePhase: newPhase
    })
    
    // Sync to Firebase if online
    await get().syncGameStateToFirebase()
    
    return card
  },
  
  setSpecialMode: (mode) => {
    set({ specialMode: mode })
    
    // Apply special mode settings
    if (mode === 'quick') {
      set({ totalRounds: 5 }) // 5 minutes = ~5 rounds
    } else if (mode === 'marathon') {
      set({ totalRounds: 50 }) // Long session
    } else if (mode === 'random') {
      // No special settings, just random card selection
    } else if (mode === 'challenge') {
      set({ maxIntensity: 5 }) // Only max intensity
    }
  },
  
  skipCard: async () => {
    const { currentCard, usedCards } = get()
    if (currentCard) {
      set({
        usedCards: usedCards.filter(c => c.id !== currentCard.id),
        currentCard: null
      })
      // Sync to Firebase if online
      await get().syncGameStateToFirebase()
    }
  },
  
  // Game flow
  startGame: async () => {
    const { players } = get()
    if (players.length < 2) {
      throw new Error('Potrzeba minimum 2 graczy')
    }
    
    get().initializeDeck()
    
    // Initialize scores
    const scores = {}
    players.forEach(player => {
      scores[player.id] = 0
    })
    
    set({ 
      gameStatus: 'playing',
      currentRound: 0,
      currentPlayerIndex: 0,
      gamePhase: 'draw',
      playerScores: scores,
      currentAnswer: null,
      currentGuess: null,
      waitingForAnswer: false
    })
    
    // Sync to Firebase if online
    await get().syncGameStateToFirebase()
  },
  
  pauseGame: async () => {
    set({ gameStatus: 'paused' })
    await get().syncGameStateToFirebase()
  },
  
  resumeGame: async () => {
    set({ 
      safeWordActivated: false,
      gameStatus: 'playing'
    })
    await get().syncGameStateToFirebase()
  },

  endGame: async () => {
    set({ gameStatus: 'ended' })
    await get().syncGameStateToFirebase()
    await get().cleanupOnlineSession()
  },

  nextPlayer: async () => {
    const { players, currentPlayerIndex } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length
    set({ 
      currentPlayerIndex: nextIndex,
      gamePhase: 'draw',
      currentAnswer: null,
      currentGuess: null,
      waitingForAnswer: false
    })
    await get().syncGameStateToFirebase()
  },
  
  // Answer system
  submitAnswer: async (answer) => {
    const { currentCard, currentPlayerIndex, players } = get()
    const currentPlayer = players[currentPlayerIndex]
    
    set({
      currentAnswer: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.nickname,
        answer: answer.trim(),
        cardId: currentCard?.id,
        cardTitle: currentCard?.title
      },
      gamePhase: 'guess',
      waitingForAnswer: true
    })
    
    await get().syncGameStateToFirebase()
  },
  
  submitGuess: async (guess) => {
    const { players, currentPlayerIndex, currentAnswer } = get()
    const guessingPlayerIndex = (currentPlayerIndex + 1) % players.length
    const guessingPlayer = players[guessingPlayerIndex]
    
    if (!currentAnswer) {
      throw new Error('Brak odpowiedzi do odgadnięcia')
    }
    
    const score = get().calculateScore(currentAnswer.answer, guess.trim())
    
    set({
      currentGuess: {
        playerId: guessingPlayer.id,
        playerName: guessingPlayer.nickname,
        guess: guess.trim(),
        score: score
      },
      gamePhase: 'result'
    })
    
    // Update score
    const { playerScores } = get()
    const newScores = {
      ...playerScores,
      [guessingPlayer.id]: (playerScores[guessingPlayer.id] || 0) + score
    }
    set({ playerScores: newScores })
    
    await get().syncGameStateToFirebase()
  },
  
  calculateScore: (correctAnswer, guess) => {
    // Normalize strings for comparison
    const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '')
    const correct = normalize(correctAnswer)
    const guessed = normalize(guess)
    
    // Exact match
    if (correct === guessed) {
      return 10
    }
    
    // Check if guess contains correct answer or vice versa
    if (correct.includes(guessed) || guessed.includes(correct)) {
      const similarity = Math.min(correct.length, guessed.length) / Math.max(correct.length, guessed.length)
      return Math.round(similarity * 8) + 1 // 1-9 points
    }
    
    // Calculate word similarity using Levenshtein distance
    const distance = get().levenshteinDistance(correct, guessed)
    const maxLength = Math.max(correct.length, guessed.length)
    const similarity = 1 - (distance / maxLength)
    
    // Score from 0-8 based on similarity
    return Math.max(0, Math.round(similarity * 8))
  },
  
  levenshteinDistance: (str1, str2) => {
    const matrix = []
    const len1 = str1.length
    const len2 = str2.length
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[len2][len1]
  },
  
  continueToNextRound: async () => {
    const { currentRound, totalRounds } = get()
    if (currentRound >= totalRounds - 1) {
      await get().endGame()
      return
    }
    
    await get().nextPlayer()
    set({ currentCard: null, gamePhase: 'draw' })
    await get().syncGameStateToFirebase()
  },

  // Settings
  setGameMode: (mode) => {
    set({ gameMode: mode })
  },

  setMaxIntensity: (intensity) => {
    set({ maxIntensity: intensity })
  },

  setConsensualFilter: (enabled) => {
    set({ consensualFilter: enabled })
  },

  setIntensityEscalation: (enabled) => {
    set({ intensityEscalation: enabled })
  },

  // Session management
  createSession: async (settings = {}) => {
    console.log('[createSession] Starting session creation...', settings)
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const sessionId = Date.now().toString()
    const localPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const hostName = settings.hostName || 'Host'
    
    console.log('[createSession] Generated sessionCode:', sessionCode, 'sessionId:', sessionId)
    
    // Always set local session first (guaranteed to work)
    set({ 
      sessionId, 
      sessionCode, 
      isOnlineSession: false,
      localPlayerId: null,
      isHost: false
    })
    
    try {
      console.log('[createSession] Attempting Firebase session creation...')
      // Try to create session in Firebase
      await sessionService.createSession({
        sessionId,
        sessionCode,
        hostId: localPlayerId,
        hostName: hostName,
        status: 'active',
        gameMode: settings.gameMode || get().gameMode || 'classic',
        maxIntensity: settings.maxIntensity || get().maxIntensity || 3,
        consensualFilter: settings.consensualFilter !== undefined ? settings.consensualFilter : get().consensualFilter !== undefined ? get().consensualFilter : true,
        intensityEscalation: settings.intensityEscalation !== undefined ? settings.intensityEscalation : get().intensityEscalation !== undefined ? get().intensityEscalation : true,
        aiBotEnabled: settings.aiBotEnabled || false,
        playerCount: 1,
        maxPlayers: settings.maxPlayers || 10
      })
      
      // Update local settings if provided
      if (settings.gameMode) set({ gameMode: settings.gameMode })
      if (settings.maxIntensity) set({ maxIntensity: settings.maxIntensity })
      if (settings.consensualFilter !== undefined) set({ consensualFilter: settings.consensualFilter })
      if (settings.intensityEscalation !== undefined) set({ intensityEscalation: settings.intensityEscalation })
      if (settings.aiBotEnabled !== undefined) set({ aiBotEnabled: settings.aiBotEnabled })
      console.log('[createSession] Firebase session created successfully')
      
      // Try to initialize game state in Firebase (non-critical)
      try {
        await sessionService.updateGameState(sessionId, {
          gameStatus: 'setup',
          currentRound: 0,
          totalRounds: 10,
          currentPlayerIndex: 0,
          currentCard: null,
          players: []
        })
        console.log('[createSession] Firebase game state initialized')
      } catch (stateError) {
        console.warn('[createSession] Failed to initialize game state, continuing anyway:', stateError.message)
        // Don't fail the whole session creation if state init fails
      }
      
      // Update to online session
      set({ 
        sessionId, 
        sessionCode, 
        isOnlineSession: true,
        localPlayerId,
        isHost: true
      })
      
      // Subscribe to game state changes
      try {
        get().subscribeToOnlineGame()
        console.log('[createSession] Subscribed to online game state')
        
        // Subscribe to player join notifications for host
        const unsubNotifications = sessionService.subscribeToPlayerJoinNotifications(
          sessionId,
          localPlayerId,
          (notification) => {
            const { playerJoinNotifications } = get()
            set({
              playerJoinNotifications: [...playerJoinNotifications, {
                id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                ...notification,
                timestamp: Date.now()
              }]
            })
          }
        )
        get().unsubscribeFunctions.push(unsubNotifications)
      } catch (subError) {
        console.warn('[createSession] Failed to subscribe, continuing anyway:', subError.message)
      }
      
      console.log('[createSession] Returning session:', { sessionId, sessionCode })
      return { sessionId, sessionCode }
    } catch (error) {
      console.warn('[createSession] Firebase session creation failed, using local session:', error.message, error)
      // Already set to local session above, just return
      console.log('[createSession] Returning local session:', { sessionId, sessionCode })
      return { sessionId, sessionCode }
    }
  },

  joinSession: async (sessionCode) => {
    try {
      const session = await sessionService.joinSession(sessionCode)
      const localPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      set({ 
        sessionId: session.id,
        sessionCode: session.sessionCode,
        isOnlineSession: true,
        localPlayerId,
        isHost: false,
        gameMode: session.gameMode || 'classic',
        maxIntensity: session.maxIntensity || 3,
        consensualFilter: session.consensualFilter !== undefined ? session.consensualFilter : true,
        intensityEscalation: session.intensityEscalation !== undefined ? session.intensityEscalation : true,
        aiBotEnabled: session.aiBotEnabled || false
      })
      
      // Subscribe to game state changes
      get().subscribeToOnlineGame()
      
      return session
    } catch (error) {
      console.error('Error joining session:', error)
      throw error
    }
  },

  subscribeToOnlineGame: () => {
    const { sessionId, unsubscribeFunctions } = get()
    if (!sessionId || !get().isOnlineSession) return
    
    // Clean up existing subscriptions
    unsubscribeFunctions.forEach(unsub => unsub())
    
    const newUnsubs = []
    
    // Subscribe to game state
    const unsubGameState = sessionService.subscribeToGameState(sessionId, (gameState) => {
      if (gameState) {
        set({
          gameStatus: gameState.gameStatus || 'setup',
          currentRound: gameState.currentRound || 0,
          currentPlayerIndex: gameState.currentPlayerIndex || 0,
          currentCard: gameState.currentCard || null
        })
      }
    })
    newUnsubs.push(unsubGameState)
    
    // Subscribe to players
    const unsubPlayers = sessionService.subscribeToPlayers(sessionId, (playersData) => {
      if (playersData) {
        // Convert Firebase object to array, preserving firebaseId
        const playersArray = Object.entries(playersData).map(([firebaseId, playerData]) => ({
          ...playerData,
          firebaseId
        }))
        set({ players: playersArray })
      }
    })
    newUnsubs.push(unsubPlayers)
    
    // Subscribe to chat
    const unsubChat = sessionService.subscribeToChat(sessionId, (chatData) => {
      if (chatData) {
        // Convert Firebase object to array
        const messagesArray = Object.entries(chatData)
          .map(([id, message]) => ({
            id,
            ...message
          }))
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        set({ chatMessages: messagesArray })
      }
    })
    newUnsubs.push(unsubChat)
    
    // Subscribe to hint requests
    const unsubHintRequest = sessionService.subscribeToHintRequest(sessionId, (hintRequest) => {
      set({ pendingHintRequest: hintRequest || null })
    })
    newUnsubs.push(unsubHintRequest)
    
    set({ unsubscribeFunctions: newUnsubs })
  },

  syncGameStateToFirebase: async () => {
    const { sessionId, isOnlineSession, gameStatus, currentRound, currentPlayerIndex, currentCard } = get()
    if (!sessionId || !isOnlineSession) return
    
    try {
      await sessionService.updateGameState(sessionId, {
        gameStatus,
        currentRound,
        currentPlayerIndex,
        currentCard
      })
    } catch (error) {
      console.error('Error syncing game state:', error)
    }
  },

  cleanupOnlineSession: async () => {
    const { unsubscribeFunctions, sessionId, isOnlineSession } = get()
    
    // Clean up subscriptions
    unsubscribeFunctions.forEach(unsub => unsub())
    set({ unsubscribeFunctions: [] })
    
    // Clean up session in Firebase
    if (sessionId && isOnlineSession) {
      try {
        await sessionService.cleanupSession(sessionId)
      } catch (error) {
        console.error('Error cleaning up session:', error)
      }
    }
  },

  // Vote management
  votes: {},

  addVote: (voterId, targetId) => {
    const { votes } = get()
    set({ votes: { ...votes, [voterId]: targetId } })
  },

  submitVote: (targetId) => {
    const { votes } = get()
    const voterId = 'currentPlayer' // For single device play
    set({ votes: { ...votes, [voterId]: targetId } })
  },

  getVoteResults: () => {
    const { votes, players } = get()
    const voteCounts = {}
    
    players.forEach(player => {
      voteCounts[player.id] = 0
    })
    
    Object.values(votes).forEach(targetId => {
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId]++
      }
    })
    
    return voteCounts
  },

  clearVotes: () => {
    set({ votes: {} })
  },

  // Safe word
  safeWordActivated: false,

  activateSafeWord: () => {
    set({ 
      safeWordActivated: true,
      gameStatus: 'paused'
    })
  },

  deactivateSafeWord: () => {
    set({ 
      safeWordActivated: false,
      gameStatus: 'playing'
    })
  },
  
  // Analytics
  analytics: {
    cardsPlayed: 0,
    cardsSkipped: 0,
    safeWordsUsed: 0,
    gameDuration: 0,
    startTime: null,
    cardHistory: [], // Detailed card history
    playerStats: {}, // { playerId: { cardsPlayed, cardsSkipped, avgIntensity, favoriteType } }
    intensityDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    typeDistribution: {}, // { Truth: 0, Dare: 0, ... }
    roundTimings: [], // Time per round
    preferences: {
      favoriteIntensity: null,
      favoriteType: null,
      mostActivePlayer: null
    }
  },
  
  updateAnalytics: (updates) => {
    const { analytics, currentCard, currentPlayerIndex, players } = get()
    
    // Track card details if currentCard exists
    if (currentCard && updates.cardsPlayed) {
      const cardEntry = {
        cardId: currentCard.id,
        cardTitle: currentCard.title,
        type: currentCard.type,
        intensity: currentCard.intensity,
        playerId: players[currentPlayerIndex]?.id,
        playerName: players[currentPlayerIndex]?.nickname,
        timestamp: Date.now(),
        round: analytics.cardsPlayed + 1
      }
      
      const newCardHistory = [...(analytics.cardHistory || []), cardEntry]
      
      // Update intensity distribution
      const newIntensityDist = { ...(analytics.intensityDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }) }
      newIntensityDist[currentCard.intensity] = (newIntensityDist[currentCard.intensity] || 0) + 1
      
      // Update type distribution
      const newTypeDist = { ...(analytics.typeDistribution || {}) }
      newTypeDist[currentCard.type] = (newTypeDist[currentCard.type] || 0) + 1
      
      // Update player stats
      const newPlayerStats = { ...(analytics.playerStats || {}) }
      const playerId = players[currentPlayerIndex]?.id
      if (playerId) {
        if (!newPlayerStats[playerId]) {
          newPlayerStats[playerId] = {
            cardsPlayed: 0,
            cardsSkipped: 0,
            intensities: [],
            types: []
          }
        }
        newPlayerStats[playerId].cardsPlayed++
        newPlayerStats[playerId].intensities.push(currentCard.intensity)
        newPlayerStats[playerId].types.push(currentCard.type)
      }
      
      set({
        analytics: {
          ...analytics,
          ...updates,
          cardHistory: newCardHistory,
          intensityDistribution: newIntensityDist,
          typeDistribution: newTypeDist,
          playerStats: newPlayerStats
        }
      })
    } else {
      set({ analytics: { ...analytics, ...updates } })
    }
  },
  
  startAnalytics: () => {
    set({ 
      analytics: {
        cardsPlayed: 0,
        cardsSkipped: 0,
        safeWordsUsed: 0,
        gameDuration: 0,
        startTime: Date.now(),
        cardHistory: [],
        playerStats: {},
        intensityDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        typeDistribution: {},
        roundTimings: [],
        preferences: {
          favoriteIntensity: null,
          favoriteType: null,
          mostActivePlayer: null
        }
      }
    })
  },
  
  endAnalytics: () => {
    const { analytics, players, usedCards } = get()
    const duration = analytics.startTime ? Date.now() - analytics.startTime : 0
    
    // Calculate preferences
    const intensityCounts = analytics.intensityDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const favoriteIntensity = Object.entries(intensityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null
    
    const typeCounts = analytics.typeDistribution || {}
    const favoriteType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null
    
    const playerActivity = Object.entries(analytics.playerStats || {})
      .map(([id, stats]) => ({
        id,
        name: players.find(p => p.id === id)?.nickname || 'Unknown',
        cardsPlayed: stats.cardsPlayed || 0
      }))
      .sort((a, b) => b.cardsPlayed - a.cardsPlayed)[0]
    
    set({
      analytics: {
        ...analytics,
        gameDuration: duration,
        endTime: Date.now(),
        preferences: {
          favoriteIntensity: favoriteIntensity ? parseInt(favoriteIntensity) : null,
          favoriteType: favoriteType,
          mostActivePlayer: playerActivity
        }
      }
    })
  },
  
  getAnalyticsReport: () => {
    const { analytics, players, usedCards } = get()
    
    return {
      summary: {
        totalCards: analytics.cardsPlayed || 0,
        skippedCards: analytics.cardsSkipped || 0,
        duration: analytics.gameDuration || 0,
        players: players.length
      },
      intensityDistribution: analytics.intensityDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      typeDistribution: analytics.typeDistribution || {},
      playerStats: analytics.playerStats || {},
      preferences: analytics.preferences || {},
      cardHistory: analytics.cardHistory || [],
      topCards: (usedCards || [])
        .map(card => ({
          ...card,
          playCount: (analytics.cardHistory || []).filter(ch => ch.cardId === card.id).length
        }))
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 10)
    }
  },
  
  // Custom cards management
  addCustomCard: (card) => {
    const { customCards } = get()
    const newCard = {
      ...card,
      id: card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ratings: [],
      averageRating: 0,
      playCount: 0,
      lastPlayed: null
    }
    const newCards = [...customCards, newCard]
    set({ customCards: newCards })
    localStorage.setItem('napiecie_customCards', JSON.stringify(newCards))
  },

  updateCustomCard: (updatedCard) => {
    const { customCards } = get()
    const existingCard = customCards.find(c => c.id === updatedCard.id)
    if (!existingCard) return
    
    // Create new version
    const newVersion = {
      ...updatedCard,
      version: (existingCard.version || 1) + 1,
      updatedAt: Date.now(),
      previousVersion: existingCard.version || 1,
      // Preserve ratings and playCount
      ratings: existingCard.ratings || [],
      averageRating: existingCard.averageRating || 0,
      playCount: existingCard.playCount || 0,
      lastPlayed: existingCard.lastPlayed
    }
    
    const updatedCards = customCards.map(card => 
      card.id === updatedCard.id ? newVersion : card
    )
    set({ customCards: updatedCards })
    localStorage.setItem('napiecie_customCards', JSON.stringify(updatedCards))
  },

  rateCard: (cardId, rating, playerId) => {
    const { customCards } = get()
    const card = customCards.find(c => c.id === cardId)
    if (!card) return
    
    const ratings = card.ratings || []
    // Remove existing rating from this player
    const filteredRatings = ratings.filter(r => r.playerId !== playerId)
    // Add new rating
    const newRatings = [...filteredRatings, { playerId, rating, timestamp: Date.now() }]
    
    // Calculate average
    const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length
    
    const updatedCards = customCards.map(c => 
      c.id === cardId 
        ? { ...c, ratings: newRatings, averageRating: averageRating.toFixed(1) }
        : c
    )
    set({ customCards: updatedCards })
  },
  
  suggestNewCard: async () => {
    // Use AI to suggest a new card based on game history
    try {
      const { analytics, players } = get()
      const favoriteType = analytics.preferences?.favoriteType || 'Truth'
      const favoriteIntensity = analytics.preferences?.favoriteIntensity || 3
      
      // This would call AI service to generate card suggestion
      // For now, return a template
      return {
        title: '',
        description: '',
        type: favoriteType,
        intensity: favoriteIntensity,
        target: 'one',
        tags: [],
        suggested: true
      }
    } catch (error) {
      console.error('Error suggesting card:', error)
      return null
    }
  },
  
  exportCards: (cardIds) => {
    const { customCards } = get()
    const cardsToExport = cardIds 
      ? customCards.filter(c => cardIds.includes(c.id))
      : customCards
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      cards: cardsToExport.map(c => ({
        title: c.title,
        description: c.description,
        type: c.type,
        target: c.target,
        intensity: c.intensity,
        tags: c.tags || []
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `napiecie-cards-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  },
  
  importCards: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          const { customCards } = get()
          
          const importedCards = importData.cards.map(card => ({
            ...card,
            id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            version: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ratings: [],
            averageRating: 0,
            playCount: 0,
            imported: true
          }))
          
          set({ customCards: [...customCards, ...importedCards] })
          resolve(importedCards.length)
        } catch (error) {
          reject(new Error('Invalid file format'))
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  },
  
  removeCustomCard: (cardId) => {
    const { customCards } = get()
    const newCards = customCards.filter(card => card.id !== cardId)
    set({ customCards: newCards })
    localStorage.setItem('napiecie_customCards', JSON.stringify(newCards))
  },

  loadCustomCards: () => {
    try {
      const savedCards = localStorage.getItem('napiecie_customCards')
      if (savedCards) {
        set({ customCards: JSON.parse(savedCards) })
      }
    } catch (error) {
      console.error('Error loading custom cards:', error)
    }
  },

  // Custom decks management
  createCustomDeck: (deckData) => {
    const { customDecks } = get()
    const newDeck = {
      id: `deck_${Date.now()}`,
      name: deckData.name,
      description: deckData.description,
      cards: deckData.cards || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: deckData.isPublic || false,
      tags: deckData.tags || []
    }
    const newDecks = [...customDecks, newDeck]
    set({ customDecks: newDecks })
    localStorage.setItem('napiecie_customDecks', JSON.stringify(newDecks))
    return newDeck.id
  },

  updateCustomDeck: (updatedDeck) => {
    const { customDecks } = get()
    const newDecks = customDecks.map(deck =>
      deck.id === updatedDeck.id ? { ...updatedDeck, updatedAt: Date.now() } : deck
    )
    set({ customDecks: newDecks })
    localStorage.setItem('napiecie_customDecks', JSON.stringify(newDecks))
  },

  removeCustomDeck: (deckId) => {
    const { customDecks } = get()
    const newDecks = customDecks.filter(deck => deck.id !== deckId)
    set({ customDecks: newDecks })
    localStorage.setItem('napiecie_customDecks', JSON.stringify(newDecks))
  },

  addCardToDeck: (deckId, cardId) => {
    const { customDecks } = get()
    const newDecks = customDecks.map(deck => {
      if (deck.id === deckId && !deck.cards.includes(cardId)) {
        return { ...deck, cards: [...deck.cards, cardId], updatedAt: Date.now() }
      }
      return deck
    })
    set({ customDecks: newDecks })
    localStorage.setItem('napiecie_customDecks', JSON.stringify(newDecks))
  },

  removeCardFromDeck: (deckId, cardId) => {
    const { customDecks } = get()
    const newDecks = customDecks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, cards: deck.cards.filter(id => id !== cardId), updatedAt: Date.now() }
      }
      return deck
    })
    set({ customDecks: newDecks })
    localStorage.setItem('napiecie_customDecks', JSON.stringify(newDecks))
  },

  loadCustomDecks: () => {
    try {
      const savedDecks = localStorage.getItem('napiecie_customDecks')
      if (savedDecks) {
        set({ customDecks: JSON.parse(savedDecks) })
      }
    } catch (error) {
      console.error('Error loading custom decks:', error)
    }
  },

  setSelectedDeck: (deckId) => {
    set({ selectedDeckId: deckId })
  },

  getDeckCards: (deckId) => {
    const { customDecks, customCards, cardDeck } = get()
    const deck = customDecks.find(d => d.id === deckId)
    if (!deck) return []

    return deck.cards.map(cardId => {
      // First check custom cards
      const customCard = customCards.find(c => c.id === cardId)
      if (customCard) return customCard

      // Then check built-in cards
      const builtInCard = cardDeck.find(c => c.id === cardId)
      return builtInCard
    }).filter(Boolean)
  },
  
  // Update settings
  updateSettings: (settings) => {
    set(settings)
  },
  
  // Chat management
  sendChatMessage: async (message) => {
    const { sessionId, isOnlineSession, localPlayerId, players } = get()
    if (!sessionId || !isOnlineSession) {
      // Local fallback - add to local messages
      const newMessage = {
        id: `local_${Date.now()}`,
        text: message.text,
        playerId: message.playerId || localPlayerId,
        playerName: message.playerName || players.find(p => p.id === message.playerId)?.nickname || 'Gracz',
        timestamp: Date.now()
      }
      set({ chatMessages: [...get().chatMessages, newMessage] })
      return
    }
    
    try {
      await sessionService.sendChatMessage(sessionId, {
        text: message.text,
        playerId: message.playerId || localPlayerId,
        playerName: message.playerName || players.find(p => p.id === (message.playerId || localPlayerId))?.nickname || 'Gracz'
      })
    } catch (error) {
      console.error('Error sending chat message:', error)
      // Fallback to local
      const newMessage = {
        id: `local_${Date.now()}`,
        text: message.text,
        playerId: message.playerId || localPlayerId,
        playerName: message.playerName || players.find(p => p.id === message.playerId)?.nickname || 'Gracz',
        timestamp: Date.now()
      }
      set({ chatMessages: [...get().chatMessages, newMessage] })
    }
  },
  
  clearChatMessages: () => {
    set({ chatMessages: [] })
  },
  
  // AI Bot functions
  setAIBotEnabled: (enabled) => {
    set({ aiBotEnabled: enabled })
    if (!enabled) {
      set({ aiBotMessages: [], pendingHintRequest: null })
    }
  },
  
  setAIBotPersonality: (personality) => {
    set({ aiBotPersonality: personality })
    if (typeof aiService !== 'undefined') {
      aiService.setPersonality(personality)
    }
  },
  
  requestHint: async (hintData) => {
    const { sessionId, isOnlineSession } = get()
    
    const hintRequest = {
      id: `hint_${Date.now()}`,
      ...hintData,
      timestamp: Date.now()
    }
    
    set({ pendingHintRequest: hintRequest })
    
    // Sync to Firebase if online
    if (isOnlineSession && sessionId) {
      try {
        const gameStateRef = ref(realtimeDb, `games/${sessionId}/pendingHintRequest`)
        await set(gameStateRef, hintRequest)
      } catch (error) {
        console.error('Error syncing hint request:', error)
      }
    }
  },
  
  acceptHint: async () => {
    const { pendingHintRequest, players, playerScores, sessionId, isOnlineSession } = get()
    
    if (!pendingHintRequest) return
    
    // Odejmij punkty graczowi, który poprosił o podpowiedź
    const requestingPlayer = players.find(p => p.id === pendingHintRequest.playerId)
    if (requestingPlayer) {
      const newScores = { ...playerScores }
      const currentScore = newScores[pendingHintRequest.playerId] || 0
      newScores[pendingHintRequest.playerId] = Math.max(0, currentScore - get().hintPenalty)
      
      set({ 
        playerScores: newScores,
        pendingHintRequest: null
      })
      
      // Dodaj wiadomość AI
      get().addAIBotMessage({
        type: 'hint',
        message: `Podpowiedź: ${pendingHintRequest.hint}`,
        playerName: requestingPlayer.nickname,
        timestamp: Date.now()
      })
    }
    
    // Sync to Firebase
    if (isOnlineSession && sessionId) {
      await get().syncGameStateToFirebase()
    }
  },
  
  declineHint: async () => {
    set({ pendingHintRequest: null })
    
    const { sessionId, isOnlineSession } = get()
    if (isOnlineSession && sessionId) {
      try {
        const gameStateRef = ref(realtimeDb, `games/${sessionId}/pendingHintRequest`)
        await set(gameStateRef, null)
      } catch (error) {
        console.error('Error syncing hint decline:', error)
      }
    }
  },
  
  addAIBotMessage: (message) => {
    const { aiBotMessages } = get()
    set({
      aiBotMessages: [...aiBotMessages, {
        id: `ai_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...message
      }]
    })
  },
  
  clearAIBotMessages: () => {
    set({ aiBotMessages: [] })
  },
  
  // Open rooms management
  loadOpenRooms: async () => {
    try {
      const rooms = await sessionService.getOpenRooms(20)
      set({ openRooms: rooms })
      return rooms
    } catch (error) {
      console.error('Error loading open rooms:', error)
      return []
    }
  },
  
  subscribeToOpenRooms: (callback) => {
    const unsubscribe = sessionService.subscribeToOpenRooms((rooms) => {
      set({ openRooms: rooms })
      if (callback) callback(rooms)
    })
    
    return unsubscribe
  },
  
  clearPlayerJoinNotifications: () => {
    set({ playerJoinNotifications: [] })
  },
  
  removePlayerJoinNotification: (notificationId) => {
    const { playerJoinNotifications } = get()
    set({
      playerJoinNotifications: playerJoinNotifications.filter(n => n.id !== notificationId)
    })
  }
}))

export { useGameStore } 