import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Bell } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { getTranslation } from '../utils/translations'
import toast from 'react-hot-toast'

const PlayerJoinNotification = () => {
  const { language } = useLanguageStore()
  const { playerJoinNotifications, isHost, removePlayerJoinNotification } = useGameStore()

  const t = (key) => getTranslation(key, language)

  useEffect(() => {
    // Show toast for new notifications
    playerJoinNotifications.forEach((notification) => {
      if (notification.type === 'player_joined' && notification.player && !notification.shown) {
        toast.success(
          `${notification.player.nickname} ${t('joinedRoom') || 'dołączył do pokoju'}!`,
          {
            icon: '👋',
            duration: 3000
          }
        )
        // Mark as shown and auto-remove after showing
        setTimeout(() => {
          removePlayerJoinNotification(notification.id)
        }, 3000)
      }
    })
  }, [playerJoinNotifications, removePlayerJoinNotification, t])

  if (!isHost || playerJoinNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {playerJoinNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 shadow-2xl max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Bell className="w-4 h-4 text-yellow-300" />
                  <h4 className="text-white font-semibold text-sm">
                    {t('newPlayerJoined') || 'Nowy gracz dołączył'}
                  </h4>
                </div>
                {notification.player && (
                  <p className="text-white/90 text-sm">
                    <span className="font-semibold">{notification.player.nickname}</span>{' '}
                    {t('joinedRoom') || 'dołączył do pokoju'}
                  </p>
                )}
                {notification.playerCount && (
                  <p className="text-white/70 text-xs mt-1">
                    {t('totalPlayers') || 'Łącznie graczy'}: {notification.playerCount}
                  </p>
                )}
              </div>
              <button
                onClick={() => removePlayerJoinNotification(notification.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default PlayerJoinNotification

