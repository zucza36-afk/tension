import { create } from 'zustand'
import { cardDeck, getCardsByIntensity, shuffleDeck } from '../data/cards'
import * as sessionService from '../firebase/sessionService'

const useGameStore = create((set, get) => ({
  // Game state
  gameMode: 'classic', // classic, elimination, freeplay
  gameStatus: 'setup', // setup, playing, paused, ended
  currentRound: 0,
  totalRounds: 10,
  
  // Players
  players: [],
  currentPlayerIndex: 0,
  
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
  
  // Chat
  chatMessages: [],
  
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
    const { deck, usedCards, currentRound, intensityEscalation, maxIntensity } = get()
    
    if (deck.length === 0) {
      // Reshuffle used cards if deck is empty
      const reshuffledDeck = shuffleDeck(usedCards)
      set({ deck: reshuffledDeck, usedCards: [] })
      return get().drawCard()
    }
    
    let card = deck[0]
    const remainingDeck = deck.slice(1)
    
    // Intensity escalation over time
    if (intensityEscalation && currentRound > 5) {
      const escalatedCards = cardDeck.filter(c => 
        c.intensity <= Math.min(maxIntensity + 1, 5) && 
        c.intensity > card.intensity
      )
      if (escalatedCards.length > 0) {
        card = escalatedCards[Math.floor(Math.random() * escalatedCards.length)]
      }
    }
    
    set({
      deck: remainingDeck,
      currentCard: card,
      usedCards: [...usedCards, card],
      currentRound: currentRound + 1
    })
    
    // Sync to Firebase if online
    await get().syncGameStateToFirebase()
    
    return card
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
    set({ 
      gameStatus: 'playing',
      currentRound: 0,
      currentPlayerIndex: 0
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
    set({ currentPlayerIndex: nextIndex })
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
  createSession: async () => {
    console.log('[createSession] Starting session creation...')
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const sessionId = Date.now().toString()
    const localPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    console.log('[createSession] Generated sessionCode:', sessionCode, 'sessionId:', sessionId)
    
    // Always set local session first (guaranteed to work)
    set({ 
      sessionId, 
      sessionCode, 
      isOnlineSession: false,
      localPlayerId: null
    })
    
    try {
      console.log('[createSession] Attempting Firebase session creation...')
      // Try to create session in Firebase
      await sessionService.createSession({
        sessionId,
        sessionCode,
        hostId: localPlayerId,
        status: 'active',
        gameMode: 'classic',
        maxIntensity: 3,
        consensualFilter: true,
        intensityEscalation: true
      })
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
        localPlayerId 
      })
      
      // Subscribe to game state changes
      try {
        get().subscribeToOnlineGame()
        console.log('[createSession] Subscribed to online game state')
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
        gameMode: session.gameMode || 'classic',
        maxIntensity: session.maxIntensity || 3,
        consensualFilter: session.consensualFilter !== undefined ? session.consensualFilter : true,
        intensityEscalation: session.intensityEscalation !== undefined ? session.intensityEscalation : true
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
  },
  
  updateAnalytics: (updates) => {
    const { analytics } = get()
    set({ analytics: { ...analytics, ...updates } })
  },
  
  startAnalytics: () => {
    set({ 
      analytics: {
        ...get().analytics,
        startTime: Date.now()
      }
    })
  },
  
  endAnalytics: () => {
    const { analytics } = get()
    const duration = analytics.startTime ? Date.now() - analytics.startTime : 0
    set({
      analytics: {
        ...analytics,
        gameDuration: duration
      }
    })
  },
  
  // Custom cards management
  addCustomCard: (card) => {
    const { customCards } = get()
    const newCards = [...customCards, card]
    set({ customCards: newCards })
    localStorage.setItem('napiecie_customCards', JSON.stringify(newCards))
  },

  updateCustomCard: (updatedCard) => {
    const { customCards } = get()
    const newCards = customCards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    )
    set({ customCards: newCards })
    localStorage.setItem('napiecie_customCards', JSON.stringify(newCards))
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
  }
}))

export { useGameStore } 