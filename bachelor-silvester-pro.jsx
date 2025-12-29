import React, { useState, useEffect, useRef, useCallback } from 'react';

// Vibration Helper
const vibrate = (pattern = [50]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// BroadcastChannel for same-origin multiplayer
const useMultiplayerChannel = (roomCode, playerId, onMessage) => {
  const channelRef = useRef(null);
  
  useEffect(() => {
    if (!roomCode) return;
    
    const channel = new BroadcastChannel(`bachelor-silvester-${roomCode}`);
    channelRef.current = channel;
    
    channel.onmessage = (event) => {
      if (event.data.senderId !== playerId) {
        onMessage(event.data);
      }
    };
    
    return () => channel.close();
  }, [roomCode, playerId, onMessage]);
  
  const broadcast = useCallback((data) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ ...data, senderId: playerId });
    }
  }, [playerId]);
  
  return broadcast;
};

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
];

// Main App Component
export default function BachelorSilvesterPro() {
  const [screen, setScreen] = useState('title'); // title, lobby, game-select, minigame
  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(generateId());
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [inputRoomCode, setInputRoomCode] = useState('');

  // Message handler
  const handleMessage = useCallback((data) => {
    vibrate([30]);
    
    switch (data.type) {
      case 'player-join':
        setPlayers(prev => {
          if (prev.find(p => p.id === data.player.id)) return prev;
          return [...prev, data.player];
        });
        break;
      case 'player-list':
        setPlayers(data.players);
        break;
      case 'player-leave':
        setPlayers(prev => prev.filter(p => p.id !== data.playerId));
        break;
      case 'start-game':
        setSelectedGame(data.gameId);
        setScreen('minigame');
        break;
      case 'frisbee-thrown':
        // Handled in FrisbeeGame
        break;
      default:
        break;
    }
  }, []);

  const broadcast = useMultiplayerChannel(roomCode, playerId, handleMessage);

  // Create room
  const createRoom = () => {
    if (!playerName.trim()) return;
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomCode(code);
    setIsHost(true);
    setPlayers([{ id: playerId, name: playerName, isHost: true }]);
    setScreen('lobby');
    vibrate([50, 30, 50]);
    
    setTimeout(() => {
      broadcast({ type: 'player-join', player: { id: playerId, name: playerName, isHost: true } });
    }, 100);
  };

  // Join room
  const joinRoom = () => {
    if (!playerName.trim() || !inputRoomCode.trim()) return;
    setRoomCode(inputRoomCode.toUpperCase());
    setIsHost(false);
    setPlayers([{ id: playerId, name: playerName, isHost: false }]);
    setScreen('lobby');
    vibrate([50, 30, 50]);
    
    setTimeout(() => {
      broadcast({ type: 'player-join', player: { id: playerId, name: playerName, isHost: false } });
    }, 100);
  };

  // Broadcast player list periodically (host only)
  useEffect(() => {
    if (!isHost || !roomCode) return;
    const interval = setInterval(() => {
      broadcast({ type: 'player-list', players });
    }, 2000);
    return () => clearInterval(interval);
  }, [isHost, roomCode, players, broadcast]);

  // Start selected game
  const startGame = (gameId) => {
    if (!isHost) return;
    const game = MINIGAMES.find(g => g.id === gameId);
    if (!game?.unlocked) return;
    
    broadcast({ type: 'start-game', gameId });
    setSelectedGame(gameId);
    setScreen('minigame');
    vibrate([100]);
  };

  // Leave game
  const leaveGame = () => {
    broadcast({ type: 'player-leave', playerId });
    setScreen('title');
    setRoomCode('');
    setPlayers([]);
    setSelectedGame(null);
  };

  return (
    <div className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .app-container {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1e3a5f 70%, #0d2137 100%);
          font-family: 'Fredoka', sans-serif;
          color: #fff;
          overflow: hidden;
          position: relative;
        }
        
        .app-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 230, 109, 0.1) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        
        /* Floating particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: float 8s infinite ease-in-out;
          opacity: 0.6;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        
        .content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        
        /* Title Screen */
        .title-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 30px;
          text-align: center;
        }
        
        .game-logo {
          font-family: 'Bangers', cursive;
          font-size: clamp(2.5rem, 10vw, 4.5rem);
          text-transform: uppercase;
          letter-spacing: 4px;
          background: linear-gradient(180deg, #ffe66d 0%, #ff6b6b 50%, #ff8e53 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(255, 107, 107, 0.5);
          animation: pulse-glow 2s infinite ease-in-out;
          position: relative;
        }
        
        .game-logo::after {
          content: '🎉';
          position: absolute;
          right: -50px;
          top: -10px;
          font-size: 2rem;
          animation: bounce 1s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(255, 230, 109, 0.8)); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(-10deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: #4ecdc4;
          text-transform: uppercase;
          letter-spacing: 6px;
          opacity: 0.9;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
          max-width: 320px;
        }
        
        .game-input {
          padding: 18px 24px;
          font-size: 1.1rem;
          font-family: 'Fredoka', sans-serif;
          border: 3px solid rgba(255, 230, 109, 0.4);
          border-radius: 16px;
          background: rgba(30, 20, 50, 0.8);
          color: #fff;
          text-align: center;
          transition: all 0.3s ease;
          outline: none;
        }
        
        .game-input:focus {
          border-color: #ffe66d;
          box-shadow: 0 0 20px rgba(255, 230, 109, 0.4);
          transform: scale(1.02);
        }
        
        .game-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .btn {
          padding: 18px 36px;
          font-size: 1.2rem;
          font-family: 'Bangers', cursive;
          letter-spacing: 2px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .btn:hover::before {
          left: 100%;
        }
        
        .btn:active {
          transform: scale(0.95);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
          color: #fff;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        
        .btn-primary:hover {
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
          color: #fff;
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.4);
        }
        
        .btn-secondary:hover {
          box-shadow: 0 12px 35px rgba(78, 205, 196, 0.6);
          transform: translateY(-2px);
        }
        
        .btn-small {
          padding: 12px 24px;
          font-size: 1rem;
        }
        
        .divider {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          max-width: 320px;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }
        
        /* Lobby */
        .lobby {
          width: 100%;
          max-width: 420px;
          padding-top: 40px;
        }
        
        .room-code-display {
          background: rgba(30, 20, 50, 0.9);
          border: 3px solid #ffe66d;
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(255, 230, 109, 0.2);
        }
        
        .room-code-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #4ecdc4;
          margin-bottom: 10px;
        }
        
        .room-code {
          font-family: 'Bangers', cursive;
          font-size: 3rem;
          letter-spacing: 8px;
          color: #ffe66d;
          text-shadow: 0 0 20px rgba(255, 230, 109, 0.5);
        }
        
        .players-section {
          background: rgba(30, 20, 50, 0.7);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .section-title {
          font-family: 'Bangers', cursive;
          font-size: 1.5rem;
          color: #ff6b6b;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .player-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .player-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(78, 205, 196, 0.15);
          border-radius: 12px;
          border-left: 4px solid #4ecdc4;
          animation: slide-in 0.3s ease;
        }
        
        @keyframes slide-in {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .player-card.host {
          border-left-color: #ffe66d;
          background: rgba(255, 230, 109, 0.15);
        }
        
        .player-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ff8e53);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .player-name {
          flex: 1;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .host-badge {
          background: #ffe66d;
          color: #1a0a2e;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .waiting-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          padding: 20px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        /* Game Selection */
        .game-select {
          width: 100%;
          max-width: 420px;
          padding-top: 20px;
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .game-card {
          background: rgba(30, 20, 50, 0.8);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          border: 3px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .game-card.unlocked {
          border-color: rgba(78, 205, 196, 0.5);
        }
        
        .game-card.unlocked:hover {
          border-color: #4ecdc4;
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3);
        }
        
        .game-card.unlocked:active {
          transform: scale(0.95);
        }
        
        .game-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .game-card.locked::after {
          content: '🔒';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 1.2rem;
        }
        
        .game-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          display: block;
        }
        
        .game-name {
          font-family: 'Bangers', cursive;
          font-size: 1.1rem;
          color: #ffe66d;
          letter-spacing: 1px;
        }
        
        .game-card.unlocked .game-name {
          color: #4ecdc4;
        }
        
        /* Frisbee Game */
        .frisbee-game {
          width: 100%;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: linear-gradient(180deg, #0d2137 0%, #1e3a5f 50%, #2d1b4e 100%);
          touch-action: none;
          overflow: hidden;
        }
        
        .game-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%);
        }
        
        .game-title {
          font-family: 'Bangers', cursive;
          font-size: 1.3rem;
          color: #ffe66d;
        }
        
        .back-btn {
          background: rgba(255, 107, 107, 0.8);
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .frisbee-area {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .frisbee {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 30%, #ffe66d 70%, #4ecdc4 100%);
          box-shadow: 
            0 10px 40px rgba(255, 107, 107, 0.5),
            inset 0 -5px 20px rgba(0, 0, 0, 0.3),
            inset 0 5px 20px rgba(255, 255, 255, 0.3);
          position: absolute;
          cursor: grab;
          transition: transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }
        
        .frisbee::before {
          content: '';
          position: absolute;
          width: 60%;
          height: 60%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: 3px solid rgba(255, 255, 255, 0.4);
        }
        
        .frisbee.flying {
          animation: spin 0.5s linear infinite;
          cursor: default;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .swipe-hint {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          animation: hint-pulse 2s infinite;
        }
        
        @keyframes hint-pulse {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.7; }
          50% { transform: translateX(-50%) translateY(-10px); opacity: 1; }
        }
        
        .swipe-arrow {
          font-size: 2rem;
          display: block;
          margin-bottom: 5px;
        }
        
        .catch-zone {
          position: absolute;
          border: 4px dashed rgba(78, 205, 196, 0.5);
          border-radius: 50%;
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-border 2s infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(78, 205, 196, 0.3); transform: scale(1); }
          50% { border-color: rgba(78, 205, 196, 0.8); transform: scale(1.05); }
        }
        
        .score-display {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 20, 50, 0.9);
          padding: 15px 30px;
          border-radius: 30px;
          border: 2px solid #ffe66d;
        }
        
        .score-text {
          font-family: 'Bangers', cursive;
          font-size: 1.5rem;
          color: #ffe66d;
        }
        
        .drink-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 107, 107, 0.95);
          padding: 40px 60px;
          border-radius: 30px;
          text-align: center;
          z-index: 1000;
          animation: popup-bounce 0.5s ease;
        }
        
        @keyframes popup-bounce {
          0% { transform: translate(-50%, -50%) scale(0); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        .drink-text {
          font-family: 'Bangers', cursive;
          font-size: 2.5rem;
          color: #fff;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        
        .drink-emoji {
          font-size: 4rem;
          display: block;
          margin-top: 10px;
        }
      `}</style>
      
      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              background: ['#ff6b6b', '#ffe66d', '#4ecdc4', '#ff8e53'][Math.floor(Math.random() * 4)],
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>
      
      <div className="content">
        {/* Title Screen */}
        {screen === 'title' && (
          <div className="title-screen">
            <div>
              <h1 className="game-logo">Bachelor<br/>Silvester<br/>Pro</h1>
              <p className="subtitle">🍾 Trinkspiel 🥂</p>
            </div>
            
            <div className="input-group">
              <input
                type="text"
                className="game-input"
                placeholder="Dein Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
              <button className="btn btn-primary" onClick={createRoom}>
                🎮 Raum Erstellen
              </button>
            </div>
            
            <div className="divider">oder</div>
            
            <div className="input-group">
              <input
                type="text"
                className="game-input"
                placeholder="Raum-Code"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button className="btn btn-secondary" onClick={joinRoom}>
                🚀 Raum Beitreten
              </button>
            </div>
          </div>
        )}
        
        {/* Lobby */}
        {screen === 'lobby' && (
          <div className="lobby">
            <div className="room-code-display">
              <div className="room-code-label">Raum-Code</div>
              <div className="room-code">{roomCode}</div>
            </div>
            
            <div className="players-section">
              <div className="section-title">
                <span>👥</span> Spieler ({players.length})
              </div>
              <div className="player-list">
                {players.map((player, index) => (
                  <div key={player.id} className={`player-card ${player.isHost ? 'host' : ''}`}>
                    <div className="player-avatar">
                      {['🎮', '🎲', '🎯', '🎪', '🎨', '🎭'][index % 6]}
                    </div>
                    <span className="player-name">{player.name}</span>
                    {player.isHost && <span className="host-badge">Host</span>}
                  </div>
                ))}
              </div>
              {players.length < 2 && (
                <p className="waiting-text">Warte auf weitere Spieler...</p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {isHost && players.length >= 1 && (
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => setScreen('game-select')}
                >
                  🎯 Spiele Wählen
                </button>
              )}
              <button className="btn btn-secondary btn-small" onClick={leaveGame}>
                🚪
              </button>
            </div>
          </div>
        )}
        
        {/* Game Selection */}
        {screen === 'game-select' && (
          <div className="game-select">
            <div className="section-title" style={{ justifyContent: 'center' }}>
              <span>🎮</span> Minigames
            </div>
            
            <div className="games-grid">
              {MINIGAMES.map((game) => (
                <div
                  key={game.id}
                  className={`game-card ${game.unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => game.unlocked && startGame(game.id)}
                >
                  <span className="game-icon">{game.icon}</span>
                  <span className="game-name">{game.name}</span>
                </div>
              ))}
            </div>
            
            <button 
              className="btn btn-secondary btn-small" 
              style={{ marginTop: '20px', width: '100%' }}
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
          />
        )}
      </div>
    </div>
  );
}

