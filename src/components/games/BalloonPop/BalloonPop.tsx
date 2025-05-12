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

const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const pop = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
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

const GameArea = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin: 1rem 0;
  overflow: hidden;
  user-select: none;
  touch-action: none;
  cursor: crosshair;
`;

const Balloon = styled.div<{ 
  x: number, 
  y: number, 
  size: number, 
  color: string,
  speed: number,
  popped: boolean
}>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size * 1.2}px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, ${props => `${props.color}cc`}, ${props => props.color});
  left: ${props => props.x}px;
  bottom: ${props => props.y}px;
  cursor: pointer;
  transform-origin: center bottom;
  
  &:before {
    content: '';
    position: absolute;
    width: 8px;
    height: 15px;
    background: rgba(255,255,255,0.5);
    border-radius: 50%;
    top: 25%;
    left: 25%;
    transform: rotate(-30deg);
  }
  
  &:after {
    content: '';
    position: absolute;
    width: 10px;
    height: 20px;
    background: #ddd;
    bottom: -18px;
    left: calc(50% - 5px);
    border-radius: 0 0 5px 5px;
  }
  
  animation: ${props => props.popped ? pop : css`${float} ${props.speed}s infinite`};
  animation-duration: ${props => props.popped ? '0.3s' : `${props.speed}s`};
  animation-fill-mode: ${props => props.popped ? 'forwards' : 'none'};
  opacity: ${props => props.popped ? 0 : 1};
  pointer-events: ${props => props.popped ? 'none' : 'auto'};
`;

const BalloonSplash = styled.div<{ x: number, y: number, color: string }>`
  position: absolute;
  width: 40px;
  height: 40px;
  left: ${props => props.x - 20}px;
  top: ${props => props.y - 20}px;
  background: transparent;
  border-radius: 50%;
  z-index: 10;
  
  &:before, &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${props => props.color};
    opacity: 0.7;
    animation: ${pop} 0.5s forwards;
  }
  
  &:after {
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    animation-delay: 0.1s;
  }
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

const Timer = styled.div<{ urgent: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.urgent ? '#e74c3c' : 'white'};
  padding: 5px 15px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const CountText = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  padding: 5px 15px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin: 10px 0;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const StatText = styled.div`
  color: white;
  font-size: 1.2rem;
  margin: 5px 0;
`;

const StatValue = styled.span<{ highlight?: boolean }>`
  font-weight: bold;
  color: ${props => props.highlight ? '#f1c40f' : 'white'};
`;

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

// Balon renkleri
const BALLOON_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', 
  '#e67e22', '#1abc9c', '#d35400', '#c0392b', '#16a085'
];

// Balon tipleri için sabitler
const BALLOON_TYPES = {
  NORMAL: 'normal',
  BONUS: 'bonus',
  PENALTY: 'penalty',
  MOVING: 'moving',
  SHRINKING: 'shrinking'
};

interface Player {
  id: number;
  score: number;
  balloonCount: number;
  accuracy: number;
  clicks: number;
  comboCount: number; // Arka arkaya balonları patlatma sayısı
  maxCombo: number; // En yüksek arka arkaya balon patlatma sayısı
  penalties: number; // Ceza balonlarına tıklama sayısı
}

interface BalloonObject {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  popped: boolean;
  points: number;
  type: string;
  moveSpeed?: number;
  moveDirection?: number;
  shrinkRate?: number;
  expiryTime?: number;
}

interface SplashEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ComboEffect {
  id: number;
  x: number;
  y: number;
  comboCount: number;
}

// Yeni bileşenler
const BonusBalloon = styled(Balloon)`
  background: radial-gradient(circle at 30% 30%, ${props => `${props.color}dd`}, ${props => props.color});
  box-shadow: 0 0 15px ${props => props.color}, 0 0 30px white;
  border: 2px dashed gold;
