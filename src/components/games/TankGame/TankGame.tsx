import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import Tank from './Tank';

const GameArea = styled.div`
  width: 100vw;
  height: 100vh;
  background: #d2b48c; // Çöl rengi
  position: relative;
  overflow: hidden;
`;

const GameGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
`;

const Grass = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='%232ecc71' fill-opacity='0.1'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  pointer-events: none;
`;

const Bullet = styled.div<{ size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: #222;
  border-radius: 50%;
  box-shadow: 0 0 6px #000a;
`;

const Smoke = styled.div<{ size: number; opacity: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: #888;
  border-radius: 50%;
  opacity: ${props => props.opacity};
  pointer-events: none;
`;

const HealthBar = styled.div<{ health: number; color: string }>`
  position: absolute;
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.health}%;
    height: 100%;
    background: ${props => props.color};
    transition: width 0.3s ease;
  }
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 1;
`;

const ControlButton = styled.button<{ color: string }>`
  background: ${props => props.color};
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const FireButton = styled(ControlButton)`
  background: #e74c3c;
  width: 60px;
  height: 60px;
  font-size: 20px;
`;

const CornerButton = styled.button<{ color: string; position: string }>`
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: ${props => props.color};
  color: #fff;
  font-size: 2.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 10;
  cursor: pointer;
  opacity: 0.95;
  ${props => props.position === 'bottomLeft' && 'left: 30px; bottom: 30px;'}
  ${props => props.position === 'bottomRight' && 'right: 30px; bottom: 30px;'}
  ${props => props.position === 'topLeft' && 'left: 30px; top: 30px;'}
  ${props => props.position === 'topRight' && 'right: 30px; top: 30px;'}
`;

const playerColors: Record<1 | 2 | 3 | 4, string> = {
  1: '#e74c3c', // Kırmızı
  2: '#3498db', // Mavi
  3: '#2ecc71', // Yeşil
  4: '#f1c40f'  // Sarı
};

interface Player {
  id: number;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  isMoving: boolean;
  alive: boolean;
  score: number;
}

interface Bullet {
  id: number;
  playerId: number;
  position: { x: number; y: number };
  rotation: number;
  bounces: number;
}

interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

const cornerPositions = [
  'bottomLeft', // 1. oyuncu
  'bottomRight', // 2. oyuncu
  'topLeft', // 3. oyuncu
  'topRight' // 4. oyuncu
] as const;

type CornerPosition = typeof cornerPositions[number];

const TANK_SIZE = 60;
const CANNON_LENGTH = 30;
const GRID_SIZE = 80; // Kare boyutu
const GRID_COLS = Math.floor(window.innerWidth / GRID_SIZE);
const GRID_ROWS = Math.floor(window.innerHeight / GRID_SIZE);

const Wall = styled.div`
  position: absolute;
  background: #e0e0e0;
  border: 3px solid #bdbdbd;
  box-sizing: border-box;
  border-radius: 4px;
`;

const GrassPatch = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle at 60% 40%, #4caf50 70%, #388e3c 100%);
  border-radius: 50%;
  opacity: 0.7;
`;

const CountdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CountdownText = styled.div`
  color: #fff;
  font-size: 8rem;
  font-weight: bold;
  text-shadow: 0 0 40px #000, 0 0 10px #fff;
  animation: pop 0.5s;
  @keyframes pop {
    0% { transform: scale(0.7); opacity: 0.5; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const WinOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const WinText = styled.div`
  color: #fff;
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0 0 30px #000, 0 0 10px #fff;
`;

const ScoreTable = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 2rem 3rem;
  color: #fff;
  font-size: 1.5rem;
  box-shadow: 0 0 20px #0008;
`;

const BULLET_SIZE = 12;
const SMOKE_SIZE = 18;

// Labirent için grid tabanlı duvarlar
function generateMaze(cols: number, rows: number) {
  // Basit bir maze algoritması (örnek: her satırda ve sütunda rastgele kısa kenarlı duvarlar)
  const walls: { x: number; y: number; w: number; h: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Yatay duvar
      if (Math.random() > 0.6 && x < cols - 1) {
        walls.push({
          x: x * GRID_SIZE,
          y: y * GRID_SIZE,
          w: GRID_SIZE,
          h: 8
        });
      }
      // Dikey duvar
      if (Math.random() > 0.6 && y < rows - 1) {
        walls.push({
          x: x * GRID_SIZE,
          y: y * GRID_SIZE,
          w: 8,
          h: GRID_SIZE
        });
      }
    }
  }
  // Kenar duvarları
  walls.push({ x: 0, y: 0, w: cols * GRID_SIZE, h: 8 }); // üst
  walls.push({ x: 0, y: rows * GRID_SIZE - 8, w: cols * GRID_SIZE, h: 8 }); // alt
  walls.push({ x: 0, y: 0, w: 8, h: rows * GRID_SIZE }); // sol
  walls.push({ x: cols * GRID_SIZE - 8, y: 0, w: 8, h: rows * GRID_SIZE }); // sağ
  return walls;
}

