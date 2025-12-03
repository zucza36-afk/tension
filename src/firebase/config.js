import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// Firebase configuration
// Values can be set via environment variables (VITE_FIREBASE_*) or directly here
// Priority: environment variables > direct values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "napiecie-game.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "napiecie-game",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "napiecie-game.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "823835042612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:823835042612:web:28f411d70e924e81f4fb61",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L2MPQCLQ1S",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://napiecie-game-default-rtdb.europe-west1.firebasedatabase.app"
}

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== "your-api-key" && 
         firebaseConfig.projectId && 
         firebaseConfig.projectId !== "your-project-id"
}

// Initialize Firebase
let app = null
let auth = null
let db = null
let realtimeDb = null

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    realtimeDb = getDatabase(app)
  } else {
    console.warn('Firebase nie jest skonfigurowane. Aplikacja będzie działać w trybie lokalnym.')
  }
} catch (error) {
  console.error('Błąd inicjalizacji Firebase:', error)
  console.warn('Aplikacja będzie działać w trybie lokalnym.')
}

export { auth, db, realtimeDb }
export default app 