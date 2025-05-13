import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const FIELD_SIZE = 500;

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = {
  EASY: { 
    name: 'Kolay',
    mirrorCount: 3,
    obstacleCount: 0,
    powerupCount: 0,
    turnsPerPlayer: 3
  },
  MEDIUM: { 
    name: 'Orta',
    mirrorCount: 5,
    obstacleCount: 2,
    powerupCount: 2,
    turnsPerPlayer: 4
  },
  HARD: { 
    name: 'Zor',
    mirrorCount: 8,
    obstacleCount: 4,
    powerupCount: 3,
    turnsPerPlayer: 5
  }
};

// Powerup tipleri
const POWERUP_TYPES = [
  { type: 'doubleDamage', name: 'Çift Hasar', icon: '⚡', color: '#f39c12' },
  { type: 'shield', name: 'Kalkan', icon: '🛡️', color: '#3498db' },
  { type: 'multiShot', name: 'Çoklu Atış', icon: '🔱', color: '#8e44ad' },
  { type: 'moveMirror', name: 'Ayna Hareket', icon: '📡', color: '#1abc9c' }
];

// Animasyonlar
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #fff, 0 0 10px currentColor; }
  50% { box-shadow: 0 0 10px #fff, 0 0 20px currentColor; }
  100% { box-shadow: 0 0 5px #fff, 0 0 10px currentColor; }
`;

const rotate = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const Field = styled.div`
  width: ${FIELD_SIZE}px;
  height: ${FIELD_SIZE}px;
  background: linear-gradient(135deg, #1a2a6c, #2a3a7c, #1a2a6c);
  border: 4px solid #4a5a8c;
  border-radius: 18px;
  margin: 20px auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(26, 42, 108, 0.6);
`;

const GridLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
`;

const PlayerBase = styled.div<{ color: string; x: number; y: number; active: boolean; shield: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 36px;
  height: 36px;
  background: ${props => props.color};
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
  
  ${props => props.shield && `
    &:after {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: 50%;
      border: 2px solid #3498db;
      animation: ${glow} 1.5s infinite;
      color: #3498db;
    }
  `}
`;

const Mirror = styled.div<{ x: number; y: number; angle: number; highlight: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 40px;
  height: 6px;
  background: ${props => props.highlight ? '#f1c40f' : '#aaa'};
  border-radius: 3px;
  transform: translate(-50%, -50%) rotate(${props => props.angle}deg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  cursor: ${props => props.highlight ? 'pointer' : 'default'};
  transition: background 0.3s ease;
`;

const Obstacle = styled.div<{ x: number; y: number; size: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: #95a5a6;
  border-radius: 2px;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
`;

const Powerup = styled.div<{ x: number; y: number; color: string; collected: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 30px;
  height: 30px;
  background: ${props => props.color}33;
  border: 2px solid ${props => props.color};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  opacity: ${props => props.collected ? 0 : 1};
  transition: opacity 0.3s ease;
`;

const Laser = styled.div<{ x: number; y: number; w: number; h: number; color: string }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.w}px;
  height: ${props => props.h}px;
  background: ${props => props.color};
  border-radius: 4px;
  opacity: 0.8;
  box-shadow: 0 0 15px ${props => props.color};
  transform-origin: left center;
`;

const FireButton = styled.button`
  display: block;
  margin: 20px auto;
  font-size: 1.2rem;
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, #e74c3c, #d63031);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  
  &:disabled {
    background: #95a5a6;
    transform: none;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const DirectionControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const RotationButton = styled.button<{ direction: string }>`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: ${props => props.direction === 'up' || props.direction === 'down' ? '5px 0' : '0 5px'};
  
  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 1rem 0;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlayerScore = styled.div<{ color: string, active: boolean, eliminated?: boolean }>`
  color: ${props => props.color};
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
  position: relative;
  
  ${props => props.eliminated && `
    opacity: 0.5;
    text-decoration: line-through;
  `}
`;

const InfoText = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 10px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const MessageText = styled.div`
  color: white;
  font-size: 1.1rem;
  text-align: center;
  margin: 10px 0;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
`;

const PowerupsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px auto;
`;

const PowerupIcon = styled.div<{ color: string, active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.color}33;
  border: 2px solid ${props => props.color};
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.active ? 1 : 0.5};
  
  ${props => props.active && `
    animation: ${pulse} 1s infinite;
    box-shadow: 0 0 10px ${props.color};
  `}
`;

const NextButton = styled.button`
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
  }
`;

const ResultsTable = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 500px;
`;

const ResultRow = styled.div<{ highlight: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.highlight && `
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
  `}
`;

const Explosion = styled.div<{ x: number; y: number; size: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: radial-gradient(circle, #f39c12, #e74c3c, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
  animation: ${fadeIn} 0.3s forwards;
  z-index: 10;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255,255,255,0.1);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ${rotate} 1s linear infinite;
`;

interface Player {
  id: number;
  score: number;
  x: number;
  y: number;
  angle: number; // Ateş etme açısı
  powerups: string[];
  active: boolean; // Oyuncu aktif mi
  shield: boolean; // Kalkan aktif mi
  hits: number; // İsabet sayısı
  shots: number; // Atış sayısı
  eliminated: boolean;
}

interface MirrorObj {
  x: number;
  y: number;
  angle: number;
}

interface ObstacleObj {
  x: number;
  y: number;
  size: number;
}

interface PowerupObj {
  x: number;
  y: number;
  type: string;
  icon: string;
  color: string;
  collected: boolean;
}

const LaserDuel: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncular köşelerde
  const basePositions = [
    { x: 50, y: 50 },
    { x: FIELD_SIZE - 50, y: 50 },
    { x: 50, y: FIELD_SIZE - 50 },
    { x: FIELD_SIZE - 50, y: FIELD_SIZE - 50 }
  ];
  
  // State'ler
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(playerCount * difficulty.turnsPerPlayer);
  
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      score: 0,
      x: basePositions[i].x,
      y: basePositions[i].y,
      angle: i === 0 ? 45 : i === 1 ? 135 : i === 2 ? 315 : 225, // Köşelere göre başlangıç açıları
      powerups: [],
      active: false,
      shield: false,
      hits: 0,
      shots: 0,
      eliminated: false
    }))
  );
  
  const [mirrors, setMirrors] = useState<MirrorObj[]>(
    Array.from({ length: 3 }, () => ({
      x: 80 + Math.random() * (FIELD_SIZE - 160),
      y: 80 + Math.random() * (FIELD_SIZE - 160),
      angle: Math.random() * 180
    }))
  );
  
  const [obstacles, setObstacles] = useState<ObstacleObj[]>([]);
  const [powerups, setPowerups] = useState<PowerupObj[]>([]);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [phase, setPhase] = useState<'setup' | 'play' | 'firing' | 'end'>('setup');
  const [laserPath, setLaserPath] = useState<{x: number, y: number, w: number, h: number, color: string}[]>([]);
  const [selectedMirror, setSelectedMirror] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [explosions, setExplosions] = useState<{x: number, y: number, size: number}[]>([]);
  const [firingTimeout, setFiringTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Refs
  const fieldRef = useRef<HTMLDivElement>(null);
  
  // Zorluk seviyesini değiştir
  const changeDifficulty = (newDifficulty: typeof DIFFICULTY_LEVELS.EASY | 
                                         typeof DIFFICULTY_LEVELS.MEDIUM | 
                                         typeof DIFFICULTY_LEVELS.HARD) => {
    setDifficulty(newDifficulty);
    setTotalRounds(playerCount * newDifficulty.turnsPerPlayer);
  };
  
  // Yeni oyun kurulumu
  const setupGame = () => {
    generateMirrors();
    generateObstacles();
    generatePowerups();
    setActivePlayer(0);
    setPlayers(prev => prev.map((p, i) => ({
      ...p,
      active: i === 0,
      powerups: [],
      shield: false
    })));
    setPhase('play');
    setMessage(`Sıra: Oyuncu ${activePlayer + 1} - Ateş etmek için hazırlan!`);
  };
  
  // Ayna oluştur
  const generateMirrors = () => {
    const count = difficulty.mirrorCount;
    const newMirrors = [];
    
    for (let i = 0; i < count; i++) {
      // Oyunculardan ve diğer nesnelerden uzak bir konum bul
      let x = 0, y = 0;
      let valid = false;
      let attempts = 0;
      
      while (!valid && attempts < 100) {
        x = 100 + Math.random() * (FIELD_SIZE - 200);
        y = 100 + Math.random() * (FIELD_SIZE - 200);
        
        // Oyunculardan uzak mı kontrol et
        valid = !basePositions.some(pos => 
          Math.hypot(pos.x - x, pos.y - y) < 70
        );
        
        // Diğer aynalardan uzak mı kontrol et
        if (valid) {
          valid = !newMirrors.some(mirror => 
            Math.hypot(mirror.x - x, mirror.y - y) < 60
          );
        }
        
        attempts++;
      }
      
      if (valid) {
        newMirrors.push({
          x,
          y,
          angle: Math.floor(Math.random() * 180) // 0-179 derece
        });
      }
    }
    
    setMirrors(newMirrors);
  };
  
  // Engel oluştur
  const generateObstacles = () => {
    const count = difficulty.obstacleCount;
    const newObstacles = [];
    
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0;
      let valid = false;
      let attempts = 0;
      const size = 30 + Math.random() * 20; // 30-50 arası boyut
      
      while (!valid && attempts < 100) {
        x = 100 + Math.random() * (FIELD_SIZE - 200);
        y = 100 + Math.random() * (FIELD_SIZE - 200);
        
        // Oyunculardan uzak mı kontrol et
        valid = !basePositions.some(pos => 
          Math.hypot(pos.x - x, pos.y - y) < 80
        );
        
        // Diğer nesnelerden uzak mı kontrol et
        if (valid) {
          valid = !mirrors.some(mirror => 
            Math.hypot(mirror.x - x, mirror.y - y) < 60
          );
        }
        
        if (valid) {
          valid = !newObstacles.some(obstacle => 
            Math.hypot(obstacle.x - x, obstacle.y - y) < 60
          );
        }
        
        attempts++;
      }
      
      if (valid) {
        newObstacles.push({ x, y, size });
      }
    }
    
    setObstacles(newObstacles);
  };
  
  // Powerup oluştur
  const generatePowerups = () => {
    const count = difficulty.powerupCount;
    const newPowerups = [];
    
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0;
      let valid = false;
      let attempts = 0;
      
      // Rastgele bir powerup tipi seç
      const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      
      while (!valid && attempts < 100) {
        x = 100 + Math.random() * (FIELD_SIZE - 200);
        y = 100 + Math.random() * (FIELD_SIZE - 200);
        
        // Oyunculardan uzak mı kontrol et
        valid = !basePositions.some(pos => 
          Math.hypot(pos.x - x, pos.y - y) < 70
        );
        
        // Diğer nesnelerden uzak mı kontrol et
        if (valid) {
          valid = !mirrors.some(mirror => 
            Math.hypot(mirror.x - x, mirror.y - y) < 60
          );
        }
        
        if (valid) {
          valid = !obstacles.some(obstacle => 
            Math.hypot(obstacle.x - x, obstacle.y - y) < 60
          );
        }
        
        if (valid) {
          valid = !newPowerups.some(powerup => 
            Math.hypot(powerup.x - x, powerup.y - y) < 60
          );
        }
        
        attempts++;
      }
      
      if (valid) {
        newPowerups.push({
          x,
          y,
          type: powerupType.type,
          icon: powerupType.icon,
          color: powerupType.color,
          collected: false
        });
      }
    }
    
    setPowerups(newPowerups);
  };
  
  // Ayna seçildiğinde
  const handleMirrorSelect = (index: number) => {
    if (phase !== 'play' || !players[activePlayer]?.powerups.includes('moveMirror')) return;
    
    setSelectedMirror(index);
    setMessage('Aynayı döndürmek için tuşları kullan');
  };
  
  // Ayna açısını değiştir
  const rotateMirror = (direction: string) => {
    if (selectedMirror === null) return;
    
    setMirrors(prev => prev.map((mirror, i) => 
      i === selectedMirror
        ? { 
            ...mirror, 
            angle: (mirror.angle + (direction === 'left' ? -10 : 10) + 180) % 180 
          }
        : mirror
    ));
  };
  
  // Ateş açısını değiştir
  const rotatePlayer = (direction: string) => {
    if (phase !== 'play' || selectedMirror !== null) return;
    
    setPlayers(prev => prev.map((p, i) => 
      i === activePlayer
        ? { 
            ...p, 
            angle: (p.angle + (direction === 'left' ? -5 : 5) + 360) % 360 
          }
        : p
    ));
  };
  
  // Sıradaki aktif (elenmemiş) oyuncuya geç
  const nextTurn = () => {
    // Seçili aynayı temizle
    setSelectedMirror(null);
    
    // Bir sonraki turu başlat
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound > totalRounds) {
      setPhase('end');
      return;
    }
    
    // Bir sonraki aktif (elenmemiş) oyuncuyu bul
    let nextPlayer = (activePlayer + 1) % playerCount;
    let loopCount = 0;
    
    while (loopCount < playerCount) {
      if (!players[nextPlayer].eliminated) {
        break;
      }
      nextPlayer = (nextPlayer + 1) % playerCount;
      loopCount++;
    }
    
    // Oyunda sadece bir kişi kaldıysa, oyunu bitir
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length <= 1) {
      setPhase('end');
      return;
    }
    
    // Sonraki oyuncuya geç
    setActivePlayer(nextPlayer);
    
    // Oyuncu durumlarını güncelle
    setPlayers(prev => prev.map((p, i) => ({
      ...p,
      active: i === nextPlayer
    })));
    
    setPhase('play');
    setMessage(`Sıra: Oyuncu ${nextPlayer + 1} - Ateş etmek için hazırlan!`);
  };

  // Lazer ateşle
  const handleFire = () => {
    if (phase !== 'play') return;
    if (activePlayer === null || !players[activePlayer]) return;
    // Lazer yatay başlasın, aynalara çarptıkça yön değişsin (basit mantık)
    let x = players[activePlayer].x;
    let y = players[activePlayer].y;
    let dx = 1, dy = 0;
    let path: {x: number, y: number, w: number, h: number, color: string}[] = [];
    let hitPlayer: number | null = null;
    for (let step = 0; step < 20; step++) {
      let nextX = x + dx * 40;
      let nextY = y + dy * 40;
      // Aynaya çarpma kontrolü
      const mirror = mirrors.find(m => Math.abs(m.x - nextX) < 24 && Math.abs(m.y - nextY) < 24);
      if (mirror) {
        // Basit yansıtma: yatay <-> dikey
        [dx, dy] = [dy, dx];
      }
      // Rakibe çarpma kontrolü
      const hit = players.find((p, idx) => activePlayer !== null && idx !== activePlayer && Math.abs(p.x - nextX) < 24 && Math.abs(p.y - nextY) < 24);
      if (hit) {
        hitPlayer = hit.id;
        path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
        break;
      }
      // Sınır kontrolü
      if (nextX < 0 || nextX > FIELD_SIZE || nextY < 0 || nextY > FIELD_SIZE) {
        path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
        break;
      }
      path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
      x = nextX;
      y = nextY;
    }
    setLaserPath(path);
    // Puan ver
    setPlayers(ps => ps.map((p, idx) => {
      if (activePlayer !== null && idx === activePlayer) {
        let score = path.length * 10;
        if (hitPlayer !== null) score += 50;
        return { ...p, score: p.score + score, hits: p.hits + 1 };
      }
      return p;
    }));
    setTimeout(() => {
      setLaserPath([]);
      if (activePlayer === null || activePlayer === players.length - 1) {
        setPhase('end');
      } else {
        nextTurn();
      }
    }, 900);
  };

  // Skor tablosu
  const renderScore = () => (
    <ScoreBoard>
      {players.map((p, i) => (
        <span key={p.id} style={{ color: PLAYER_COLORS[i], fontWeight: 700, fontSize: 22, marginRight: 16 }}>
          Oyuncu {i + 1}: {p.score} puan
        </span>
      ))}
    </ScoreBoard>
  );

  // Kazanan
  const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Laser Duel</h2>
      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 24, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)', borderRadius: 12, padding: '12px 0', boxShadow: '0 2px 12px #0003', marginTop: 16 }}>
        {phase === 'play' && activePlayer !== null
          ? `Sıra: Oyuncu ${activePlayer + 1} - Ateş etmek için butona bas!`
          : phase === 'end'
            ? `Kazanan: Oyuncu ${winner.id + 1}`
            : ''
        }
      </div>
      {renderScore()}
      <Field>
        {players.map((p, i) => (
          <PlayerBase 
            key={p.id} 
            color={PLAYER_COLORS[i]} 
            x={p.x} 
            y={p.y}
            active={i === activePlayer}
            shield={false}
          />
        ))}
        {mirrors.map((m, i) => (
          <Mirror 
            key={i} 
            x={m.x} 
            y={m.y} 
            angle={m.angle}
            highlight={false}
          />
        ))}
        {laserPath.map((seg, i) => (
          <Laser key={i} x={seg.x} y={seg.y} w={seg.w} h={seg.h} color={seg.color} />
        ))}
      </Field>
      {phase === 'play' && <FireButton onClick={handleFire}>Ateş Et</FireButton>}
      {phase === 'end' && (
        <FireButton onClick={() => window.location.reload()}>Yeniden Oyna</FireButton>
      )}
    </div>
  );
};

export default LaserDuel; 