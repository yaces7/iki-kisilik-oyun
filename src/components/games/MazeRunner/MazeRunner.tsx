import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

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

const celebrationAnim = keyframes`
  0% { transform: scale(1); filter: hue-rotate(0deg); }
  50% { transform: scale(1.3); filter: hue-rotate(180deg); }
  100% { transform: scale(1); filter: hue-rotate(360deg); }
`;

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
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

const PlayerScore = styled.div<{ color: string, active: boolean }>`
  color: ${props => props.color};
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
`;

const MazeContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  margin: 1rem 0;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(0,0,0,0.2);
  overflow: hidden;
  user-select: none;
`;

const MazeCell = styled.div<{ 
  isWall: boolean, 
  isStart: boolean, 
  isFinish: boolean,
  isPath: boolean,
  isPlayer: boolean,
  color: string 
}>`
  position: absolute;
  box-sizing: border-box;
  
  ${({ isWall, isStart, isFinish, isPath, isPlayer, color }) => {
    if (isPlayer) {
      return css`
        background-color: ${color};
        border-radius: 50%;
        z-index: 10;
        box-shadow: 0 0 10px ${color};
      `;
    }
    if (isWall) {
      return css`
        background-color: rgba(30, 30, 30, 0.8);
        border: 1px solid rgba(60, 60, 60, 0.8);
      `;
    }
    if (isStart) {
      return css`
        background-color: rgba(46, 204, 113, 0.3);
        border: 1px solid rgba(46, 204, 113, 0.5);
      `;
    }
    if (isFinish) {
      return css`
        background-color: rgba(231, 76, 60, 0.3);
        border: 1px solid rgba(231, 76, 60, 0.5);
      `;
    }
    if (isPath) {
      return css`
        background-color: rgba(52, 152, 219, 0.1);
        border: 1px solid rgba(52, 152, 219, 0.2);
      `;
    }
    return css`
      background-color: transparent;
      border: 1px solid rgba(255, 255, 255, 0.05);
    `;
  }}
`;

const FinishFlag = styled.div<{ celebrating: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 5;
  
  ${props => props.celebrating && css`
    animation: ${celebrationAnim} 1s ease-in-out infinite;
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

const ControlsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 200px;
  margin-top: 1rem;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1.5rem;
  padding: 10px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:nth-child(2), &:nth-child(8) {
    grid-column: 2;
  }
  
  &:nth-child(4), &:nth-child(6) {
    grid-row: 2;
  }
  
  &:nth-child(5) {
    visibility: hidden;
  }
`;

const TimerDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-top: 1rem;
  text-shadow: 0 0 10px rgba(0,0,0,0.3);
`;

