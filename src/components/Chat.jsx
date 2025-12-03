import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

const Chat = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    players, 
    localPlayerId,
    sessionId,
    isOnlineSession
  } = useGameStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const currentPlayer = players.find(p => p.id === localPlayerId) || players[0] || { id: 'local', nickname: 'Gracz' }
    const playerName = currentPlayer?.nickname || 'Gracz'
    const playerId = localPlayerId || currentPlayer?.id || 'local'

    await sendChatMessage({
      text: message.trim(),
      playerId,
      playerName
    })

    setMessage('')
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const unreadCount = chatMessages.length

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed bottom-20 right-2 md:right-4 z-50 w-[calc(100%-1rem)] max-w-sm h-[400px] md:h-[500px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-white font-semibold">Czat</h3>
                {isOnlineSession && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                    Online
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Brak wiadomości</p>
                  <p className="text-sm">Napisz pierwszą wiadomość!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const currentPlayerId = localPlayerId || players[0]?.id || 'local'
                  const isOwnMessage = msg.playerId === currentPlayerId
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {msg.playerName || 'Gracz'}
                          </p>
                        )}
                        <p className="text-sm break-words">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700/50 bg-gray-900/80">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chat

