import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { 
  ref, 
  set, 
  get, 
  onValue, 
  off,
  push,
  remove
} from 'firebase/database'
import { db, realtimeDb, isFirebaseConfigured } from './config'

// Session management
export const createSession = async (sessionData) => {
  if (!isFirebaseConfigured() || !db) {
    console.log('[Firebase] Firebase not configured, skipping online session creation')
    const error = new Error('Firebase nie jest skonfigurowane')
    error.code = 'FIREBASE_NOT_CONFIGURED'
    throw error
  }

  try {
    console.log('[Firebase] Creating session in Firestore:', sessionData.sessionId)
    const sessionRef = doc(db, 'sessions', sessionData.sessionId)
    await setDoc(sessionRef, {
      ...sessionData,
      createdAt: new Date(),
      status: 'active'
    })
    console.log('[Firebase] Session created successfully in Firestore')
    return sessionData.sessionId
  } catch (error) {
    console.error('[Firebase] Error creating session in Firestore:', error)
    console.error('[Firebase] Error details:', error.code, error.message)
    // Re-throw with more context
    error.code = error.code || 'FIREBASE_ERROR'
    throw error
  }
}

export const getSession = async (sessionId) => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const sessionRef = doc(db, 'sessions', sessionId)
    const sessionSnap = await getDoc(sessionRef)
    
    if (sessionSnap.exists()) {
      return { id: sessionSnap.id, ...sessionSnap.data() }
    } else {
      throw new Error('Session not found')
    }
  } catch (error) {
    console.error('Error getting session:', error)
    throw error
  }
}

export const updateSession = async (sessionId, updates) => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const sessionRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

// Get list of open rooms
export const getOpenRooms = async (limitCount = 20) => {
  if (!isFirebaseConfigured() || !db) {
    return []
  }
  
  try {
    const sessionsRef = collection(db, 'sessions')
    const q = query(
      sessionsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const rooms = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      rooms.push({
        id: doc.id,
        sessionCode: data.sessionCode,
        hostId: data.hostId,
        hostName: data.hostName || 'Host',
        gameMode: data.gameMode || 'classic',
        maxIntensity: data.maxIntensity || 3,
        playerCount: data.playerCount || 0,
        maxPlayers: data.maxPlayers || 10,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        settings: {
          gameMode: data.gameMode,
          maxIntensity: data.maxIntensity,
          consensualFilter: data.consensualFilter,
          intensityEscalation: data.intensityEscalation,
          aiBotEnabled: data.aiBotEnabled
        }
      })
    })
    
    return rooms
  } catch (error) {
    console.error('Error getting open rooms:', error)
    return []
  }
}

// Subscribe to open rooms
export const subscribeToOpenRooms = (callback, limitCount = 20) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {}
  }
  
  const sessionsRef = collection(db, 'sessions')
  const q = query(
    sessionsRef,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const rooms = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      rooms.push({
        id: doc.id,
        sessionCode: data.sessionCode,
        hostId: data.hostId,
        hostName: data.hostName || 'Host',
        gameMode: data.gameMode || 'classic',
        maxIntensity: data.maxIntensity || 3,
        playerCount: data.playerCount || 0,
        maxPlayers: data.maxPlayers || 10,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        settings: {
          gameMode: data.gameMode,
          maxIntensity: data.maxIntensity,
          consensualFilter: data.consensualFilter,
          intensityEscalation: data.intensityEscalation,
          aiBotEnabled: data.aiBotEnabled
        }
      })
    })
    callback(rooms)
  }, (error) => {
    console.error('Error subscribing to open rooms:', error)
    callback([])
  })
}

// Subscribe to player join notifications for host
export const subscribeToPlayerJoinNotifications = (sessionId, hostId, callback) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    return () => {}
  }
  
  const playersRef = ref(realtimeDb, `games/${sessionId}/players`)
  
  let previousPlayerCount = 0
  
  const unsubscribe = onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val()
    const currentPlayerCount = playersData ? Object.keys(playersData).length : 0
    
    // If player count increased, notify host
    if (currentPlayerCount > previousPlayerCount && previousPlayerCount > 0) {
      const newPlayers = Object.entries(playersData || {})
        .filter(([_, player]) => player.id !== hostId)
        .map(([_, player]) => player)
      
      if (newPlayers.length > 0) {
        callback({
          type: 'player_joined',
          player: newPlayers[newPlayers.length - 1], // Most recent
          playerCount: currentPlayerCount
        })
      }
    }
    
    previousPlayerCount = currentPlayerCount
  })
  
  return () => {
    off(playersRef)
    unsubscribe()
  }
}

