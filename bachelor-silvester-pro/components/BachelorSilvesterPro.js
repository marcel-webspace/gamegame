'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './BachelorSilvesterPro.module.css'

// Vibration Helper
const vibrate = (pattern = [50]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Minigame definitions
const MINIGAMES = [
  { id: 1, name: "Frisbee Fangen", icon: "🥏", unlocked: true, description: "Wirf das Frisbee zu deinen Mitspielern!" },
  { id: 2, name: "Shot Roulette", icon: "🎰", unlocked: false, description: "Wer trinkt? Das Rad entscheidet!" },
  { id: 3, name: "Prost Chain", icon: "🍻", unlocked: false, description: "Stoße in der richtigen Reihenfolge an!" },
  { id: 4, name: "Wackel Turm", icon: "🗼", unlocked: false, description: "Zieh einen Block - aber lass nicht fallen!" },
  { id: 5, name: "Flip Cup Race", icon: "🏆", unlocked: false, description: "Flippe dein Glas am schnellsten!" },
  { id: 6, name: "Beer Pong", icon: "🏓", unlocked: false, description: "Wirf den Ball ins Glas!" },
  { id: 7, name: "Truth or Drink", icon: "🤫", unlocked: false, description: "Wahrheit sagen oder trinken!" },
  { id: 8, name: "Reaction Battle", icon: "⚡", unlocked: false, description: "Wer reagiert am schnellsten?" },
  { id: 9, name: "Würfel Duell", icon: "🎲", unlocked: false, description: "Höchste Zahl gewinnt - Verlierer trinkt!" },
  { id: 10, name: "Final Boss", icon: "👑", unlocked: false, description: "Das ultimative Finale!" },
]

// Frisbee Game Component
function FrisbeeGame({ playerId, players, broadcast, onBack, roomCode }) {
  const [frisbeePos, setFrisbeePos] = useState({ x: 0, y: 0 })
  const [isFlying, setIsFlying] = useState(false)
  const [hasFrisbee, setHasFrisbee] = useState(true)
  const [catches, setCatches] = useState(0)
  const [showDrink, setShowDrink] = useState(false)
  const [drinkPlayer, setDrinkPlayer] = useState('')
  const [initialized, setInitialized] = useState(false)
  
  const touchStartRef = useRef(null)
  const channelRef = useRef(null)

  // Initialize position on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFrisbeePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      setInitialized(true)
    }
  }, [])

  // Handle incoming frisbee via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !roomCode) return

    const channel = new BroadcastChannel(`bachelor-silvester-${roomCode}`)
    channelRef.current = channel

    channel.onmessage = (event) => {
      const data = event.data
      if (data.senderId === playerId) return

      if (data.type === 'frisbee-thrown') {
        vibrate([100, 50, 100])
        setHasFrisbee(false)
        
        const startX = data.direction.x > 0 ? -100 : window.innerWidth + 100
        const startY = 0
        
        setFrisbeePos({ x: startX, y: startY })
        setIsFlying(true)
        
        setTimeout(() => {
          setFrisbeePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
          setTimeout(() => {
            setIsFlying(false)
            setHasFrisbee(true)
            vibrate([50])
          }, 500)
        }, 100)
      }
      
      if (data.type === 'frisbee-missed') {
        setDrinkPlayer(data.playerName)
        setShowDrink(true)
        vibrate([200, 100, 200, 100, 200])
        setTimeout(() => setShowDrink(false), 3000)
      }
    }
    
    return () => channel.close()
  }, [playerId, roomCode])
  
  const handleTouchStart = (e) => {
    if (!hasFrisbee || isFlying) return
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    }
    vibrate([20])
  }
  
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !hasFrisbee || isFlying) return
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    }
    
    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = touchEnd.time - touchStartRef.current.time
    
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime
    
    if (velocity > 0.5 && deltaY < -50) {
      throwFrisbee(deltaX, deltaY, velocity)
    }
    
    touchStartRef.current = null
  }

  // Mouse support for desktop testing
  const handleMouseDown = (e) => {
    if (!hasFrisbee || isFlying) return
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    }
    vibrate([20])
  }

  const handleMouseUp = (e) => {
    if (!touchStartRef.current || !hasFrisbee || isFlying) return
    
    const deltaX = e.clientX - touchStartRef.current.x
    const deltaY = e.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime
    
    if (velocity > 0.3 && deltaY < -30) {
      throwFrisbee(deltaX, deltaY, velocity)
    }
    
    touchStartRef.current = null
  }
  
  const throwFrisbee = (deltaX, deltaY, velocity) => {
    setIsFlying(true)
    vibrate([50, 30, 50])
    
    const direction = {
      x: deltaX / Math.abs(deltaX) || 0,
      y: -1
    }
    
    const targetX = frisbeePos.x + deltaX * 5
    const targetY = -200
    
    setFrisbeePos({ x: targetX, y: targetY })
    
    // Broadcast throw
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'frisbee-thrown',
        senderId: playerId,
        direction,
        velocity
      })
    }
    
    setTimeout(() => {
      setCatches(prev => prev + 1)
      setIsFlying(false)
      setHasFrisbee(false)
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          setFrisbeePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        }
        setHasFrisbee(true)
      }, 2000)
    }, 800)
  }

  if (!initialized) {
    return <div className={styles.frisbeeGame}><div className={styles.loading}>Lädt...</div></div>
  }
  
  return (
    <div 
      className={styles.frisbeeGame} 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.gameHeader}>
        <span className={styles.gameTitle}>🥏 Frisbee Fangen</span>
        <button className={styles.backBtn} onClick={onBack}>✕</button>
      </div>
      
      <div className={styles.scoreDisplay}>
        <span className={styles.scoreText}>Würfe: {catches}</span>
      </div>
      
      <div className={styles.frisbeeArea}>
        <div
          className={`${styles.frisbee} ${isFlying ? styles.flying : ''}`}
          style={{
            left: frisbeePos.x - 60,
            top: frisbeePos.y - 60,
            transition: isFlying ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
            opacity: hasFrisbee ? 1 : 0.3
          }}
        >
          🥏
        </div>
      </div>
      
      {hasFrisbee && !isFlying && (
        <div className={styles.swipeHint}>
          <span className={styles.swipeArrow}>↑</span>
          <span>Nach oben swipen zum Werfen!</span>
        </div>
      )}
      
      {!hasFrisbee && !isFlying && (
        <div className={styles.swipeHint}>
          <span className={styles.swipeArrow}>🎯</span>
          <span>Warte auf das Frisbee...</span>
        </div>
      )}
      
      {showDrink && (
        <div className={styles.drinkPopup}>
          <span className={styles.drinkText}>{drinkPlayer} trinkt!</span>
          <span className={styles.drinkEmoji}>🍺</span>
        </div>
      )}
    </div>
  )
}