// Frisbee Game Component
function FrisbeeGame({ playerId, players, broadcast, onBack }) {
  const [frisbeePos, setFrisbeePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isFlying, setIsFlying] = useState(false);
  const [hasFrisbee, setHasFrisbee] = useState(true);
  const [catches, setCatches] = useState(0);
  const [showDrink, setShowDrink] = useState(false);
  const [drinkPlayer, setDrinkPlayer] = useState('');
  
  const touchStartRef = useRef(null);
  const frisbeeRef = useRef(null);
  
  // Handle incoming frisbee
  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      if (data.type === 'frisbee-thrown' && data.senderId !== playerId) {
        // Frisbee coming to us!
        vibrate([100, 50, 100]);
        setHasFrisbee(false);
        
        // Animate frisbee entering from direction
        const startX = data.direction.x > 0 ? -100 : window.innerWidth + 100;
        const startY = 0;
        
        setFrisbeePos({ x: startX, y: startY });
        setIsFlying(true);
        
        // Animate to center
        setTimeout(() => {
          setFrisbeePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          setTimeout(() => {
            setIsFlying(false);
            setHasFrisbee(true);
            vibrate([50]);
          }, 500);
        }, 100);
      }
      
      if (data.type === 'frisbee-missed') {
        setDrinkPlayer(data.playerName);
        setShowDrink(true);
        vibrate([200, 100, 200, 100, 200]);
        setTimeout(() => setShowDrink(false), 3000);
      }
    };
    
    const channel = new BroadcastChannel(`bachelor-silvester-${window.location.pathname}`);
    channel.onmessage = handleMessage;
    
    return () => channel.close();
  }, [playerId]);
  
  const handleTouchStart = (e) => {
    if (!hasFrisbee || isFlying) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    vibrate([20]);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !hasFrisbee || isFlying) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;
    
    // Calculate swipe velocity
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
    
    // Only throw if swipe is strong enough and mostly upward
    if (velocity > 0.5 && deltaY < -50) {
      throwFrisbee(deltaX, deltaY, velocity);
    }
    
    touchStartRef.current = null;
  };
  
  const throwFrisbee = (deltaX, deltaY, velocity) => {
    setIsFlying(true);
    vibrate([50, 30, 50]);
    
    // Animate frisbee flying away
    const direction = {
      x: deltaX / Math.abs(deltaX) || 0,
      y: -1
    };
    
    const targetX = frisbeePos.x + deltaX * 5;
    const targetY = -200;
    
    setFrisbeePos({ x: targetX, y: targetY });
    
    // Broadcast throw
    broadcast({
      type: 'frisbee-thrown',
      direction,
      velocity
    });
    
    // Reset after throw
    setTimeout(() => {
      setCatches(prev => prev + 1);
      setIsFlying(false);
      setHasFrisbee(false);
      
      // Wait for it to come back or reset
      setTimeout(() => {
        setFrisbeePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setHasFrisbee(true);
      }, 2000);
    }, 800);
  };
  
  return (
    <div className="frisbee-game" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="game-header">
        <span className="game-title">🥏 Frisbee Fangen</span>
        <button className="back-btn" onClick={onBack}>✕</button>
      </div>
      
      <div className="score-display">
        <span className="score-text">Würfe: {catches}</span>
      </div>
      
      <div className="frisbee-area">
        <div
          ref={frisbeeRef}
          className={`frisbee ${isFlying ? 'flying' : ''}`}
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
        <div className="swipe-hint">
          <span className="swipe-arrow">↑</span>
          <span>Nach oben swipen zum Werfen!</span>
        </div>
      )}
      
      {!hasFrisbee && !isFlying && (
        <div className="swipe-hint">
          <span className="swipe-arrow">🎯</span>
          <span>Warte auf das Frisbee...</span>
        </div>
      )}
      
      {showDrink && (
        <div className="drink-popup">
          <span className="drink-text">{drinkPlayer} trinkt!</span>
          <span className="drink-emoji">🍺</span>
        </div>
      )}
    </div>
  );
}