export const joinSession = async (sessionCode) => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const sessionsRef = collection(db, 'sessions')
    const q = query(
      sessionsRef, 
      where('sessionCode', '==', sessionCode),
      where('status', '==', 'active'),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const session = querySnapshot.docs[0]
      return { id: session.id, ...session.data() }
    } else {
      throw new Error('Session not found or inactive')
    }
  } catch (error) {
    console.error('Error joining session:', error)
    throw error
  }
}

// Real-time game state
export const subscribeToGameState = (sessionId, callback) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    console.warn('Firebase nie jest skonfigurowane - subskrypcja nie działa')
    return () => {}
  }
  
  const gameStateRef = ref(realtimeDb, `games/${sessionId}/state`)
  
  const unsubscribe = onValue(gameStateRef, (snapshot) => {
    const data = snapshot.val()
    callback(data)
  })
  
  return () => {
    off(gameStateRef)
    unsubscribe()
  }
}

export const updateGameState = async (sessionId, gameState) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const gameStateRef = ref(realtimeDb, `games/${sessionId}/state`)
    await set(gameStateRef, {
      ...gameState,
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('Error updating game state:', error)
    throw error
  }
}

export const subscribeToPlayers = (sessionId, callback) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    console.warn('Firebase nie jest skonfigurowane - subskrypcja nie działa')
    return () => {}
  }
  
  const playersRef = ref(realtimeDb, `games/${sessionId}/players`)
  
  const unsubscribe = onValue(playersRef, (snapshot) => {
    const data = snapshot.val()
    callback(data || {})
  })
  
  return () => {
    off(playersRef)
    unsubscribe()
  }
}

export const addPlayerToSession = async (sessionId, player) => {
  if (!isFirebaseConfigured() || !realtimeDb || !db) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const playersRef = ref(realtimeDb, `games/${sessionId}/players`)
    const newPlayerRef = push(playersRef)
    await set(newPlayerRef, {
      ...player,
      joinedAt: Date.now()
    })
    
    // Update player count in session
    try {
      const sessionRef = doc(db, 'sessions', sessionId)
      const sessionSnap = await getDoc(sessionRef)
      if (sessionSnap.exists()) {
        const currentCount = sessionSnap.data().playerCount || 0
        await updateDoc(sessionRef, {
          playerCount: currentCount + 1
        })
      }
    } catch (countError) {
      console.warn('Error updating player count:', countError)
      // Don't fail the whole operation
    }
    
    return newPlayerRef.key
  } catch (error) {
    console.error('Error adding player:', error)
    throw error
  }
}

export const removePlayerFromSession = async (sessionId, playerId) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const playerRef = ref(realtimeDb, `games/${sessionId}/players/${playerId}`)
    await remove(playerRef)
  } catch (error) {
    console.error('Error removing player:', error)
    throw error
  }
}

// Chat functionality
export const subscribeToChat = (sessionId, callback) => {
  const chatRef = ref(realtimeDb, `games/${sessionId}/chat`)
  
  const unsubscribe = onValue(chatRef, (snapshot) => {
    const data = snapshot.val()
    callback(data || {})
  })
  
  return () => {
    off(chatRef)
    unsubscribe()
  }
}

export const sendChatMessage = async (sessionId, message) => {
  try {
    const chatRef = ref(realtimeDb, `games/${sessionId}/chat`)
    const newMessageRef = push(chatRef)
    await set(newMessageRef, {
      ...message,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

// Hint request functionality
export const subscribeToHintRequest = (sessionId, callback) => {
  if (!isFirebaseConfigured() || !realtimeDb) {
    console.warn('Firebase nie jest skonfigurowane - subskrypcja hint request nie działa')
    return () => {}
  }
  
  const hintRequestRef = ref(realtimeDb, `games/${sessionId}/pendingHintRequest`)
  
  const unsubscribe = onValue(hintRequestRef, (snapshot) => {
    const data = snapshot.val()
    callback(data)
  })
  
  return () => {
    off(hintRequestRef)
    unsubscribe()
  }
}

// Analytics
export const saveGameAnalytics = async (sessionId, analytics) => {
  try {
    const analyticsRef = doc(db, 'analytics', sessionId)
    await setDoc(analyticsRef, {
      ...analytics,
      sessionId,
      savedAt: new Date()
    })
  } catch (error) {
    console.error('Error saving analytics:', error)
    throw error
  }
}

// Cleanup
export const cleanupSession = async (sessionId) => {
  if (!isFirebaseConfigured() || !realtimeDb || !db) {
    console.warn('Firebase nie jest skonfigurowane - pomijanie czyszczenia sesji')
    return
  }
  
  try {
    // Remove real-time data
    const gameRef = ref(realtimeDb, `games/${sessionId}`)
    await remove(gameRef)
    
    // Update session status
    await updateSession(sessionId, { status: 'ended' })
  } catch (error) {
    console.error('Error cleaning up session:', error)
    throw error
  }
} 