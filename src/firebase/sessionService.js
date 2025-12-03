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
  if (!isFirebaseConfigured() || !realtimeDb) {
    throw new Error('Firebase nie jest skonfigurowane')
  }
  
  try {
    const playersRef = ref(realtimeDb, `games/${sessionId}/players`)
    const newPlayerRef = push(playersRef)
    await set(newPlayerRef, {
      ...player,
      joinedAt: Date.now()
    })
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