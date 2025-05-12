import React, { useState, useEffect, useRef } from 'react';
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

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 10px;
  position: relative;
  overflow: hidden;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 0.5rem 0 1rem;
  padding: 8px 20px;
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

const GameArea = styled.div`
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 500px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  margin: 0;
  cursor: none;
`;

const InfoText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin: 0.5rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 8px 20px;
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

const TargetDisplay = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  flex-wrap: wrap;
`;

const TargetItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(45deg, #3498db, #9b59b6);
  padding: 5px 10px;
  border-radius: 8px;
  margin: 5px;
`;

const TargetIcon = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
`;

const TargetCount = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: white;
`;

const Timer = styled.div<{ urgent?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  padding: 5px 15px;
  border-radius: 10px;
  background: ${props => props.urgent ? '#e74c3c' : '#3498db'};
  z-index: 10;
`;

// Düşen şekil stili
const createFallingAnimation = (startX: number, endX: number, duration: number) => keyframes`
  0% { transform: translate(${startX}px, -50px); }
  100% { transform: translate(${endX}px, calc(100vh - 250px)); }
`;

// El yakalayıcı SVG'sini ekle
const HandCatcher = styled.div<{ x: number, y: number, color: string }>`
  position: absolute;
  left: ${props => props.x - 30}px;
  top: ${props => props.y - 35}px;
  width: 60px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 5;
  transform: rotate(0deg);
`;

const ShapeContainer = styled.div<{ 
  startX: number, 
  endX: number, 
  duration: number,
  paused: boolean,
  color: string,
  caught: boolean,
  top: number
}>`
  position: absolute;
  top: ${props => props.top}px;
  left: 0;
  width: 50px;
  height: 50px;
  display: ${props => props.caught ? 'none' : 'flex'};
  justify-content: center;
  align-items: center;
  animation: ${props => createFallingAnimation(props.startX, props.endX, props.duration)} ${props => props.duration}s linear forwards;
  animation-play-state: ${props => props.paused ? 'paused' : 'running'};
  pointer-events: auto;
  z-index: 3;
  cursor: pointer;
  
  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.color};
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }
`;

// Yakalayıcı bileşenlerini değiştir
const CatcherContainer = styled.div`
  display: none;
`;

const CatcherInner = styled.div`
  display: none;
`;

const CatchEffect = styled.div<{ x: number, y: number, color: string }>`
  position: absolute;
  left: ${props => props.x - 30}px;
  top: ${props => props.y - 30}px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.color}88;
  pointer-events: none;
  animation: ${pulse} 0.3s ease-out forwards;
  z-index: 4;