const ResultsTable = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 400px;
`;

const ResultRow = styled.div<{ highlight: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.highlight && css`
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
  `}
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 1rem 0;
  width: 100%;
  justify-content: center;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  flex: 1;
  max-width: 150px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Kolay',
    mazeSize: 15,
    timeBonus: 30,
    hazardCount: 0,
    collectibleCount: 3,
    fogOfWar: false
  },
  MEDIUM: {
    name: 'Orta',
    mazeSize: 21,
    timeBonus: 20,
    hazardCount: 3,
    collectibleCount: 5,
    fogOfWar: false
  },
  HARD: {
    name: 'Zor',
    mazeSize: 25,
    timeBonus: 10,
    hazardCount: 5,
    collectibleCount: 8,
    fogOfWar: true
  }
};

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

// Labirent ölçüleri - artık dinamik olacak
const DIRECTIONS = [
  { dx: 0, dy: -1 }, // Yukarı
  { dx: 1, dy: 0 },  // Sağ
  { dx: 0, dy: 1 },  // Aşağı
  { dx: -1, dy: 0 }, // Sol
];

// Hazard ve collectible tipleri
const HAZARD_TYPES = [
  { type: 'trap', symbol: '⚡', effect: 'slow', penalty: 5 },
  { type: 'mud', symbol: '💩', effect: 'slow', penalty: 3 },
  { type: 'teleport', symbol: '🌀', effect: 'teleport', penalty: 0 }
];

const COLLECTIBLE_TYPES = [
  { type: 'coin', symbol: '💰', points: 10 },
  { type: 'gem', symbol: '💎', points: 20 },
  { type: 'star', symbol: '⭐', points: 30 },
  { type: 'key', symbol: '🔑', points: 15, effect: 'unlock' }
];

interface Player {
  id: number;
  score: number;
  completionTime: number | null;
  stepsTaken: number;
  collectiblesFound: number;
  hazardsHit: number;
}

interface Position {
  x: number;
  y: number;
}

interface Collectible {
  position: Position;
  type: string;
  symbol: string;
  points: number;
  collected: boolean;
  effect?: string;
}

interface Hazard {
  position: Position;
  type: string;
  symbol: string;
  effect: string;
  penalty: number;
  triggered: boolean;
}

const MazeRunner: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      completionTime: null,
      stepsTaken: 0,
      collectiblesFound: 0,
      hazardsHit: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Labirent durumları
  const [maze, setMaze] = useState<boolean[][]>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 });
  const [startPosition, setStartPosition] = useState<Position>({ x: 1, y: 1 });
  const [finishPosition, setFinishPosition] = useState<Position>({ x: 0, y: 0 });
  const [visitedCells, setVisitedCells] = useState<boolean[][]>([]);
  const [visibleCells, setVisibleCells] = useState<boolean[][]>([]); // Görüş alanı için (FOW)
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [mazeSize, setMazeSize] = useState(difficulty.mazeSize);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'ready' | 'playing' | 'finished' | 'end'>('ready');
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false); // Tuzak etkisi
  const [slowedTimer, setSlowedTimer] = useState<NodeJS.Timeout | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mazeContainerRef = useRef<HTMLDivElement>(null);
  const cellSize = useRef(20); // Default cell size
  const totalRounds = playerCount; // Her oyuncu 1 tur oynasın
  
  // Zorluk seviyesini değiştir
  const changeDifficulty = (newDifficulty: typeof DIFFICULTY_LEVELS.EASY | 
                                         typeof DIFFICULTY_LEVELS.MEDIUM | 
                                         typeof DIFFICULTY_LEVELS.HARD) => {
    setDifficulty(newDifficulty);
    setMazeSize(newDifficulty.mazeSize);
  };
  
  // Labirent oluşturma fonksiyonu
  const generateMaze = useCallback(() => {
    // Başlangıçta tüm hücreler duvar
    const size = mazeSize;
    const newMaze: boolean[][] = Array(size).fill(0)
      .map(() => Array(size).fill(true));
    
    // Recursive Backtracking algoritması ile labirent oluştur
    const stack: Position[] = [];
    const start: Position = { x: 1, y: 1 };
    
    newMaze[start.y][start.x] = false; // Başlangıç yolu aç
    stack.push(start);
    
    const isValid = (x: number, y: number) => 
      x > 0 && x < size - 1 && y > 0 && y < size - 1;
    
    const getUnvisitedNeighbors = (x: number, y: number) => {
      const neighbors: Position[] = [];
      
      // 2 adım öteyi kontrol et (duvar + hücre)
      DIRECTIONS.forEach(({ dx, dy }) => {
        const nx = x + dx * 2;
        const ny = y + dy * 2;
        
        if (isValid(nx, ny) && newMaze[ny][nx]) {
          neighbors.push({ x: nx, y: ny });
        }
      });
      
      return neighbors;
    };
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current.x, current.y);
      
      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }
      
      // Rastgele komşu seç
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Aradaki duvarı yık
      newMaze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = false;
      
      // Komşu hücreyi yol olarak işaretle
      newMaze[next.y][next.x] = false;
      
      stack.push(next);
    }
    
    // Bitiş noktasını ayarla (labirentin uzak köşesi)
    const finish: Position = { x: size - 2, y: size - 2 };
    newMaze[finish.y][finish.x] = false;
    
    // Bitiş noktasına giden yolu garantile
    let current = finish;
    while (current.x !== start.x || current.y !== start.y) {
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;
      
      if (isValid(nx, ny)) {
        newMaze[ny][nx] = false;
        current = { x: nx, y: ny };
      }
    }
    
    setMaze(newMaze);
    setStartPosition(start);
    setFinishPosition(finish);
    setPlayerPosition(start);
    
    // Ziyaret edilen ve görülebilen hücreleri sıfırla
    const emptyGrid = Array(size).fill(0).map(() => Array(size).fill(false));
    setVisitedCells([...emptyGrid]);
    
    // Görüş alanını ayarla - zorluk seviyesine göre
    if (difficulty.fogOfWar) {
      setVisibleCells([...emptyGrid]);
      updateVisibility(start);
    } else {
      // Tüm hücreler görünür olsun
      setVisibleCells(Array(size).fill(0).map(() => Array(size).fill(true)));
    }
    
    // Hazard (tuzak) ve collectible (toplanabilir eşya) ekle
    generateHazards(newMaze, start, finish);
    generateCollectibles(newMaze, start, finish);
    
    return newMaze;
  }, [mazeSize, difficulty.fogOfWar]);
  
  // Hazard (tuzak) oluşturma fonksiyonu
  const generateHazards = (maze: boolean[][], start: Position, finish: Position) => {
    const newHazards: Hazard[] = [];
    const size = mazeSize;
    const count = difficulty.hazardCount;
    
    // Başlangıç ve bitiş pozisyonundan uzağa tuzakları yerleştir
    const isValidPosition = (pos: Position) => {
      // Yol mu kontrolü
      if (maze[pos.y][pos.x]) return false;
      
      // Başlangıç ve bitişe çok yakın mı kontrolü
      const startDist = Math.abs(pos.x - start.x) + Math.abs(pos.y - start.y);
      const finishDist = Math.abs(pos.x - finish.x) + Math.abs(pos.y - finish.y);
      if (startDist < 5 || finishDist < 5) return false;
      
      // Mevcut tuzakların üzerine gelmesin
      return !newHazards.some(h => h.position.x === pos.x && h.position.y === pos.y);
    };
    
    for (let i = 0; i < count; i++) {
      // Rastgele tuzak tipi seç
      const hazardType = HAZARD_TYPES[Math.floor(Math.random() * HAZARD_TYPES.length)];
      
      // Rastgele geçerli pozisyon bul
      let pos: Position;
      let attempts = 0;
      do {
        pos = {
          x: Math.floor(Math.random() * (size - 2)) + 1,
          y: Math.floor(Math.random() * (size - 2)) + 1
        };
        attempts++;
      } while (!isValidPosition(pos) && attempts < 100);
      
      if (attempts < 100) {
        newHazards.push({
          position: pos,
          type: hazardType.type,
          symbol: hazardType.symbol,
          effect: hazardType.effect,
          penalty: hazardType.penalty,
          triggered: false
        });
      }
    }
    
    setHazards(newHazards);
  };
  
  // Collectible (toplanabilir eşya) oluşturma fonksiyonu
  const generateCollectibles = (maze: boolean[][], start: Position, finish: Position) => {
    const newCollectibles: Collectible[] = [];
    const size = mazeSize;
    const count = difficulty.collectibleCount;
    
    // Başlangıç ve bitiş pozisyonundan uzağa eşyaları yerleştir
    const isValidPosition = (pos: Position) => {
      // Yol mu kontrolü
      if (maze[pos.y][pos.x]) return false;
      
      // Başlangıç ve bitişe çok yakın mı kontrolü
      const startDist = Math.abs(pos.x - start.x) + Math.abs(pos.y - start.y);
      if (startDist < 3) return false;
      
      // Mevcut collectible'ların üzerine gelmesin
      return !newCollectibles.some(c => c.position.x === pos.x && c.position.y === pos.y);
    };
    
    for (let i = 0; i < count; i++) {
      // Rastgele collectible tipi seç
      const collectibleType = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
      
      // Rastgele geçerli pozisyon bul
      let pos: Position;
      let attempts = 0;
      do {
        pos = {
          x: Math.floor(Math.random() * (size - 2)) + 1,
          y: Math.floor(Math.random() * (size - 2)) + 1
        };
        attempts++;
      } while (!isValidPosition(pos) && attempts < 100);
      
      if (attempts < 100) {
        newCollectibles.push({
          position: pos,
          type: collectibleType.type,
          symbol: collectibleType.symbol,
          points: collectibleType.points,
          collected: false,
          effect: collectibleType.effect
        });
      }
    }
    
    setCollectibles(newCollectibles);
  };
  
  // Görüş alanını güncelle (Zor mod için)
  const updateVisibility = (playerPos: Position) => {
    const viewRadius = 3; // Görüş mesafesi
    
    setVisibleCells(prev => {
      const newVisible = [...prev];
      
      // Oyuncunun etrafındaki hücreleri görünür yap
      for (let y = Math.max(0, playerPos.y - viewRadius); y <= Math.min(mazeSize - 1, playerPos.y + viewRadius); y++) {
        for (let x = Math.max(0, playerPos.x - viewRadius); x <= Math.min(mazeSize - 1, playerPos.x + viewRadius); x++) {
          // Manhattan mesafesi kullan (kare görüş alanı yerine daha dairesel)
          const distance = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
          if (distance <= viewRadius) {
            newVisible[y][x] = true;
          }
        }
      }
      
      return newVisible;
    });
  };
  
  // Oyunu başlat
  const startGame = () => {
    generateMaze();
    setTimer(0);
    setPhase('playing');
    setIsSlowed(false);
    
    // Zamanlayıcıyı başlat
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 0.1);
    }, 100);
    
    // Mevcut oyuncunun istatistiklerini sıfırla
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { 
          ...p, 
          stepsTaken: 0,
          collectiblesFound: 0,
          hazardsHit: 0 
        };
      }
      return p;
    }));
  };
  
  // Hücre boyutunu hesapla
  useEffect(() => {
    const updateCellSize = () => {
      if (mazeContainerRef.current) {
        const containerSize = Math.min(
          mazeContainerRef.current.clientWidth,
          mazeContainerRef.current.clientHeight
        );
        cellSize.current = Math.floor(containerSize / DIFFICULTY_LEVELS.EASY.mazeSize);
      }
    };
    
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    
    return () => {
      window.removeEventListener('resize', updateCellSize);
    };
  }, []);
  
  // Temizlik işlemleri
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (slowedTimer) {
        clearTimeout(slowedTimer);
      }
    };
  }, []);
  
  // Oyuncu hareketi
  const movePlayer = (dx: number, dy: number) => {
    if (phase !== 'playing') return;
    
    // Eğer yavaşlatma etkisi varsa ve rastgele bir sayı 0.3'ten düşükse, hareketi engelle
    if (isSlowed && Math.random() < 0.3) {
      return; // Hareket başarısız (kayma etkisi)
    }
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // Hareket geçerli mi kontrol et
    if (
      newX >= 0 && newX < mazeSize &&
      newY >= 0 && newY < mazeSize &&
      !maze[newY][newX] // Duvar değilse
    ) {
      // Oyuncuyu hareket ettir
      setPlayerPosition({ x: newX, y: newY });
      
      // Ziyaret edilen hücreyi işaretle
      setVisitedCells(prev => {
        const newVisited = [...prev];
        newVisited[newY][newX] = true;
        return newVisited;
      });
      
      // FOW (görüş alanı) varsa güncelle
      if (difficulty.fogOfWar) {
        updateVisibility({ x: newX, y: newY });
      }
      
      // Adım sayısını artır
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          return { ...p, stepsTaken: p.stepsTaken + 1 };
        }
        return p;
      }));
      
      // Collectible kontrol et
      const collectibleIndex = collectibles.findIndex(
        c => c.position.x === newX && c.position.y === newY && !c.collected
      );
      
      if (collectibleIndex !== -1) {
        // Collectible toplandı
        const collectedItem = collectibles[collectibleIndex];
        
        // Collectible durumunu güncelle
        setCollectibles(prev => prev.map((c, i) => 
          i === collectibleIndex ? { ...c, collected: true } : c
        ));
        
        // Oyuncu puanını güncelle
        setPlayers(prev => prev.map((p, i) => {
          if (i === activePlayer) {
            return { 
              ...p, 
              score: p.score + collectedItem.points,
              collectiblesFound: p.collectiblesFound + 1 
            };
          }
          return p;
        }));
      }
      
      // Hazard (tuzak) kontrol et
      const hazardIndex = hazards.findIndex(
        h => h.position.x === newX && h.position.y === newY && !h.triggered
      );
      
      if (hazardIndex !== -1) {
        // Tuzağa basıldı
        const triggeredHazard = hazards[hazardIndex];
        
        // Tuzak durumunu güncelle
        setHazards(prev => prev.map((h, i) => 
          i === hazardIndex ? { ...h, triggered: true } : h
        ));
        
        // Oyuncu istatistiklerini güncelle
        setPlayers(prev => prev.map((p, i) => {
          if (i === activePlayer) {
            return { 
              ...p, 
              hazardsHit: p.hazardsHit + 1
            };
          }
          return p;
        }));
        
        // Tuzak etkisini uygula
        if (triggeredHazard.effect === 'slow') {
          // Yavaşlatma etkisi
          setIsSlowed(true);
          
          // Mevcut yavaşlatma zamanlayıcısını temizle
          if (slowedTimer) {
            clearTimeout(slowedTimer);
          }
          
          // 5 saniye sonra normal hıza dön
          const timer = setTimeout(() => {
            setIsSlowed(false);
          }, 5000);
          
          setSlowedTimer(timer);
        } 
        else if (triggeredHazard.effect === 'teleport') {
          // Rastgele bir yere ışınlanma
          let randomX, randomY;
          let attempts = 0;
          
          do {
            randomX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            randomY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            attempts++;
          } while (maze[randomY][randomX] && attempts < 100); // Duvar olmayana kadar dene
          
          if (attempts < 100) {
            setPlayerPosition({ x: randomX, y: randomY });
            
            // FOW (görüş alanı) varsa güncelle
            if (difficulty.fogOfWar) {
              updateVisibility({ x: randomX, y: randomY });
            }
          }
        }
      }
      
      // Bitiş noktasına ulaşıldı mı kontrol et
      if (newX === finishPosition.x && newY === finishPosition.y) {
        finishLevel();
      }
    }
  };
  
  // Labirent tamamlandı
  const finishLevel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Yavaşlatma zamanlayıcısını temizle
    if (slowedTimer) {
      clearTimeout(slowedTimer);
      setSlowedTimer(null);
    }
    
    // Kutlama animasyonu
    setCelebrating(true);
    
    // Oyuncunun tamamlama zamanını ve puanını kaydet
    const completionTime = parseFloat(timer.toFixed(1));
    const collectiblesBonus = calculateCollectiblesBonus();
    
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        // Tamamlama süresi ne kadar kısaysa o kadar çok puan
        const baseScore = 100;
        const timeBonus = Math.max(0, Math.floor(difficulty.timeBonus - completionTime) * 2);
        const stepPenalty = Math.floor(p.stepsTaken / 10);
        const hazardPenalty = p.hazardsHit * 5;
        const score = baseScore + timeBonus + collectiblesBonus - stepPenalty - hazardPenalty;
        
        return { 
          ...p, 
          completionTime,
          score: p.score + score
        };
      }
      return p;
    }));
    
    // Aşama değiştir
    setPhase('finished');
    
    // 2 saniye sonra kutlamayı durdur
    setTimeout(() => {
      setCelebrating(false);
    }, 2000);
  };
  
  // Toplanan eşyalardan elde edilen bonus puanı hesapla
  const calculateCollectiblesBonus = () => {
    return collectibles
      .filter(c => c.collected)
      .reduce((total, c) => total + c.points, 0);
  };
  
  // Formatlanmış süre
  const formatTime = (time: number) => {
    return time.toFixed(1);
  };
  
  // Kazananı bul
  const getWinner = () => {
    return players.reduce((highest, player) => 
      player.score > highest.score ? player : highest, players[0]);
  };
  
  // Beraberlik kontrolü
  const isTie = () => {
    const winner = getWinner();
    return players.filter(p => p.score === winner.score).length > 1;
  };
  
  // Sıralı oyuncular
  const getRankedPlayers = () => {
    return [...players].sort((a, b) => b.score - a.score);
  };
  
  // Klavye kontrolleri
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, playerPosition, maze]);
  
  // Sonraki tura geç
  const nextRound = () => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound > totalRounds) {
      // Oyun bitti
      setPhase('end');
    } else {
      // Sıradaki oyuncuya geç
      setActivePlayer((activePlayer + 1) % playerCount);
      setPhase('ready');
    }
  };
  
  return (
    <GameContainer>
      <Header>Labirent Koşusu</Header>
      
      <ScoreBoard>
        {players.map((player, index) => (
          <PlayerScore 
            key={player.id} 
            color={PLAYER_COLORS[index]} 
            active={activePlayer === index && phase !== 'end'}
          >
            Oyuncu {index + 1}: {player.score}
          </PlayerScore>
        ))}
      </ScoreBoard>
      
      {phase === 'ready' && (
        <>
          <InfoText>Sıra: Oyuncu {activePlayer + 1}</InfoText>
          <p style={{ color: 'white', textAlign: 'center', maxWidth: '600px' }}>
            Labirentte başlangıç noktasından (yeşil) bitiş noktasına (kırmızı) ulaşmaya çalış.
            Hızlı olursan daha çok puan kazanırsın! Değerli eşyaları toplamayı ve tuzaklardan kaçınmayı unutma!
          </p>
          
          <div style={{display: 'flex', gap: '10px', marginBottom: '1rem', justifyContent: 'center'}}>
            {Object.values(DIFFICULTY_LEVELS).map(level => (
              <button
                key={level.name}
                onClick={() => changeDifficulty(level)}
                style={{
                  padding: '8px 16px',
                  background: difficulty.name === level.name ? 'rgba(52, 152, 219, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: difficulty.name === level.name ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                {level.name}
              </button>
            ))}
          </div>
          
          <p style={{ color: 'white', textAlign: 'center', fontSize: '0.9rem', margin: '5px 0' }}>
            {difficulty.name === 'Kolay' ? 
              '15x15 labirent, eşya bonusu, tuzak yok' : 
              difficulty.name === 'Orta' ? 
              '21x21 labirent, eşya ve tuzaklar' : 
              '25x25 labirent, eşya ve tuzaklar, görüş alanı sınırlı'}
          </p>
          
          <NextButton onClick={startGame}>Başla</NextButton>
        </>
      )}
      
      {(phase === 'playing' || phase === 'finished') && (
        <>
          {phase === 'playing' && (
            <>
              <TimerDisplay>{formatTime(timer)} sn</TimerDisplay>
              
              {isSlowed && (
                <div style={{
                  color: '#e74c3c',
                  background: 'rgba(231, 76, 60, 0.2)',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  marginBottom: '5px',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ Yavaşlatıldın! Bazı hareketlerin başarısız olabilir.
                </div>
              )}
            </>
          )}
          
          <MazeContainer ref={mazeContainerRef}>
            {/* Labirent hücreleri */}
            {maze.map((row, y) => 
              row.map((isWall, x) => {
                // Görüş alanı kontrolü (Zor mod)
                const isVisible = !difficulty.fogOfWar || visibleCells[y]?.[x];
                
                if (!isVisible) {
                  return (
                    <MazeCell
                      key={`${x}-${y}`}
                      isWall={true}
                      isStart={false}
                      isFinish={false}
                      isPath={false}
                      isPlayer={false}
                      color="black"
                      style={{
                        width: `${cellSize.current}px`,
                        height: `${cellSize.current}px`,
                        left: `${x * cellSize.current}px`,
                        top: `${y * cellSize.current}px`,
                        background: '#000',
                        opacity: 0.8
                      }}
                    />
                  );
                }
                
                return (
                  <MazeCell
                    key={`${x}-${y}`}
                    isWall={isWall}
                    isStart={x === startPosition.x && y === startPosition.y}
                    isFinish={x === finishPosition.x && y === finishPosition.y}
                    isPath={visitedCells[y]?.[x] || false}
                    isPlayer={false}
                    color="transparent"
                    style={{
                      width: `${cellSize.current}px`,
                      height: `${cellSize.current}px`,
                      left: `${x * cellSize.current}px`,
                      top: `${y * cellSize.current}px`
                    }}
                  />
                );
              })
            )}
            
            {/* Collectibles (eşyalar) */}
            {collectibles.map((item, index) => {
              // Görüş alanı kontrolü (Zor mod)
              const isVisible = !difficulty.fogOfWar || 
                visibleCells[item.position.y]?.[item.position.x];
                
              if (!isVisible || item.collected) return null;
              
              return (
                <div
                  key={`collectible-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${item.position.x * cellSize.current + cellSize.current * 0.2}px`,
                    top: `${item.position.y * cellSize.current + cellSize.current * 0.2}px`,
                    width: `${cellSize.current * 0.6}px`,
                    height: `${cellSize.current * 0.6}px`,
                    fontSize: `${cellSize.current * 0.5}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3
                  }}
                >
                  {item.symbol}
                </div>
              );
            })}
            
            {/* Hazards (tuzaklar) */}
            {hazards.map((item, index) => {
              // Görüş alanı kontrolü (Zor mod)
              const isVisible = !difficulty.fogOfWar || 
                visibleCells[item.position.y]?.[item.position.x];
                
              if (!isVisible || item.triggered) return null;
              
              return (
                <div
                  key={`hazard-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${item.position.x * cellSize.current + cellSize.current * 0.2}px`,
                    top: `${item.position.y * cellSize.current + cellSize.current * 0.2}px`,
                    width: `${cellSize.current * 0.6}px`,
                    height: `${cellSize.current * 0.6}px`,
                    fontSize: `${cellSize.current * 0.5}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                >
                  {item.symbol}
                </div>
              );
            })}
            
            {/* Oyuncu */}
            <MazeCell
              isWall={false}
              isStart={false}
              isFinish={false}
              isPath={false}
              isPlayer={true}
              color={PLAYER_COLORS[activePlayer]}
              style={{
                width: `${cellSize.current * 0.8}px`,
                height: `${cellSize.current * 0.8}px`,
                left: `${playerPosition.x * cellSize.current + cellSize.current * 0.1}px`,
                top: `${playerPosition.y * cellSize.current + cellSize.current * 0.1}px`,
                transition: 'left 0.2s, top 0.2s',
                zIndex: 10
              }}
            />
            
            {/* Bitiş bayrağı */}
            <MazeCell
              isWall={false}
              isStart={false}
              isFinish={true}
              isPath={false}
              isPlayer={false}
              color="transparent"
              style={{
                width: `${cellSize.current}px`,
                height: `${cellSize.current}px`,
                left: `${finishPosition.x * cellSize.current}px`,
                top: `${finishPosition.y * cellSize.current}px`
              }}
            >
              <FinishFlag celebrating={celebrating}>🚩</FinishFlag>
            </MazeCell>
          </MazeContainer>
          
          {phase === 'playing' && (
            <ControlsContainer>
              <div></div>
              <ControlButton onClick={() => movePlayer(0, -1)}>⬆️</ControlButton>
              <div></div>
              <ControlButton onClick={() => movePlayer(-1, 0)}>⬅️</ControlButton>
              <div></div>
              <ControlButton onClick={() => movePlayer(1, 0)}>➡️</ControlButton>
              <div></div>
              <ControlButton onClick={() => movePlayer(0, 1)}>⬇️</ControlButton>
              <div></div>
            </ControlsContainer>
          )}
          
          {phase === 'finished' && (
            <>
              <InfoText>Labirent Tamamlandı!</InfoText>
              
              <StatsContainer>
                <StatBox>
                  <StatValue>{formatTime(players[activePlayer].completionTime || 0)}</StatValue>
                  <StatLabel>Saniye</StatLabel>
                </StatBox>
                <StatBox>
                  <StatValue>{players[activePlayer].stepsTaken}</StatValue>
                  <StatLabel>Adım</StatLabel>
                </StatBox>
                <StatBox>
                  <StatValue>{players[activePlayer].collectiblesFound}</StatValue>
                  <StatLabel>Eşya</StatLabel>
                </StatBox>
                <StatBox>
                  <StatValue>{players[activePlayer].hazardsHit}</StatValue>
                  <StatLabel>Tuzak</StatLabel>
                </StatBox>
              </StatsContainer>
              
              <NextButton onClick={nextRound}>
                {round >= totalRounds ? 'Sonuçları Gör' : 'Sonraki Oyuncu'}
              </NextButton>
            </>
          )}
        </>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            {isTie() 
              ? 'Oyun Bitti! Beraberlik!' 
              : `Oyun Bitti! Kazanan: Oyuncu ${getWinner().id + 1}`
            }
          </InfoText>
          
          <ResultsTable>
            {getRankedPlayers().map((player, index) => (
              <ResultRow 
                key={player.id}
                highlight={player.id === getWinner().id && !isTie()}
              >
                <div style={{color: PLAYER_COLORS[player.id]}}>
                  Oyuncu {player.id + 1}
                </div>
                <div>{player.score} puan</div>
                <div>{player.completionTime ? `${formatTime(player.completionTime)} sn` : '-'}</div>
                <div>
                  <span style={{fontSize: '0.8rem'}}>
                    {player.collectiblesFound} eşya | {player.hazardsHit} tuzak
                  </span>
                </div>
              </ResultRow>
            ))}
          </ResultsTable>
          
          <NextButton onClick={() => window.location.reload()}>
            Ana Menüye Dön
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default MazeRunner; 