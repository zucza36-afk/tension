import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLanguageStore = create(
  persist(
    (set, get) => ({
      // Language state
      language: 'pl', // default to Polish
      isAgeVerified: false,
      hasSeenWelcome: false,
      
      // Actions
      setLanguage: (language) => {
        set({ language })
      },
      
      verifyAge: (isAdult) => {
        if (isAdult) {
          set({ isAgeVerified: true, hasSeenWelcome: true })
        } else {
          // Redirect to kids page
          window.location.href = 'https://www.google.com'
        }
      },
      
      setHasSeenWelcome: () => {
        set({ hasSeenWelcome: true })
      },
      
      reset: () => {
        set({ 
          language: 'pl', 
          isAgeVerified: false, 
          hasSeenWelcome: false 
        })
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ 
        language: state.language,
        isAgeVerified: state.isAgeVerified,
        hasSeenWelcome: state.hasSeenWelcome
      })
    }
  )
)

export { useLanguageStore } 