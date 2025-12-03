import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Zap, Clock, ArrowRight, RefreshCw } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const OpenRoomsList = () => {
  const navigate = useNavigate()
  const { language } = useLanguageStore()
  const { openRooms, loadOpenRooms, subscribeToOpenRooms, joinSession } = useGameStore()

  const t = (key) => getTranslation(key, language)

  useEffect(() => {
    // Load rooms initially
    loadOpenRooms()
    
    // Subscribe to updates
    const unsubscribe = subscribeToOpenRooms()
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadOpenRooms()
    }, 10000)
    
    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const handleJoinRoom = async (room) => {
    try {
      await joinSession(room.sessionCode)
      toast.success(t('joinedGame') || 'Dołączono do gry')
      navigate('/setup')
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error(t('errorJoiningRoom') || 'Błąd dołączania do pokoju')
    }
  }

  const handleRefresh = () => {
    loadOpenRooms()
    toast.success(t('roomsRefreshed') || 'Odświeżono listę pokoi')
  }

  const getGameModeLabel = (mode) => {
    const modes = {
      classic: t('classic') || 'Klasyczny',
      elimination: t('elimination') || 'Eliminacja',
      freeplay: t('freeplay') || 'Swobodny',
      couples: t('couplesMode') || 'Couples Mode'
    }
    return modes[mode] || mode
  }

  const getIntensityColor = (intensity) => {
    const colors = {
      1: 'text-green-400',
      2: 'text-yellow-400',
      3: 'text-orange-400',
      4: 'text-red-400',
      5: 'text-purple-400'
    }
    return colors[intensity] || 'text-gray-400'
  }

  if (openRooms.length === 0) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400">{t('noOpenRooms') || 'Brak otwartych pokoi'}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">{t('refresh') || 'Odśwież'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span>{t('openRooms') || 'Otwarte pokoje'} ({openRooms.length})</span>
        </h3>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title={t('refresh') || 'Odśwież'}
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {openRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 rounded-xl p-4 transition-all duration-300 cursor-pointer group"
            onClick={() => handleJoinRoom(room)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-semibold">{room.hostName}</h4>
                      <span className="text-xs text-gray-400">#{room.sessionCode}</span>
                    </div>
                    <p className="text-xs text-gray-400">{getGameModeLabel(room.gameMode)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-400 ml-13">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{room.playerCount}/{room.maxPlayers}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getIntensityColor(room.maxIntensity)}`}>
                    <Zap className="w-3 h-3" />
                    <span>{room.maxIntensity}/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(room.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OpenRoomsList

