import { Globe } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguageStore()

  const toggleLanguage = () => {
    const newLanguage = language === 'pl' ? 'en' : 'pl'
    setLanguage(newLanguage)
  }

  const t = (key) => getTranslation(key, language)

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 bg-dark-800/80 hover:bg-dark-700/80 text-white p-3 rounded-full transition-all duration-200 z-40 group"
      title={language === 'pl' ? 'Switch to English' : 'Przełącz na polski'}
    >
      <div className="flex items-center space-x-2">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-semibold hidden group-hover:block transition-all">
          {language === 'pl' ? 'EN' : 'PL'}
        </span>
      </div>
    </button>
  )
}

export default LanguageToggle 