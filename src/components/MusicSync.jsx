import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { ref, onValue, set } from 'firebase/database'
import { realtimeDb } from '../firebase/config'
import toast from 'react-hot-toast'

const MusicSync = () => {
  const {
    isOnlineSession,
    sessionId,
    isHost,
    localPlayerId
  } = useGameStore()

  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [volume, setVolume] = useState(50)
  const [playlist, setPlaylist] = useState([])
  const audioRef = useRef(null)
  const syncRef = useRef(null)

  // Sample playlists (in production, these would come from Spotify API or user uploads)
  const defaultPlaylists = {
    romantic: [
      { id: 1, name: 'Romantic Mix 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 2, name: 'Romantic Mix 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ],
    party: [
      { id: 3, name: 'Party Mix 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 4, name: 'Party Mix 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
    ],
    chill: [
      { id: 5, name: 'Chill Mix 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 6, name: 'Chill Mix 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
    ]
  }

  // Sync music state with Firebase
  useEffect(() => {
    if (!isOnlineSession || !sessionId) return

    const musicRef = ref(realtimeDb, `sessions/${sessionId}/music`)
    
    if (isHost) {
      // Host controls music
      const updateMusicState = () => {
        set(musicRef, {
          isPlaying,
          currentTrack: currentTrack?.id || null,
          volume,
          playlist: playlist.map(t => t.id),
          lastUpdate: Date.now(),
          hostId: localPlayerId
        })
      }

      updateMusicState()
      const interval = setInterval(updateMusicState, 1000) // Sync every second
      return () => clearInterval(interval)
    } else {
      // Other players listen to host's music
      const unsubscribe = onValue(musicRef, (snapshot) => {
        const musicData = snapshot.val()
        if (musicData && musicData.hostId !== localPlayerId) {
          setIsPlaying(musicData.isPlaying || false)
          setVolume(musicData.volume || 50)
          
          if (musicData.currentTrack && musicData.currentTrack !== currentTrack?.id) {
            const track = playlist.find(t => t.id === musicData.currentTrack)
            if (track) {
              setCurrentTrack(track)
            }
          }
        }
      })

      return () => unsubscribe()
    }
  }, [isOnlineSession, sessionId, isHost, isPlaying, currentTrack, volume, playlist, localPlayerId])

  // Control audio playback
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    const audio = audioRef.current
    audio.volume = volume / 100

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        toast.error('Błąd odtwarzania muzyki')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, volume])

  const handlePlayPause = () => {
    if (!isHost) {
      toast.error('Tylko host może kontrolować muzykę')
      return
    }
    setIsPlaying(!isPlaying)
  }

  const handleNextTrack = () => {
    if (!isHost) return
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentTrack(playlist[nextIndex])
    setIsPlaying(true)
  }

  const handleSelectPlaylist = (playlistName) => {
    if (!isHost) return
    
    const selectedPlaylist = defaultPlaylists[playlistName] || []
    setPlaylist(selectedPlaylist)
    if (selectedPlaylist.length > 0) {
      setCurrentTrack(selectedPlaylist[0])
    }
  }

  if (!isEnabled) {
    return (
      <button
        onClick={() => setIsEnabled(true)}
        className="fixed bottom-32 right-4 z-40 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        title="Synchronizacja muzyki"
      >
        <Music className="w-6 h-6" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 100, x: 100 }}
      className="fixed bottom-32 right-4 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Synchronizacja muzyki</h3>
        </div>
        <button
          onClick={() => setIsEnabled(false)}
          className="text-gray-400 hover:text-white"
        >
          <VolumeX className="w-5 h-5" />
        </button>
      </div>

      {isHost ? (
        <>
          {/* Playlist Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Wybierz playlistę</label>
            <div className="flex space-x-2">
              {Object.keys(defaultPlaylists).map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectPlaylist(name)}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    playlist.length > 0 && playlist[0]?.id === defaultPlaylists[name][0]?.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          {currentTrack && (
            <div className="mb-4">
              <div className="text-sm text-white mb-2">{currentTrack.name}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-pink-600 hover:bg-pink-700 rounded-lg"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleNextTrack}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center space-x-2">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-400 text-center py-4">
          Słuchasz muzyki hosta
          {currentTrack && (
            <div className="mt-2 text-white">{currentTrack.name}</div>
          )}
        </div>
      )}

      {/* Hidden audio element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop
          onEnded={handleNextTrack}
        />
      )}
    </motion.div>
  )
}

export default MusicSync