`;

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const SHAPES = [
  {
    name: 'Kare',
    svg: <svg viewBox="0 0 24 24"><rect width="24" height="24" /></svg>
  },
  {
    name: 'Daire',
    svg: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" /></svg>
  },
  {
    name: 'Üçgen',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 24,24 0,24" /></svg>
  },
  {
    name: 'Yıldız',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 15,9 24,9 17,15 20,24 12,18 4,24 7,15 0,9 9,9" /></svg>
  },
  {
    name: 'Kalp',
    svg: <svg viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>
  },
  {
    name: 'Altıgen',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 23,6 23,18 12,24 1,18 1,6" /></svg>
  }
];

interface Player {
  id: number;
  score: number;
  shapesCollected: Record<string, number>; // Her şekilden ne kadar toplandığı
}

interface ActiveShape {
  id: number;
  shape: typeof SHAPES[0];
  startX: number;
  endX: number;
  speed: number;
  y: number; // Şu anki y pozisyonu
  caught: boolean;
  color: string;
  timestamp: number; // Oluşturulma zamanı
}

interface TargetRequirement {
  shape: typeof SHAPES[0];
  count: number;
}

interface CatchEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

const ShapeDrop: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      shapesCollected: {} 
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(0);
  const [targets, setTargets] = useState<TargetRequirement[]>([]);
  const [activeShapes, setActiveShapes] = useState<ActiveShape[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gamePaused, setGamePaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 saniye süre
  const [catchEffects, setCatchEffects] = useState<CatchEffect[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shapeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalRounds = playerCount; // Her oyuncu 1 tur oynasın
  
  // Fare pozisyonunu izleme
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'playing' || gamePaused) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };
  
  // Yeni hedefler oluştur
  const generateTargets = () => {
    const newTargets: TargetRequirement[] = [];
    const shapesCount = Math.floor(Math.random() * 2) + 3; // 3-4 farklı şekil
    
    // Şekilleri rastgele seç
    const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, shapesCount);
    
    // Her şekil için hedef sayı belirle (5-15 arası)
    selectedShapes.forEach(shape => {
      newTargets.push({
        shape,
        count: Math.floor(Math.random() * 6) + 5
      });
    });
    
    setTargets(newTargets);
  };
  
  // Turu başlat
  const startRound = () => {
    // Yeni hedefler oluştur
    generateTargets();
    
    // Başlangıç değerlerini sıfırla
    setActiveShapes([]);
    setTimeLeft(30);
    setPhase('playing');
    
    // Aktif oyuncunun topladığı şekilleri sıfırla
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { ...p, shapesCollected: {} };
      }
      return p;
    }));
    
    // Düzenli aralıklarla şekil düşürmeye başla
    if (shapeIntervalRef.current) {
      clearInterval(shapeIntervalRef.current);
    }
    
    shapeIntervalRef.current = setInterval(() => {
      if (gamePaused) return;
      
      // Rastgele şekil ekle
      addRandomShape();
    }, 700); // Her 700ms'de bir yeni şekil (biraz daha yavaş)
  };
  
  // Rastgele şekil oluşturma
  const addRandomShape = () => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const gameWidth = gameArea.clientWidth;
    
    // Rastgele bir şekil seç
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    
    // Başlangıç X pozisyonu
    const startX = Math.random() * (gameWidth - 50);
    
    // Rastgele bir hız belirle (2-6 saniye)
    const speed = Math.random() * 2 + 2;
    
    // Yeni şekil oluştur
    const newShape: ActiveShape = {
      id: Date.now() + Math.random(),
      shape,
      startX,
      endX: startX, // Düz düşsün, endX = startX
      speed,
      y: 0,
      caught: false,
      color: targets.some(t => t.shape.name === shape.name) 
        ? '#FFD700' // Hedef şekiller altın renkli
        : '#FFFFFF', // Diğerleri beyaz
      timestamp: Date.now()
    };
    
    setActiveShapes(prev => [...prev, newShape]);
  };
  
  // Şekillerin pozisyonunu güncelle
  useEffect(() => {
    if (phase !== 'playing' || gamePaused) return;
    
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const gameHeight = gameArea.clientHeight;
    
    const animationInterval = setInterval(() => {
      const currentTime = Date.now();
      
      setActiveShapes(prev => {
        const updated = prev.map(shape => {
          if (shape.caught) return shape;
          
          // Geçen süreyi hesapla
          const elapsedTime = (currentTime - shape.timestamp) / 1000;
          const progress = Math.min(1, elapsedTime / shape.speed);
          
          // Mevcut Y pozisyonunu hesapla
          const yPos = progress * (gameHeight + 100) - 50;
          
          // Ekranın dışına çıktıysa kaldır
          if (yPos > gameHeight && !shape.caught) {
            return { ...shape, caught: true };
          }
          
          return { ...shape, y: yPos };
        });
        
        // 5 saniyeden eski yakalanmış şekilleri temizle
        return updated.filter(shape => {
          const age = (currentTime - shape.timestamp) / 1000;
          return !shape.caught || age < 5;
        });
      });
      
      // Hedef tamamlandı mı kontrol et
      const currentPlayer = players[activePlayer];
      let allTargetsCompleted = true;
      
      targets.forEach(target => {
        const collected = currentPlayer.shapesCollected[target.shape.name] || 0;
        if (collected < target.count) {
          allTargetsCompleted = false;
        }
      });
      
      if (allTargetsCompleted) {
        // Bonus puan ekle ve turu bitir
        setPlayers(prev => prev.map((p, i) => {
          if (i === activePlayer) {
            return { ...p, score: p.score + 10 }; // Hedefleri tamamlama bonusu
          }
          return p;
        }));
        
        // Turu erken bitir
        clearInterval(animationInterval);
        // endRound fonksiyonunu doğrudan çağırmak yerine phase'i değiştiriyoruz
        setPhase('result');
        setGamePaused(true);
      }
      
    }, 16); // Yaklaşık 60 FPS
    
    return () => clearInterval(animationInterval);
  }, [phase, gamePaused, activePlayer, players, targets]);
  
  // Zamanı takip et
  useEffect(() => {
    if (phase !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Süre doldu
          endRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phase]);
  
  // Tur sonu kontrolü
  const endRound = () => {
    if (shapeIntervalRef.current) {
      clearInterval(shapeIntervalRef.current);
      shapeIntervalRef.current = null;
    }
    
    setGamePaused(true);
    setPhase('result');
    
    // 3 saniye sonra sonraki aşama
    setTimeout(() => {
      const newRound = round + 1;
      setRound(newRound);
      
      if (newRound >= totalRounds) {
        setPhase('end');
      } else {
        setActivePlayer((activePlayer + 1) % playerCount);
        setPhase('ready');
        setGamePaused(false);
      }
    }, 3000);
  };
  
  // Temizlik işlemleri
  useEffect(() => {
    return () => {
      if (shapeIntervalRef.current) {
        clearInterval(shapeIntervalRef.current);
      }
    };
  }, []);
  
  // Kazananı bul
  const winner = players.reduce(
    (max, p) => p.score > max.score ? p : max, 
    players[0]
  );
  
  // Beraberlik durumu
  const isTie = players.filter(p => p.score === winner.score).length > 1;
  
  // Hedef ilerleme hesapla
  const calculateProgress = (shapeName: string) => {
    const target = targets.find(t => t.shape.name === shapeName);
    if (!target) return { collected: 0, target: 0, percent: 0 };
    
    const collected = players[activePlayer].shapesCollected[shapeName] || 0;
    const percent = Math.min(100, (collected / target.count) * 100);
    
    return { collected, target: target.count, percent };
  };
  
  // Şekile tıklama olayını işle
  const handleShapeClick = (shapeId: number) => {
    if (phase !== 'playing' || gamePaused) return;
    
    // Tıklanan şekli bul
    const clickedShape = activeShapes.find(shape => shape.id === shapeId);
    if (!clickedShape || clickedShape.caught) return;
    
    // Şekli yakalandı olarak işaretle
    setActiveShapes(prev => prev.map(shape => 
      shape.id === shapeId ? { ...shape, caught: true } : shape
    ));
    
    // Yakalama efekti ekle
    setCatchEffects(prev => [...prev, {
      id: Date.now() + Math.random(),
      x: clickedShape.startX + 25, // Şeklin ortası
      y: clickedShape.y + 25, // Güncel Y pozisyonu kullan
      color: clickedShape.color
    }]);
    
    // 500ms sonra efekti kaldır
    setTimeout(() => {
      setCatchEffects(prev => prev.filter(effect => effect.id !== Date.now() + Math.random()));
    }, 500);
    
    // Hedef şekil mi kontrol et
    const targetShape = targets.find(t => t.shape.name === clickedShape.shape.name);
    if (targetShape) {
      // Oyuncunun topladığı şekilleri güncelle
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          const updatedShapesCollected = { ...p.shapesCollected };
          updatedShapesCollected[clickedShape.shape.name] = (updatedShapesCollected[clickedShape.shape.name] || 0) + 1;
          
          return { 
            ...p, 
            shapesCollected: updatedShapesCollected,
            score: p.score + 1 // Her yakalanan hedef şekil için 1 puan
          };
        }
        return p;
      }));
    }
  };
  
  return (
    <GameContainer>
      <Header>Şekil Yakalama</Header>
      
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
          <NextButton onClick={startRound}>Hazırım</NextButton>
        </>
      )}
      
      {(phase === 'playing' || phase === 'result') && (
        <>
          <InfoText>
            {phase === 'playing' 
              ? `Hedef şekilleri yakala!` 
              : `Süre doldu! Yakalalanlar: ${Object.values(players[activePlayer].shapesCollected).reduce((a, b) => a + b, 0)}`
            }
          </InfoText>
          
          <TargetDisplay>
            {targets.map((target, i) => {
              const progress = calculateProgress(target.shape.name);
              return (
                <TargetItem key={i}>
                  <TargetIcon>{target.shape.svg}</TargetIcon>
                  <TargetCount>{progress.collected}/{target.count}</TargetCount>
                </TargetItem>
              );
            })}
          </TargetDisplay>
          
          <GameArea 
            ref={gameAreaRef}
            onMouseMove={handleMouseMove}
          >
            {phase === 'playing' && (
              <Timer urgent={timeLeft <= 5}>
                {timeLeft}
              </Timer>
            )}
            
            {activeShapes.map(shape => (
              <ShapeContainer
                key={shape.id}
                startX={shape.startX}
                endX={shape.endX}
                duration={shape.speed}
                paused={gamePaused}
                color={shape.color}
                caught={shape.caught}
                onClick={() => handleShapeClick(shape.id)}
                top={shape.y || 0}
              >
                {shape.shape.svg}
              </ShapeContainer>
            ))}
            
            {catchEffects.map(effect => (
              <CatchEffect 
                key={effect.id}
                x={effect.x}
                y={effect.y}
                color={effect.color}
              />
            ))}
            
            {phase === 'playing' && (
              <HandCatcher
                x={mousePosition.x} 
                y={mousePosition.y}
                color={PLAYER_COLORS[activePlayer]}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={PLAYER_COLORS[activePlayer]} strokeWidth="2">
                  <path d="M6,12.5 v-2 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v-4 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v0 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v4 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v6 c0,4.4-3.6,8-8,8 h-2 c-2.8,0-5.5-1.5-7-4 l-3-5" 
                   fill="rgba(255,255,255,0.2)" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </HandCatcher>
            )}
          </GameArea>
        </>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            {isTie 
              ? 'Oyun Bitti! Beraberlik!' 
              : `Oyun Bitti! Kazanan: Oyuncu ${winner.id + 1}`
            }
          </InfoText>
          <ScoreBoard>
            {players.map((player, index) => (
              <PlayerScore 
                key={player.id} 
                color={PLAYER_COLORS[index]}
                active={player.id === winner.id && !isTie}
              >
                Oyuncu {index + 1}: {player.score}
              </PlayerScore>
            ))}
          </ScoreBoard>
          <NextButton onClick={() => window.location.reload()}>
            Tekrar Oyna
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default ShapeDrop; 