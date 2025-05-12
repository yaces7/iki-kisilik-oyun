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

interface Player {
  id: number;
  score: number;
  balloonCount: number;
  accuracy: number;
  clicks: number;
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
}

interface SplashEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

const BalloonPop: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      balloonCount: 0,
      accuracy: 0,
      clicks: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(1);
  const [balloons, setBalloons] = useState<BalloonObject[]>([]);
  const [splashEffects, setSplashEffects] = useState<SplashEffect[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [clicks, setClicks] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const balloonIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const totalRounds = playerCount; // Her oyuncu 1 kez oynasın
  
  // Oyunu başlat
  const startRound = () => {
    setBalloons([]);
    setSplashEffects([]);
    setTimeLeft(30);
    setClicks(0);
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
  };
  
  // Balon oluşturmaya başla
  const startBalloonGeneration = () => {
    if (balloonIntervalRef.current) {
      clearInterval(balloonIntervalRef.current);
    }
    
    balloonIntervalRef.current = setInterval(() => {
      addRandomBalloon();
    }, 800); // Her 800ms'de bir yeni balon
  };
  
  // Rastgele balon ekle
  const addRandomBalloon = () => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const gameWidth = gameArea.clientWidth;
    const gameHeight = gameArea.clientHeight;
    
    // Rastgele boyut (40-80 piksel)
    const size = Math.floor(Math.random() * 40) + 40;
    
    // Rastgele konum
    const x = Math.random() * (gameWidth - size);
    const y = -size; // Ekranın altından başlasın
    
    // Rastgele hız (3-8 saniye)
    const speed = Math.random() * 5 + 3;
    
    // Rastgele renk
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    
    // Boyuta göre puan (küçük balonlar daha değerli)
    const points = Math.floor(10 + (80 - size) / 4);
    
    // Yeni balon oluştur
    const newBalloon: BalloonObject = {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
      color,
      speed,
      popped: false,
      points
    };
    
    setBalloons(prev => [...prev, newBalloon]);
    
    // Bir süre sonra patlamamış balonları kaldır
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== newBalloon.id || b.popped));
    }, speed * 1000 + 1000);
  };
  
  // Balon patlatma
  const handleBalloonPop = (balloonId: number, event: React.MouseEvent) => {
    // Tıklama sayısını artır
    setClicks(prev => prev + 1);
    
    // Balonun konumunu bul
    const balloon = balloons.find(b => b.id === balloonId);
    if (!balloon) return;
    
    // Splash efektini ekle
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const gameAreaRect = gameAreaRef.current?.getBoundingClientRect();
    
    if (gameAreaRect) {
      const splashX = event.clientX - gameAreaRect.left;
      const splashY = event.clientY - gameAreaRect.top;
      
      setSplashEffects(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: splashX,
        y: splashY,
        color: balloon.color
      }]);
      
      // Efekti bir süre sonra kaldır
      setTimeout(() => {
        setSplashEffects(prev => prev.filter(e => e.id !== (Date.now() + Math.random())));
      }, 500);
    }
    
    // Balonu patlatılmış olarak işaretle
    setBalloons(prev => prev.map(b => 
      b.id === balloonId ? { ...b, popped: true } : b
    ));
    
    // Puanı güncelle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { 
          ...p, 
          score: p.score + balloon.points,
          balloonCount: p.balloonCount + 1
        };
      }
      return p;
    }));
  };
  
  // Oyun alanına tıklama
  const handleGameAreaClick = () => {
    // Boşluğa tıklama
    setClicks(prev => prev + 1);
  };
  
  // Turu sonlandır
  const endRound = () => {
    // Zamanlayıcıları temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (balloonIntervalRef.current) {
      clearInterval(balloonIntervalRef.current);
    }
    
    // Doğruluk oranını hesapla
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        const accuracy = clicks > 0 ? Math.round((p.balloonCount / clicks) * 100) : 0;
        return { 
          ...p, 
          accuracy,
          clicks
        };
      }
      return p;
    }));
    
    // Sonuç aşamasına geç
    setPhase('result');
  };
  
  // Sonraki aşamaya geç
  const nextStep = () => {
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
  
  // Temizlik işlemleri
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (balloonIntervalRef.current) {
        clearInterval(balloonIntervalRef.current);
      }
    };
  }, []);
  
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
  
  // En yüksek doğruluk oranı
  const getHighestAccuracy = () => {
    return players.reduce((highest, player) => 
      player.accuracy > highest.accuracy ? player : highest, players[0]);
  };
  
  // En çok balon patlatan
  const getMostBalloons = () => {
    return players.reduce((highest, player) => 
      player.balloonCount > highest.balloonCount ? player : highest, players[0]);
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
            Ekranda beliren balonları patlatarak puan kazan!
            Küçük balonlar daha değerli, boş alana tıklama ve doğruluk önemli.
          </p>
          <NextButton onClick={startRound}>Hazırım</NextButton>
        </>
      )}
      
      {(phase === 'playing' || phase === 'result') && (
        <GameArea 
          ref={gameAreaRef}
          onClick={handleGameAreaClick}
        >
          {phase === 'playing' && (
            <>
              <Timer urgent={timeLeft <= 5}>
                {timeLeft}
              </Timer>
              
              <CountText>
                Balonlar: {players[activePlayer].balloonCount}
              </CountText>
            </>
          )}
          
          {balloons.filter(b => !b.popped).map(balloon => (
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
          ))}
          
          {splashEffects.map(effect => (
            <BalloonSplash
              key={effect.id}
              x={effect.x}
              y={effect.y}
              color={effect.color}
            />
          ))}
        </GameArea>
      )}
      
      {phase === 'result' && (
        <>
          <InfoText>
            Tur Sonu! Oyuncu {activePlayer + 1}
          </InfoText>
          
          <ResultCard>
            <StatText>
              Toplam Puan: <StatValue highlight>{players[activePlayer].score}</StatValue>
            </StatText>
            <StatText>
              Patlatılan Balon: <StatValue>{players[activePlayer].balloonCount}</StatValue>
            </StatText>
            <StatText>
              Toplam Tıklama: <StatValue>{players[activePlayer].clicks}</StatValue>
            </StatText>
            <StatText>
              Doğruluk Oranı: <StatValue>{players[activePlayer].accuracy}%</StatValue>
            </StatText>
          </ResultCard>
          
          <NextButton onClick={nextStep}>
            {round >= totalRounds ? 'Sonuçları Gör' : 'Sonraki Oyuncu'}
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
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            margin: '1rem 0'
          }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '500px',
                background: player.id === getWinner().id && !isTie() 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                padding: '15px',
                borderRadius: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '10px',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: PLAYER_COLORS[index], fontWeight: 'bold' }}>
                    Oyuncu {player.id + 1}
                  </span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {player.score} puan
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Patlatılan Balon</span>
                  <span style={{ 
                    color: player.balloonCount === getMostBalloons().balloonCount 
                      ? '#f1c40f' 
                      : 'white'
                  }}>
                    {player.balloonCount}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Doğruluk Oranı</span>
                  <span style={{ 
                    color: player.accuracy === getHighestAccuracy().accuracy 
                      ? '#f1c40f' 
                      : 'white'
                  }}>
                    {player.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <NextButton onClick={() => window.location.reload()}>
            Tekrar Oyna
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default BalloonPop; 