// Main App Component
export default function BachelorSilvesterPro() {
  const [screen, setScreen] = useState('title')
  const [playerName, setPlayerName] = useState('')
  const [playerId] = useState(() => generateId())
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [inputRoomCode, setInputRoomCode] = useState('')
  
  const channelRef = useRef(null)

  // Setup BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !roomCode) return

    const channel = new BroadcastChannel(`bachelor-silvester-${roomCode}`)
    channelRef.current = channel

    channel.onmessage = (event) => {
      const data = event.data
      if (data.senderId === playerId) return

      vibrate([30])

      switch (data.type) {
        case 'player-join':
          setPlayers(prev => {
            if (prev.find(p => p.id === data.player.id)) return prev
            return [...prev, data.player]
          })
          // Host sends back player list
          if (isHost) {
            setTimeout(() => {
              channel.postMessage({
                type: 'player-list',
                senderId: playerId,
                players: [...players, data.player]
              })
            }, 100)
          }
          break
        case 'player-list':
          setPlayers(data.players)
          break
        case 'player-leave':
          setPlayers(prev => prev.filter(p => p.id !== data.playerId))
          break
        case 'start-game':
          setSelectedGame(data.gameId)
          setScreen('minigame')
          vibrate([100])
          break
        default:
          break
      }
    }

    return () => channel.close()
  }, [roomCode, playerId, isHost, players])

  // Broadcast helper
  const broadcast = useCallback((data) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ ...data, senderId: playerId })
    }
  }, [playerId])

  // Create room
  const createRoom = () => {
    if (!playerName.trim()) return
    const code = Math.random().toString(36).substr(2, 6).toUpperCase()
    setRoomCode(code)
    setIsHost(true)
    setPlayers([{ id: playerId, name: playerName, isHost: true }])
    setScreen('lobby')
    vibrate([50, 30, 50])
  }

  // Join room
  const joinRoom = () => {
    if (!playerName.trim() || !inputRoomCode.trim()) return
    const code = inputRoomCode.toUpperCase()
    setRoomCode(code)
    setIsHost(false)
    const newPlayer = { id: playerId, name: playerName, isHost: false }
    setPlayers([newPlayer])
    setScreen('lobby')
    vibrate([50, 30, 50])
    
    // Announce join after channel is set up
    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'player-join',
          senderId: playerId,
          player: newPlayer
        })
      }
    }, 200)
  }

  // Start selected game
  const startGame = (gameId) => {
    if (!isHost) return
    const game = MINIGAMES.find(g => g.id === gameId)
    if (!game?.unlocked) return
    
    broadcast({ type: 'start-game', gameId })
    setSelectedGame(gameId)
    setScreen('minigame')
    vibrate([100])
  }

  // Leave game
  const leaveGame = () => {
    broadcast({ type: 'player-leave', playerId })
    setScreen('title')
    setRoomCode('')
    setPlayers([])
    setSelectedGame(null)
  }

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    color: ['#ff6b6b', '#ffe66d', '#4ecdc4', '#ff8e53'][Math.floor(Math.random() * 4)],
    size: `${4 + Math.random() * 8}px`
  }))

  return (
    <div className={styles.appContainer}>
      {/* Floating Particles */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              background: p.color,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>
      
      <div className={styles.content}>
        {/* Title Screen */}
        {screen === 'title' && (
          <div className={styles.titleScreen}>
            <div>
              <h1 className={styles.gameLogo}>Bachelor<br/>Silvester<br/>Pro</h1>
              <p className={styles.subtitle}>🍾 Trinkspiel 🥂</p>
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.gameInput}
                placeholder="Dein Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={createRoom}>
                🎮 Raum Erstellen
              </button>
            </div>
            
            <div className={styles.divider}>
              <span>oder</span>
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.gameInput}
                placeholder="Raum-Code"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={joinRoom}>
                🚀 Raum Beitreten
              </button>
            </div>
          </div>
        )}
        
        {/* Lobby */}
        {screen === 'lobby' && (
          <div className={styles.lobby}>
            <div className={styles.roomCodeDisplay}>
              <div className={styles.roomCodeLabel}>Raum-Code</div>
              <div className={styles.roomCode}>{roomCode}</div>
              <p className={styles.shareHint}>Teile diesen Code mit deinen Freunden!</p>
            </div>
            
            <div className={styles.playersSection}>
              <div className={styles.sectionTitle}>
                <span>👥</span> Spieler ({players.length})
              </div>
              <div className={styles.playerList}>
                {players.map((player, index) => (
                  <div key={player.id} className={`${styles.playerCard} ${player.isHost ? styles.host : ''}`}>
                    <div className={styles.playerAvatar}>
                      {['🎮', '🎲', '🎯', '🎪', '🎨', '🎭'][index % 6]}
                    </div>
                    <span className={styles.playerName}>{player.name}</span>
                    {player.isHost && <span className={styles.hostBadge}>Host</span>}
                  </div>
                ))}
              </div>
              {players.length < 2 && (
                <p className={styles.waitingText}>Warte auf weitere Spieler...</p>
              )}
            </div>
            
            <div className={styles.lobbyButtons}>
              {isHost && players.length >= 1 && (
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => setScreen('game-select')}
                >
                  🎯 Spiele Wählen
                </button>
              )}
              <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={leaveGame}>
                🚪
              </button>
            </div>
          </div>
        )}
        
        {/* Game Selection */}
        {screen === 'game-select' && (
          <div className={styles.gameSelect}>
            <div className={styles.sectionTitleCenter}>
              <span>🎮</span> Minigames
            </div>
            
            <div className={styles.gamesGrid}>
              {MINIGAMES.map((game) => (
                <div
                  key={game.id}
                  className={`${styles.gameCard} ${game.unlocked ? styles.unlocked : styles.locked}`}
                  onClick={() => game.unlocked && startGame(game.id)}
                >
                  <span className={styles.gameIcon}>{game.icon}</span>
                  <span className={styles.gameName}>{game.name}</span>
                  {!game.unlocked && <span className={styles.lockIcon}>🔒</span>}
                </div>
              ))}
            </div>
            
            <button 
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall} ${styles.fullWidth}`}
              onClick={() => setScreen('lobby')}
            >
              ← Zurück zur Lobby
            </button>
          </div>
        )}
        
        {/* Frisbee Minigame */}
        {screen === 'minigame' && selectedGame === 1 && (
          <FrisbeeGame 
            playerId={playerId}
            players={players}
            broadcast={broadcast}
            onBack={() => setScreen('game-select')}
            roomCode={roomCode}
          />
        )}
      </div>
    </div>
  )
}