`;

const PenaltyBalloon = styled(Balloon)`
  background: radial-gradient(circle at 30% 30%, #000000aa, ${props => props.color});
  &:before {
    background: rgba(0,0,0,0.3);
  }
`;

const ShrinkingBalloon = styled(Balloon)<{ shrinkAmount: number }>`
  transform: scale(${props => 1 - props.shrinkAmount});
  transition: transform 0.1s linear;
`;

const ComboDisplay = styled.div<{ count: number }>`
  position: absolute;
  left: 20px;
  bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  padding: 8px 15px;
  border-radius: 10px;
  background: ${props => props.count > 5 ? '#e74c3c' : props.count > 3 ? '#f39c12' : 'rgba(0, 0, 0, 0.5)'};
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  z-index: 10;
  transition: all 0.3s ease;
`;

const ComboTextEffect = styled.div<{ x: number, y: number, count: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  font-size: ${props => 1 + Math.min(props.count * 0.1, 0.6)}rem;
  font-weight: bold;
  color: ${props => props.count > 10 ? 'gold' : props.count > 5 ? '#f39c12' : 'white'};
  text-shadow: 0 0 5px rgba(0,0,0,0.7);
  animation: float-up 1s forwards;
  z-index: 20;
  
  @keyframes float-up {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
  }
`;

const LevelDisplay = styled.div`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  padding: 8px 15px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const BalloonPop: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      balloonCount: 0,
      accuracy: 0,
      clicks: 0,
      comboCount: 0,
      maxCombo: 0,
      penalties: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(1);
  const [balloons, setBalloons] = useState<BalloonObject[]>([]);
  const [splashEffects, setSplashEffects] = useState<SplashEffect[]>([]);
  const [comboEffects, setComboEffects] = useState<ComboEffect[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [clicks, setClicks] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const balloonIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const totalRounds = playerCount; // Her oyuncu 1 kez oynasın
  
  // Oyunu başlat
  const startRound = () => {
    setBalloons([]);
    setSplashEffects([]);
    setComboEffects([]);
    setTimeLeft(30);
    setClicks(0);
    setCombo(0);
    setLevel(1);
    setPhase('playing');
    
    // Balon oluşturmaya başla
    startBalloonGeneration();
    
    // Zamanlayıcıyı başlat
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Süre doldu
          endRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Seviye sistemi - her 10 saniyede zorluk artsın
    const levelInterval = setInterval(() => {
      if (phase === 'playing') {
        setLevel(prev => Math.min(prev + 1, 5));
      }
    }, 10000);
    
    return () => {
      clearInterval(levelInterval);
    };
  };

  // Balon oluşturmaya başla
  const startBalloonGeneration = () => {
    if (balloonIntervalRef.current) {
      clearInterval(balloonIntervalRef.current);
    }
    
    // Oyun alanında balonları hareket ettirmek için animasyon
    const updateBalloons = () => {
      setBalloons(prev => {
        return prev.map(balloon => {
          if (balloon.popped) return balloon;
          
          // Hareket eden balonlar için yeni x pozisyonu hesapla
          if (balloon.type === BALLOON_TYPES.MOVING && balloon.moveSpeed && balloon.moveDirection) {
            const gameWidth = gameAreaRef.current?.clientWidth || 800;
            let newX = balloon.x + (balloon.moveSpeed * balloon.moveDirection);
            
            // Kenarlara çarpınca yön değiştir
            if (newX < 0 || newX > gameWidth - balloon.size) {
              balloon.moveDirection *= -1;
              newX = balloon.x + (balloon.moveSpeed * balloon.moveDirection);
            }
            
            return {
              ...balloon,
              x: newX
            };
          }
          
          // Küçülen balonlar
          if (balloon.type === BALLOON_TYPES.SHRINKING && balloon.shrinkRate) {
            const newSize = balloon.size - balloon.shrinkRate;
            
            // Tamamen küçülmüşse kaldır
            if (newSize <= 10) {
              return {
                ...balloon,
                popped: true
              };
            }
            
            return {
              ...balloon,
              size: newSize
            };
          }
          
          // Süreli balonlar
          if (balloon.expiryTime && Date.now() > balloon.expiryTime) {
            return {
              ...balloon,
              popped: true
            };
          }
          
          return balloon;
        }).filter(b => !b.popped || Date.now() - b.id < 500);
      });
      
      animationRef.current = requestAnimationFrame(updateBalloons);
    };
    
    updateBalloons();
    
    // Balon üretme hızı seviyeye göre değişsin
    const getBalloonInterval = () => {
      switch(level) {
        case 1: return 900;
        case 2: return 800;
        case 3: return 650;
        case 4: return 500;
        case 5: return 350;
        default: return 800;
      }
    };
    
    // Balonları düzenli olarak ekle
    balloonIntervalRef.current = setInterval(() => {
      if (phase === 'playing') {
        addRandomBalloon();
        
        // Seviye bazlı interval ayarla
        clearInterval(balloonIntervalRef.current!);
        balloonIntervalRef.current = setInterval(() => {
          if (phase === 'playing') {
            addRandomBalloon();
          }
        }, getBalloonInterval());
      }
    }, getBalloonInterval());
  };
  
  // Rastgele balon ekle
  const addRandomBalloon = () => {
    if (!gameAreaRef.current || phase !== 'playing') return;
    
    const gameWidth = gameAreaRef.current.clientWidth;
    const gameHeight = gameAreaRef.current.clientHeight;
    
    // Balon boyutu - seviyeye göre küçülsün
    const getSize = () => {
      const baseSize = 60;
      return baseSize - (level * 3);
    };
    
    // Balon tipi seçimi - seviyeye göre farklı olasılıklar
    const getBalloonType = () => {
      const rand = Math.random() * 100;
      
      if (level >= 3 && rand < 5) return BALLOON_TYPES.PENALTY;
      if (level >= 2 && rand < 10 + (level * 2)) return BALLOON_TYPES.MOVING;
      if (level >= 2 && rand < 15 + (level * 3)) return BALLOON_TYPES.SHRINKING;
      if (rand < 8 + (level * 1.5)) return BALLOON_TYPES.BONUS;
      return BALLOON_TYPES.NORMAL;
    };
    
    const balloonType = getBalloonType();
    const size = getSize();
    const x = Math.random() * (gameWidth - size);
    let y = -size;
    const speed = Math.random() * 2 + 2 - (level * 0.2);
    
    // Balon puanını hesapla
    const getPoints = (type: string) => {
      switch(type) {
        case BALLOON_TYPES.BONUS: return 3;
        case BALLOON_TYPES.PENALTY: return -2;
        case BALLOON_TYPES.MOVING: return 2;
        case BALLOON_TYPES.SHRINKING: return 4;
        default: return 1;
      }
    };
    
    const newBalloon: BalloonObject = {
      id: Date.now(),
      x,
      y,
      size,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      speed,
      popped: false,
      points: getPoints(balloonType),
      type: balloonType
    };
    
    // Özel balon tipine göre ek özellikleri ekle
    if (balloonType === BALLOON_TYPES.MOVING) {
      newBalloon.moveSpeed = 1 + (level * 0.5);
      newBalloon.moveDirection = Math.random() > 0.5 ? 1 : -1;
    }
    
    if (balloonType === BALLOON_TYPES.SHRINKING) {
      newBalloon.shrinkRate = 0.3 + (level * 0.1);
      newBalloon.expiryTime = Date.now() + (4000 - (level * 400));
    }
    
    if (balloonType === BALLOON_TYPES.BONUS) {
      newBalloon.expiryTime = Date.now() + (3000 - (level * 300));
    }
    
    setBalloons(prev => [...prev, newBalloon]);
  };
  
  // Tüm balonları kaldır
  const clearBalloons = () => {
    if (balloonIntervalRef.current) {
      clearInterval(balloonIntervalRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setBalloons([]);
  };
  
  // Balon patlatma işlemi
  const handleBalloonPop = (balloonId: number, event: React.MouseEvent) => {
    if (phase !== 'playing') return;
    
    // Tıklanılan balonu bul
    const balloon = balloons.find(b => b.id === balloonId);
    if (!balloon || balloon.popped) return;
    
    // Tıklama efekti oluştur
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Patlama efekti ekle
    setSplashEffects(prev => [...prev, {
      id: Date.now(),
      x,
      y,
      color: balloon.color
    }]);
    
    // Balonu patlat
    setBalloons(prev => prev.map(b => 
      b.id === balloonId ? { ...b, popped: true } : b
    ));
    
    // Combo sistemi
    let comboUpdated = balloon.type === BALLOON_TYPES.PENALTY ? 0 : combo + 1;
    setCombo(comboUpdated);
    
    if (comboUpdated >= 3) {
      setComboEffects(prev => [...prev, {
        id: Date.now(),
        x: balloon.x + balloon.size / 2,
        y: balloon.y + balloon.size / 2,
        comboCount: comboUpdated
      }]);
    }
    
    // Oyuncunun skorunu güncelle
    setPlayers(prev => {
      return prev.map((player, index) => {
        if (index === activePlayer) {
          // Combo çarpanını hesapla
          const comboMultiplier = comboUpdated >= 10 ? 3 : 
                                  comboUpdated >= 5 ? 2 : 
                                  comboUpdated >= 3 ? 1.5 : 1;
          
          // Puan hesapla
          const points = Math.round(balloon.points * comboMultiplier);
          
          // İstatistikleri güncelle
          return {
            ...player,
            score: Math.max(0, player.score + points),
            balloonCount: balloon.points > 0 ? player.balloonCount + 1 : player.balloonCount,
            comboCount: comboUpdated,
            maxCombo: Math.max(player.maxCombo, comboUpdated),
            penalties: balloon.type === BALLOON_TYPES.PENALTY ? player.penalties + 1 : player.penalties
          };
        }
        return player;
      });
    });
    
    // Efektleri temizle
    setTimeout(() => {
      setSplashEffects(prev => prev.filter(effect => Date.now() - effect.id < 300));
      setComboEffects(prev => prev.filter(effect => Date.now() - effect.id < 1000));
    }, 1000);
  };
  
  // Oyun alanına tıklama
  const handleGameAreaClick = (event: React.MouseEvent) => {
    if (phase !== 'playing') return;
    
    setClicks(prev => prev + 1);
    setCombo(0); // Boşluğa tıklanınca comboyu sıfırla
    
    setPlayers(prev => {
      return prev.map((player, index) => {
        if (index === activePlayer) {
          return {
            ...player,
            clicks: player.clicks + 1
          };
        }
        return player;
      });
    });
  };
  
  // Turu sonlandır
  const endRound = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    clearBalloons();
    
    // İsabet oranını hesapla
    setPlayers(prev => {
      return prev.map((player, index) => {
        if (index === activePlayer) {
          const accuracy = player.clicks > 0 
            ? Math.round((player.balloonCount / player.clicks) * 100) 
            : 0;
          
          return {
            ...player,
            accuracy
          };
        }
        return player;
      });
    });
    
    setPhase('result');
  };
  
  // Oyundan çıkınca timer ve animasyonları temizle
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (balloonIntervalRef.current) {
        clearInterval(balloonIntervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Bir sonraki aşamaya geç
  const nextStep = () => {
    if (phase === 'ready') {
      startRound();
    } else if (phase === 'result') {
      // Sonraki tura veya oyuna geç
      const newRound = round + 1;
      
      if (newRound > totalRounds) {
        setPhase('end');
      } else {
        setRound(newRound);
        setActivePlayer((activePlayer + 1) % playerCount);
        setPhase('ready');
      }
    }
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
  
  // En yüksek doğruluk oranını bul
  const getHighestAccuracy = () => {
    return players.reduce((highest, player) => 
      player.accuracy > highest.accuracy ? player : highest, players[0]);
  };
  
  // En çok balon patlatanı bul
  const getMostBalloons = () => {
    return players.reduce((highest, player) => 
      player.balloonCount > highest.balloonCount ? player : highest, players[0]);
  };

  // En yüksek combo yapanı bul
  const getHighestCombo = () => {
    return players.reduce((highest, player) => 
      player.maxCombo > highest.maxCombo ? player : highest, players[0]);
  };
  
  // Balon tipine göre render et
  const renderBalloon = (balloon: BalloonObject) => {
    switch(balloon.type) {
      case BALLOON_TYPES.BONUS:
        return (
          <BonusBalloon
            key={balloon.id}
            x={balloon.x}
            y={balloon.y}
            size={balloon.size}
            color="#ffcd29"
            speed={balloon.speed}
            popped={balloon.popped}
            onClick={(e) => handleBalloonPop(balloon.id, e)}
          />
        );
      case BALLOON_TYPES.PENALTY:
        return (
          <PenaltyBalloon
            key={balloon.id}
            x={balloon.x}
            y={balloon.y}
            size={balloon.size}
            color="#222222"
            speed={balloon.speed}
            popped={balloon.popped}
            onClick={(e) => handleBalloonPop(balloon.id, e)}
          />
        );
      case BALLOON_TYPES.SHRINKING:
        return (
          <ShrinkingBalloon
            key={balloon.id}
            x={balloon.x}
            y={balloon.y}
            size={balloon.size}
            color="#8e44ad"
            speed={balloon.speed}
            popped={balloon.popped}
            shrinkAmount={(balloon.shrinkRate || 0) / 20}
            onClick={(e) => handleBalloonPop(balloon.id, e)}
          />
        );
      default:
        return (
          <Balloon
            key={balloon.id}
            x={balloon.x}
            y={balloon.y}
            size={balloon.size}
            color={balloon.color}
            speed={balloon.speed}
            popped={balloon.popped}
            onClick={(e) => handleBalloonPop(balloon.id, e)}
          />
        );
    }
  };
  
  return (
    <GameContainer>
      <Header>Balon Patlatma</Header>
      
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
          <p style={{ color: 'white', textAlign: 'center' }}>
            Balonları patlatarak puan kazan! Her renk ve tür balonun puanı farklıdır.<br/>
            Arka arkaya balonları patlatırsanız combo puanı kazanırsınız!<br/>
            Siyah balonlardan uzak dur, onlar ceza balonu!
          </p>
          <NextButton onClick={nextStep}>Hazırım</NextButton>
        </>
      )}
      
      {phase === 'playing' && (
        <GameArea ref={gameAreaRef} onClick={handleGameAreaClick}>
          <Timer urgent={timeLeft <= 10}>
            {timeLeft}
          </Timer>
          
          <CountText>
            Balonlar: {players[activePlayer].balloonCount}
          </CountText>
          
          <LevelDisplay>
            Seviye: {level}
          </LevelDisplay>
          
          <ComboDisplay count={combo}>
            Combo: {combo}x
          </ComboDisplay>
          
          {balloons.map(balloon => renderBalloon(balloon))}
          
          {splashEffects.map(effect => (
            <BalloonSplash 
              key={effect.id}
              x={effect.x}
              y={effect.y}
              color={effect.color}
            />
          ))}
          
          {comboEffects.map(effect => (
            <ComboTextEffect
              key={effect.id}
              x={effect.x}
              y={effect.y}
              count={effect.comboCount}
            >
              {effect.comboCount}x Combo!
            </ComboTextEffect>
          ))}
        </GameArea>
      )}
      
      {phase === 'result' && (
        <>
          <InfoText>
            Tur sona erdi! Oyuncu {activePlayer + 1}'in sonuçları:
          </InfoText>
          
          <ResultCard>
            <StatText>
              Patlatılan Balon: <StatValue>{players[activePlayer].balloonCount}</StatValue>
            </StatText>
            <StatText>
              İsabet Oranı: <StatValue>{players[activePlayer].accuracy}%</StatValue>
            </StatText>
            <StatText>
              En Yüksek Combo: <StatValue highlight={players[activePlayer].maxCombo >= 5}>{players[activePlayer].maxCombo}x</StatValue>
            </StatText>
            <StatText>
              Ceza Balonları: <StatValue>{players[activePlayer].penalties}</StatValue>
            </StatText>
            <StatText>
              Toplam Puan: <StatValue highlight>{players[activePlayer].score}</StatValue>
            </StatText>
          </ResultCard>
          
          <NextButton onClick={nextStep}>
            {round < totalRounds ? 'Sonraki Oyuncu' : 'Sonuçları Gör'}
          </NextButton>
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
          
          <ResultCard>
            <StatText>
              En Yüksek Puan: <StatValue highlight>{getWinner().score}</StatValue>
            </StatText>
            <StatText>
              En Çok Balon Patlatan: <StatValue>Oyuncu {getMostBalloons().id + 1} ({getMostBalloons().balloonCount})</StatValue>
            </StatText>
            <StatText>
              En İyi İsabet Oranı: <StatValue>Oyuncu {getHighestAccuracy().id + 1} (%{getHighestAccuracy().accuracy})</StatValue>
            </StatText>
            <StatText>
              En Yüksek Combo: <StatValue>Oyuncu {getHighestCombo().id + 1} ({getHighestCombo().maxCombo}x)</StatValue>
            </StatText>
          </ResultCard>
          
          <NextButton onClick={() => window.location.reload()}>
            Ana Menüye Dön
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default BalloonPop; 