const TankGame: React.FC<{ 
  playerCount: number;
  deviceType: 'computer' | 'phone';
}> = ({ playerCount, deviceType }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [rotating, setRotating] = useState<{ [id: number]: boolean }>({});
  const [moving, setMoving] = useState<{ [id: number]: boolean }>({});
  const [activePlayer, setActivePlayer] = useState<1 | 2 | 3 | 4>(1);
  const [walls, setWalls] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [tankSize, setTankSize] = useState<number>(60);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [smoke, setSmoke] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    const initialPlayers: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      position: {
        x: window.innerWidth / (playerCount + 1) * (i + 1),
        y: window.innerHeight / 2
      },
      rotation: 0,
      health: 3,
      isMoving: false,
      alive: true,
      score: 0
    }));
    setPlayers(initialPlayers);
  }, [playerCount]);

  const movePlayer = useCallback((playerId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id === playerId) {
          const speed = 5;
          let newX = player.position.x;
          let newY = player.position.y;
          let newRotation = player.rotation;

          switch (direction) {
            case 'up':
              newY -= speed;
              newRotation = 0;
              break;
            case 'down':
              newY += speed;
              newRotation = 180;
              break;
            case 'left':
              newX -= speed;
              newRotation = 270;
              break;
            case 'right':
              newX += speed;
              newRotation = 90;
              break;
          }

          // Sınırları kontrol et
          newX = Math.max(0, Math.min(window.innerWidth - 60, newX));
          newY = Math.max(0, Math.min(window.innerHeight - 60, newY));

          return {
            ...player,
            position: { x: newX, y: newY },
            rotation: newRotation,
            isMoving: true
          };
        }
        return {
          ...player,
          isMoving: false
        };
      })
    );
  }, []);

  const fireBullet = useCallback((playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const rad = player.rotation * Math.PI / 180;
    // Tankın merkezinden namlu ucuna offset
    const offsetX = Math.sin(rad) * (TANK_SIZE / 2 + CANNON_LENGTH / 2);
    const offsetY = -Math.cos(rad) * (TANK_SIZE / 2 + CANNON_LENGTH / 2);
    const bullet: Bullet = {
      id: Date.now() + Math.random(),
      playerId,
      position: {
        x: player.position.x + TANK_SIZE / 2 + offsetX - 4, // 4: mermi yarıçapı
        y: player.position.y + TANK_SIZE / 2 + offsetY - 4
      },
      rotation: player.rotation,
      bounces: 0
    };

    setBullets(prev => [...prev, bullet]);
  }, [players]);

  // Maze oluştur ve tank boyutunu ayarla
  useEffect(() => {
    const maze = generateMaze(GRID_COLS, GRID_ROWS);
    setWalls(maze);
    let size = 60;
    if (maze.length > 60) size = 36;
    else if (maze.length > 40) size = 44;
    else if (maze.length > 25) size = 52;
    setTankSize(size);
  }, []);

  // Geri sayım başlat
  useEffect(() => {
    setCountdown(3);
    setGameStarted(false);
  }, [playerCount]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
      } else if (countdown === 0) {
        timer = setTimeout(() => {
          setCountdown(null);
          setGameStarted(true);
        }, 800);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Mermiler 6 kez sekince kaybolsun
  useEffect(() => {
    const bulletInterval = setInterval(() => {
      setBullets(prevBullets => {
        return prevBullets
          .map(bullet => {
            let speed = 10;
            let rad = bullet.rotation * Math.PI / 180;
            let newX = bullet.position.x + Math.cos(rad) * speed;
            let newY = bullet.position.y + Math.sin(rad) * speed;
            let newRotation = bullet.rotation;
            let bounces = bullet.bounces;
            // Sınırdan sekme
            if (newX < 0 || newX > window.innerWidth - BULLET_SIZE) {
              newRotation = 180 - newRotation;
              bounces++;
            }
            if (newY < 0 || newY > window.innerHeight - BULLET_SIZE) {
              newRotation = 360 - newRotation;
              bounces++;
            }
            // Duvarlardan sekme
            for (const wall of walls) {
              if (
                newX + BULLET_SIZE > wall.x && newX < wall.x + wall.w &&
                newY + BULLET_SIZE > wall.y && newY < wall.y + wall.h
              ) {
                if (wall.w > wall.h) {
                  newRotation = 360 - newRotation;
                } else {
                  newRotation = 180 - newRotation;
                }
                bounces++;
                break;
              }
            }
            if (bounces >= 6) return null;
            return {
              ...bullet,
              position: { x: newX, y: newY },
              rotation: newRotation,
              bounces
            };
          })
          .filter((b): b is Bullet => b !== null);
      });
    }, 16);
    return () => clearInterval(bulletInterval);
  }, [walls, bullets]);

  // Tank hareket ediyorsa arkasında duman efekti bırak
  useEffect(() => {
    const interval = setInterval(() => {
      setSmoke(prevSmoke => {
        let newSmoke = [...prevSmoke];
        players.forEach(player => {
          if (player.isMoving && player.alive) {
            const rad = player.rotation * Math.PI / 180;
            // Duman tankın arkasında çıksın
            const x = player.position.x + tankSize / 2 - Math.cos(rad) * (tankSize / 2 + 8) - SMOKE_SIZE / 2;
            const y = player.position.y + tankSize / 2 - Math.sin(rad) * (tankSize / 2 + 8) - SMOKE_SIZE / 2;
            newSmoke.push({
              id: Date.now() + Math.random(),
              x,
              y,
              opacity: 0.7,
              size: SMOKE_SIZE
            });
          }
        });
        // Dumanları yavaşça sil
        newSmoke = newSmoke.map(s => ({ ...s, opacity: s.opacity - 0.04 })).filter(s => s.opacity > 0);
        return newSmoke;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [players, tankSize]);

  // Başlangıçta tanklar dönüyor, hareket etmiyor
  useEffect(() => {
    const initialRotating: { [id: number]: boolean } = {};
    const initialMoving: { [id: number]: boolean } = {};
    for (let i = 1; i <= playerCount; i++) {
      initialRotating[i] = true;
      initialMoving[i] = false;
    }
    setRotating(initialRotating);
    setMoving(initialMoving);
  }, [playerCount]);

  // Tanklar sadece rotating true ise döner
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prevPlayers => prevPlayers.map(player => {
        if (rotating[player.id]) {
          return {
            ...player,
            rotation: player.rotation + 2 // Sürekli artar, sıfırlanmaz
          };
        }
        return player;
      }));
    }, 30);
    return () => clearInterval(interval);
  }, [rotating]);

  // Tanklar sadece moving true ise ileri gider
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      setPlayers(prevPlayers => prevPlayers.map(player => {
        if (moving[player.id]) {
          const speed = 6;
          let newX = player.position.x;
          let newY = player.position.y;
          let rad = player.rotation * Math.PI / 180;
          const nextX = newX + Math.cos(rad) * speed;
          const nextY = newY + Math.sin(rad) * speed;
          const tankRect = {
            x: nextX,
            y: nextY,
            w: tankSize,
            h: tankSize
          };
          const collides = walls.some(wall =>
            tankRect.x < wall.x + wall.w &&
            tankRect.x + tankRect.w > wall.x &&
            tankRect.y < wall.y + wall.h &&
            tankRect.y + tankRect.h > wall.y
          );
          if (!collides) {
            newX = Math.max(0, Math.min(window.innerWidth - tankSize, nextX));
            newY = Math.max(0, Math.min(window.innerHeight - tankSize, nextY));
            return {
              ...player,
              position: { x: newX, y: newY },
              isMoving: true
            };
          } else {
            return { ...player, isMoving: false };
          }
        }
        return { ...player, isMoving: false };
      }));
    }, 16);
    return () => clearInterval(interval);
  }, [moving, tankSize, walls, gameStarted]);

  // Mermi-tank çarpışması ve can azaltma
  useEffect(() => {
    if (!gameStarted) return;
    setPlayers(prevPlayers => {
      let updatedPlayers = [...prevPlayers];
      let updatedBullets = [...bullets];
      updatedBullets = updatedBullets.filter(bullet => {
        for (let i = 0; i < updatedPlayers.length; i++) {
          const player = updatedPlayers[i];
          if (!player.alive || bullet.playerId === player.id) continue;
          // Tank ve mermi çarpışma kontrolü
          const tankRect = {
            x: player.position.x,
            y: player.position.y,
            w: tankSize,
            h: tankSize
          };
          const bulletRect = {
            x: bullet.position.x,
            y: bullet.position.y,
            w: 8,
            h: 8
          };
          const hit =
            tankRect.x < bulletRect.x + bulletRect.w &&
            tankRect.x + tankRect.w > bulletRect.x &&
            tankRect.y < bulletRect.y + bulletRect.h &&
            tankRect.y + tankRect.h > bulletRect.y;
          if (hit) {
            // Can azalt
            updatedPlayers[i] = {
              ...player,
              health: player.health - 1
            };
            // Mermi silinsin
            return false;
          }
        }
        return true;
      });
      setBullets(updatedBullets);
      // Canı sıfır olanları öldür
      updatedPlayers = updatedPlayers.map(p =>
        p.health <= 0 ? { ...p, alive: false } : p
      );
      // Kazananı kontrol et
      const alivePlayers = updatedPlayers.filter(p => p.alive);
      if (alivePlayers.length === 1 && winner === null) {
        setWinner(alivePlayers[0].id);
        // Skor güncelle
        updatedPlayers = updatedPlayers.map(p =>
          p.id === alivePlayers[0].id ? { ...p, score: p.score + 1 } : p
        );
      }
      return updatedPlayers;
    });
  }, [bullets, gameStarted, tankSize, winner]);

  // Butona tıklama: ateş et (mermi namlunun ucundan, doğru yöne çıkacak)
  const handleCornerButtonClick = (playerId: number) => {
    if (!gameStarted) return;
    setPlayers(prevPlayers => {
      const player = prevPlayers.find(p => p.id === playerId);
      if (!player) return prevPlayers;
      const rad = player.rotation * Math.PI / 180;
      const centerX = player.position.x + tankSize / 2;
      const centerY = player.position.y + tankSize / 2;
      const offsetX = Math.cos(rad) * (tankSize / 2 + CANNON_LENGTH);
      const offsetY = Math.sin(rad) * (tankSize / 2 + CANNON_LENGTH);
      const bullet: Bullet = {
        id: Date.now() + Math.random(),
        playerId,
        position: {
          x: centerX + offsetX - 4,
          y: centerY + offsetY - 4
        },
        rotation: player.rotation,
        bounces: 0
      };
      setBullets(prev => [...prev, bullet]);
      return prevPlayers;
    });
  };

  // Butona basılı tutma: hareket başlar, dönme durur
  const handleCornerButtonDown = (playerId: number) => {
    setRotating(r => ({ ...r, [playerId]: false }));
    setMoving(m => ({ ...m, [playerId]: true }));
  };

  // Butondan el çekilince: hareket durur, dönme başlar
  const handleCornerButtonUp = (playerId: number) => {
    setRotating(r => ({ ...r, [playerId]: true }));
    setMoving(m => ({ ...m, [playerId]: false }));
  };

  // Klavye kontrolleri: bilgisayar için dönme ve hareket mantığı
  useEffect(() => {
    if (deviceType !== 'computer') return;
    const keyMap: { [key: string]: { playerId: number; action: 'move' | 'fire' } } = {
      'w': { playerId: 1, action: 'move' },
      'e': { playerId: 1, action: 'fire' },
      't': { playerId: 2, action: 'move' },
      'y': { playerId: 2, action: 'fire' },
      'i': { playerId: 3, action: 'move' },
      'o': { playerId: 3, action: 'fire' },
      'up': { playerId: 4, action: 'move' },
      'shift': { playerId: 4, action: 'fire' }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = keyMap[key];
      if (mapped) {
        if (mapped.action === 'move') {
          setRotating(r => ({ ...r, [mapped.playerId]: false }));
          setMoving(m => ({ ...m, [mapped.playerId]: true }));
        } else if (mapped.action === 'fire') {
          handleCornerButtonClick(mapped.playerId);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = keyMap[key];
      if (mapped && mapped.action === 'move') {
        setRotating(r => ({ ...r, [mapped.playerId]: true }));
        setMoving(m => ({ ...m, [mapped.playerId]: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [deviceType]);

  // Buton simgesi tank olsun, yoksa simgesiz bırak
  const TankButtonIcon = () => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="20" height="8" rx="3" fill="#333" />
      <rect x="24" y="11" width="8" height="2" rx="1" fill="#333" />
      <circle cx="10" cy="20" r="3" fill="#333" />
      <circle cx="20" cy="20" r="3" fill="#333" />
    </svg>
  );

  // Oyun yeniden başlatma fonksiyonu
  const handleRestart = () => {
    setWinner(null);
    setCountdown(3);
    setGameStarted(false);
    setPlayers(prevPlayers => prevPlayers.map(p => ({
      ...p,
      health: 3,
      alive: true
    })));
    setBullets([]);
  };

  return (
    <GameArea>
      {countdown !== null && (
        <CountdownOverlay>
          <CountdownText>
            {countdown === 0 ? 'Başla!' : countdown}
          </CountdownText>
        </CountdownOverlay>
      )}
      {winner !== null && (
        <WinOverlay>
          <WinText>Kazanan: Oyuncu {winner}</WinText>
          <ScoreTable>
            {players.map(p => (
              <div key={p.id} style={{ color: playerColors[p.id as 1 | 2 | 3 | 4] }}>
                Oyuncu {p.id}: {p.score} puan
              </div>
            ))}
          </ScoreTable>
          <button style={{ marginTop: 32, fontSize: 24, padding: '12px 32px', borderRadius: 8, border: 'none', background: '#fff', color: '#222', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleRestart}>
            Tekrar Oyna
          </button>
        </WinOverlay>
      )}
      <GameGrid />
      {/* Duvarlar */}
      {walls.map((w, i) => (
        <Wall key={i} style={{ left: w.x, top: w.y, width: w.w, height: w.h }} />
      ))}
      {players.map(player => (
        <React.Fragment key={player.id}>
          <HealthBar 
            health={player.health}
            color={playerColors[player.id as 1 | 2 | 3 | 4]}
            style={{
              left: player.position.x + 10,
              top: player.position.y - 10
            }}
          />
          <Tank
            color={playerColors[player.id as 1 | 2 | 3 | 4]}
            rotation={player.rotation}
            position={player.position}
            isMoving={player.isMoving}
            size={tankSize}
          />
        </React.Fragment>
      ))}
      {/* Duman Efekti */}
      {smoke.map(s => (
        <Smoke key={s.id} size={s.size} opacity={s.opacity} style={{ left: s.x, top: s.y }} />
      ))}
      {/* Mermiler */}
      {bullets.map(bullet => (
        <Bullet
          key={bullet.id}
          size={BULLET_SIZE}
          style={{
            left: bullet.position.x,
            top: bullet.position.y
          }}
        />
      ))}
      {deviceType === 'phone' && players.map((player, idx) => (
        <CornerButton
          key={player.id}
          color={playerColors[player.id as 1 | 2 | 3 | 4]}
          position={cornerPositions[idx]}
          onClick={() => handleCornerButtonClick(player.id)}
          onTouchStart={() => handleCornerButtonDown(player.id)}
          onTouchEnd={() => handleCornerButtonUp(player.id)}
          onMouseDown={() => handleCornerButtonDown(player.id)}
          onMouseUp={() => handleCornerButtonUp(player.id)}
          onMouseLeave={() => handleCornerButtonUp(player.id)}
        >
          <TankButtonIcon />
        </CornerButton>
      ))}
    </GameArea>
  );
};

export default TankGame; 