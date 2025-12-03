import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Settings, Users, Zap, Brain } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const { language } = useLanguageStore()
  const { gameMode, maxIntensity, consensualFilter, intensityEscalation, aiBotEnabled } = useGameStore()
  
  const [roomSettings, setRoomSettings] = useState({
    hostName: '',
    gameMode: gameMode || 'classic',
    maxIntensity: maxIntensity || 3,
    consensualFilter: consensualFilter !== undefined ? consensualFilter : true,
    intensityEscalation: intensityEscalation !== undefined ? intensityEscalation : true,
    aiBotEnabled: aiBotEnabled || false,
    maxPlayers: 10
  })

  const t = (key) => getTranslation(key, language)

  const handleCreate = () => {
    if (!roomSettings.hostName.trim()) {
      alert(t('enterHostName') || 'Wprowadź nazwę hosta')
      return
    }
    onCreate(roomSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {t('createRoom') || 'Utwórz pokój'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Host Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('hostName') || 'Nazwa hosta'} *
            </label>
            <input
              type="text"
              value={roomSettings.hostName}
              onChange={(e) => setRoomSettings({ ...roomSettings, hostName: e.target.value })}
              placeholder={t('enterHostName') || 'Wprowadź nazwę...'}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              autoFocus
            />
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t('gameMode') || 'Tryb gry'}
            </label>
            <div className="space-y-2">
              {[
                { value: 'classic', label: t('classic') || 'Klasyczny', desc: 'Tury z kartami' },
                { value: 'elimination', label: t('elimination') || 'Eliminacja', desc: 'Głosowanie usuwa graczy' },
                { value: 'freeplay', label: t('freeplay') || 'Swobodny', desc: 'Karty bez struktury tur' }
              ].map((mode) => (
                <label key={mode.value} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg">
                  <input
                    type="radio"
                    name="gameMode"
                    value={mode.value}
                    checked={roomSettings.gameMode === mode.value}
                    onChange={(e) => setRoomSettings({ ...roomSettings, gameMode: e.target.value })}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-white font-medium">{mode.label}</p>
                    <p className="text-gray-400 text-xs">{mode.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('maxIntensity') || 'Maksymalna intensywność'}: {roomSettings.maxIntensity}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={roomSettings.maxIntensity}
              onChange={(e) => setRoomSettings({ ...roomSettings, maxIntensity: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('maxPlayers') || 'Maksymalna liczba graczy'}: {roomSettings.maxPlayers}
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={roomSettings.maxPlayers}
              onChange={(e) => setRoomSettings({ ...roomSettings, maxPlayers: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>2</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={roomSettings.consensualFilter}
                onChange={(e) => setRoomSettings({ ...roomSettings, consensualFilter: e.target.checked })}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">{t('consensualFilter') || 'Filtr konsensualny'}</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={roomSettings.intensityEscalation}
                onChange={(e) => setRoomSettings({ ...roomSettings, intensityEscalation: e.target.checked })}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">{t('intensityEscalation') || 'Eskalacja intensywności'}</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={roomSettings.aiBotEnabled}
                onChange={(e) => setRoomSettings({ ...roomSettings, aiBotEnabled: e.target.checked })}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>{t('aiBotEnabled') || 'AI Bot Prowadzący'}</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('createRoom') || 'Utwórz pokój'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 text-white font-semibold rounded-xl transition-all duration-300"
            >
              {t('cancel') || 'Anuluj'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateRoomModal

