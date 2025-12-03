import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import GamePage from './pages/GamePage'
import EndPage from './pages/EndPage'
import CustomCardsPage from './pages/CustomCardsPage'
import CustomDecksPage from './pages/CustomDecksPage'
import CouplesModePage from './pages/CouplesModePage'
import IntimateGuessingPage from './pages/IntimateGuessingPage'
import TestComponent from './components/TestComponent'
import { useGameStore } from './store/gameStore'
import { useLanguageStore } from './store/languageStore'
import WelcomeModal from './components/WelcomeModal'
import LanguageToggle from './components/LanguageToggle'

function App() {
  const { initializeGame } = useGameStore()
  const { isAgeVerified, hasSeenWelcome } = useLanguageStore()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Initialize game state on app load
    initializeGame()
    
    // Show welcome modal if user hasn't seen it or isn't age verified
    if (!hasSeenWelcome || !isAgeVerified) {
      setShowWelcome(true)
    }
  }, [initializeGame, hasSeenWelcome, isAgeVerified])

  const handleWelcomeClose = () => {
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <LanguageToggle />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/end" element={<EndPage />} />
        <Route path="/custom-cards" element={<CustomCardsPage />} />
        <Route path="/custom-decks" element={<CustomDecksPage />} />
        <Route path="/couples-mode" element={<CouplesModePage />} />
        <Route path="/intimate-guessing" element={<IntimateGuessingPage />} />
        <Route path="/test" element={<TestComponent />} />
      </Routes>
      
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeClose} 
      />
    </div>
  )
}

export default App 