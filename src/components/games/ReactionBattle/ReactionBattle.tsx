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

const flash = keyframes`
  0% { background-color: rgba(255, 255, 255, 0.1); }
  25% { background-color: #e74c3c; }
  50% { background-color: rgba(255, 255, 255, 0.1); }
  75% { background-color: #e74c3c; }
  100% { background-color: rgba(255, 255, 255, 0.1); }
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

const ReactionArea = styled.div<{ active: boolean; wrong: boolean }>`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  margin: 2rem 0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  ${props => props.active && css`
    animation: ${flash} 0.5s infinite;
  `}
  
  ${props => props.wrong && css`
    background: rgba(231, 76, 60, 0.3);
  `}
`;

const ActionText = styled.div<{ size?: string, warn?: boolean }>`
  font-size: ${props => props.size || '3rem'};
  font-weight: bold;
  color: white;
  text-align: center;
  text-shadow: 0 0 15px rgba(0,0,0,0.3);
  
  ${props => props.warn && css`
    color: #e74c3c;
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

const ResultText = styled.div<{ positive: boolean }>`
  font-size: 1.6rem;
  font-weight: bold;
  color: ${props => props.positive ? '#2ecc71' : '#e74c3c'};
  text-align: center;
  margin-top: 2rem;
  text-shadow: 0 0 10px rgba(0,0,0,0.2);
`;

const StatText = styled.div`
  font-size: 1.2rem;
  color: white;
  text-align: center;
  margin: 0.5rem 0;
`;

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

// Stillendirilmiş bileşenler ekleniyor
const DifficultySelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 1rem 0;
`;

const DifficultyButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  background: ${props => props.selected ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: white;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FakeButton = styled.div<{ enabled: boolean }>`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.enabled ? '#e74c3c' : 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: transform 0.2s;
  transform: ${props => props.enabled ? 'scale(1)' : 'scale(0)'};
  z-index: 5;
  
  &:hover {
    transform: ${props => props.enabled ? 'scale(1.1)' : 'scale(0)'};
  }
`;

const Distraction = styled.div<{ visible: boolean, position: { x: number, y: number } }>`
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  font-size: 3rem;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 2;
`;

const StreakIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0.5rem 0;
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
`;

const StreakIcon = styled.div<{ active: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: ${props => props.active ? '#f39c12' : 'rgba(255, 255, 255, 0.2)'};
  transition: background 0.3s ease;
`;

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = {
  EASY: 'Kolay',
  MEDIUM: 'Orta',
  HARD: 'Zor'
};

// Dikkat dağıtıcı emojiler
const DISTRACTION_EMOJIS = ['🎮', '⚡', '💥', '🔥', '⭐', '🚀', '💫', '🌟'];

// Player interface güncelleniyor
interface Player {
  id: number;
  score: number;
  reactionTimes: number[];
  streak: number; // Arka arkaya hızlı tepkiler
  maxStreak: number;
  fails: number; // Başarısız denemeler
}

// FakeButton konumları için interface
interface ButtonPosition {
  x: number;
  y: number;
}

const ReactionBattle: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      reactionTimes: [],
      streak: 0,
      maxStreak: 0,
      fails: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'ready' | 'waiting' | 'active' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(1);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [earlyClick, setEarlyClick] = useState(false);
  const [activeTimeout, setActiveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [fakeButtons, setFakeButtons] = useState<ButtonPosition[]>([]);
  const [targetButton, setTargetButton] = useState<ButtonPosition | null>(null);
  const [distractions, setDistractions] = useState<ButtonPosition[]>([]);
  const [distractionVisible, setDistractionVisible] = useState(false);
  const [requireButton, setRequireButton] = useState(false);
  const [distractionInterval, setDistractionInterval] = useState<NodeJS.Timeout | null>(null);
  
  const reactionAreaRef = useRef<HTMLDivElement>(null);
  
  const totalRounds = playerCount * 3; // Her oyuncu 3 tur oynasın
  
  // Zorluk seviyesini değiştir
  const changeDifficulty = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
  };
  
  // Dikkat dağıtıcıları başlat (Zor mod için)
  const startDistractions = () => {
    if (difficulty !== DIFFICULTY_LEVELS.HARD) return;
    
    // Dikkat dağıtıcıları rastgele aralıklarla göster
    const interval = setInterval(() => {
      if (phase !== 'waiting' && phase !== 'active') {
        clearInterval(interval);
        return;
      }
      
      // Rastgele emoji konumlarını güncelle
      if (reactionAreaRef.current) {
        const width = reactionAreaRef.current.clientWidth;
        const height = reactionAreaRef.current.clientHeight;
        
        const newDistractions = Array.from({ length: 3 }, () => ({
          x: Math.random() * (width - 40),
          y: Math.random() * (height - 40)
        }));
        
        setDistractions(newDistractions);
        setDistractionVisible(true);
        
        // Kısa süre sonra gizle
        setTimeout(() => {
          setDistractionVisible(false);
        }, 500);
      }
    }, 1000);
    
    setDistractionInterval(interval);
  };
  
  // Turu başlat
  const startRound = () => {
    setPhase('waiting');
    setEarlyClick(false);
    setReactionTime(null);
    setFakeButtons([]);
    setTargetButton(null);
    setRequireButton(difficulty !== DIFFICULTY_LEVELS.EASY);
    
    // Zorluğa göre sahte butonları oluştur
    if (difficulty !== DIFFICULTY_LEVELS.EASY && reactionAreaRef.current) {
      const width = reactionAreaRef.current.clientWidth;
      const height = reactionAreaRef.current.clientHeight;
      
      const buttonCount = difficulty === DIFFICULTY_LEVELS.HARD ? 5 : 3;
      
      // Sahte butonlar
      const fakeBtns = Array.from({ length: buttonCount - 1 }, () => ({
        x: Math.random() * (width - 100),
        y: Math.random() * (height - 100)
      }));
      
      // Gerçek hedef buton
      const target = {
        x: Math.random() * (width - 100),
        y: Math.random() * (height - 100)
      };
      
      setFakeButtons(fakeBtns);
      setTargetButton(target);
    }
    
    // Dikkat dağıtıcıları başlat
    startDistractions();
    
    // Zorluğa göre bekleme süresi
    let minDelay, maxDelay;
    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        minDelay = 2000;
        maxDelay = 4000;
        break;
      case DIFFICULTY_LEVELS.MEDIUM:
        minDelay = 1500;
        maxDelay = 5000;
        break;
      case DIFFICULTY_LEVELS.HARD:
        minDelay = 1000;
        maxDelay = 6000;
        break;
      default:
        minDelay = 2000;
        maxDelay = 4000;
    }
    
    // Rastgele bir süre sonra "Şimdi Bas!" yazısı göster
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    const timeout = setTimeout(() => {
      setPhase('active');
      setReactionStartTime(Date.now());
    }, delay);
    
    setActiveTimeout(timeout);
  };
  
  // Tıklama işlemi
  const handleAreaClick = () => {
    // Buton gerekliyse, alan tıklaması geçersiz
    if (requireButton) return;
    
    // Bekleme aşamasında erken tıklama
    if (phase === 'waiting') {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        setActiveTimeout(null);
      }
      setEarlyClick(true);
      
      // Erken tıklama cezası (-2 puan)
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          return { 
            ...p, 
            score: Math.max(0, p.score - 2),
            streak: 0,
            fails: p.fails + 1 
          };
        }
        return p;
      }));
      
      setPhase('result');
      clearDistractions();
      return;
    }
    
    // Aktif aşamada tıklama - reaksiyon süresi ölçümü
    if (phase === 'active' && reactionStartTime) {
      const clickTime = Date.now();
      const timeTaken = clickTime - reactionStartTime;
      setReactionTime(timeTaken);
      
      // Tepki süresi puanı (maksimum 5 puan, en hızlı 200ms ve üstü)
      const scoreEarned = calculateScore(timeTaken);
      
      updatePlayerScore(scoreEarned, timeTaken);
      
      setPhase('result');
      clearDistractions();
    }
  };
  
  // Buton tıklama işlemi
  const handleButtonClick = (isTarget: boolean) => {
    // Bekleme aşamasında erken tıklama
    if (phase === 'waiting') {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        setActiveTimeout(null);
      }
      setEarlyClick(true);
      
      // Erken tıklama cezası (-2 puan)
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          return { 
            ...p, 
            score: Math.max(0, p.score - 2),
            streak: 0,
            fails: p.fails + 1
          };
        }
        return p;
      }));
      
      setPhase('result');
      clearDistractions();
      return;
    }
    
    // Aktif aşamada tıklama
    if (phase === 'active' && reactionStartTime) {
      const clickTime = Date.now();
      const timeTaken = clickTime - reactionStartTime;
      setReactionTime(timeTaken);
      
      if (isTarget) {
        // Doğru butona tıklama
        const scoreEarned = calculateScore(timeTaken);
        updatePlayerScore(scoreEarned, timeTaken);
      } else {
        // Yanlış butona tıklama
        setPlayers(prev => prev.map((p, i) => {
          if (i === activePlayer) {
            return { 
              ...p, 
              score: Math.max(0, p.score - 1),
              streak: 0,
              fails: p.fails + 1
            };
          }
          return p;
        }));
      }
      
      setPhase('result');
      clearDistractions();
    }
  };
  
  // Puan hesaplama
  const calculateScore = (timeTaken: number): number => {
    // Tepki süresi puanı (baz puan + zorluk bonus)
    let baseScore = 0;
    
    if (timeTaken < 200) {
      baseScore = 5;
    } else if (timeTaken < 300) {
      baseScore = 4;
    } else if (timeTaken < 400) {
      baseScore = 3;
    } else if (timeTaken < 500) {
      baseScore = 2;
    } else {
      baseScore = 1;
    }
    
    // Zorluk bonusu
    const difficultyBonus = difficulty === DIFFICULTY_LEVELS.HARD ? 2 : 
                          difficulty === DIFFICULTY_LEVELS.MEDIUM ? 1 : 0;
                          
    return baseScore + difficultyBonus;
  };
  
  // Oyuncu skorunu güncelle
  const updatePlayerScore = (score: number, timeTaken: number) => {
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        // Hızlı tepki streak'i (300ms altı)
        const isQuick = timeTaken < 300;
        const newStreak = isQuick ? p.streak + 1 : 0;
        const streakBonus = newStreak >= 3 ? Math.min(newStreak - 2, 5) : 0;
        
        // Toplam puan = baz puan + seri bonusu
        const totalScore = score + streakBonus;
        
        return { 
          ...p, 
          score: p.score + totalScore,
          reactionTimes: [...p.reactionTimes, timeTaken],
          streak: newStreak,
          maxStreak: Math.max(p.maxStreak, newStreak)
        };
      }
      return p;
    }));
  };
  
  // Dikkat dağıtıcıları temizle
  const clearDistractions = () => {
    if (distractionInterval) {
      clearInterval(distractionInterval);
      setDistractionInterval(null);
    }
    setDistractionVisible(false);
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
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
      if (distractionInterval) {
        clearInterval(distractionInterval);
      }
    };
  }, []);
  
  // Ortalama tepki süresi
  const getAverageReactionTime = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player || player.reactionTimes.length === 0) return 0;
    
    const sum = player.reactionTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / player.reactionTimes.length);
  };
  
  // En hızlı tepki süresi
  const getFastestReactionTime = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player || player.reactionTimes.length === 0) return 0;
    
    return Math.min(...player.reactionTimes);
  };
  
  // En yüksek seriyi bulan oyuncu
  const getBestStreakPlayer = () => {
    return players.reduce((best, player) => 
      player.maxStreak > best.maxStreak ? player : best, players[0]);
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
  
  return (
    <GameContainer>
      <Header>Reaksiyon Savaşı</Header>
      
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
            {difficulty === DIFFICULTY_LEVELS.EASY ? (
              "Hazır olun! Yeşil ışık yandığında hemen alana tıklayın."
            ) : difficulty === DIFFICULTY_LEVELS.MEDIUM ? (
              "Hazır olun! Yeşil ışık yandığında doğru butona tıklayın. Dikkatli olun!"
            ) : (
              "Hazır olun! Yeşil ışık yandığında doğru butona tıklayın. Dikkat dağıtıcı emojilere aldanmayın!"
            )}
          </p>
          
          <DifficultySelector>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.EASY}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.EASY)}
            >
              Kolay
            </DifficultyButton>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.MEDIUM}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.MEDIUM)}
            >
              Orta
            </DifficultyButton>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.HARD}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.HARD)}
            >
              Zor
            </DifficultyButton>
          </DifficultySelector>
          
          <NextButton onClick={startRound}>Hazırım</NextButton>
        </>
      )}
      
      {(phase === 'waiting' || phase === 'active') && (
        <ReactionArea 
          ref={reactionAreaRef}
          active={phase === 'active'} 
          wrong={earlyClick}
          onClick={handleAreaClick}
        >
          {fakeButtons.map((btn, index) => (
            <FakeButton
              key={`fake-${index}`}
              style={{ left: btn.x, top: btn.y }}
              enabled={phase === 'active'}
              onClick={() => handleButtonClick(false)}
            >
              X
            </FakeButton>
          ))}
          
          {targetButton && (
            <FakeButton
              style={{ left: targetButton.x, top: targetButton.y }}
              enabled={phase === 'active'}
              onClick={() => handleButtonClick(true)}
            >
              ✓
            </FakeButton>
          )}
          
          {distractions.map((distraction, index) => (
            <Distraction
              key={`distraction-${index}`}
              position={distraction}
              visible={distractionVisible}
            >
              {DISTRACTION_EMOJIS[Math.floor(Math.random() * DISTRACTION_EMOJIS.length)]}
            </Distraction>
          ))}
          
          <ActionText>
            {phase === 'waiting' 
              ? 'Bekle...' 
              : phase === 'active' 
                ? requireButton ? 'Doğru butona bas!' : 'ŞİMDİ BAS!' 
                : ''
            }
          </ActionText>
        </ReactionArea>
      )}
      
      {phase === 'result' && (
        <>
          {players[activePlayer].streak >= 2 && (
            <StreakIndicator>
              Hızlı Seri: {players[activePlayer].streak}x
              {Array.from({ length: Math.min(players[activePlayer].streak, 5) }).map((_, i) => (
                <StreakIcon key={i} active={true} />
              ))}
            </StreakIndicator>
          )}
          
          {earlyClick ? (
            <ResultText positive={false}>
              Çok erken! (-2 puan)
            </ResultText>
          ) : (
            <>
              <ResultText positive={true}>
                Tepki Süresi: {reactionTime} ms
              </ResultText>
              <StatText>
                {reactionTime && reactionTime < 200 
                  ? 'Müthiş Hız!' 
                  : reactionTime && reactionTime < 350 
                    ? 'Çok İyi!' 
                    : reactionTime && reactionTime < 500 
                      ? 'İyi' 
                      : 'Daha Hızlı Olabilir'
                }
                {players[activePlayer].streak >= 3 
                  ? ` (+${Math.min(players[activePlayer].streak - 2, 5)} seri bonusu)` 
                  : ''
                }
              </StatText>
            </>
          )}
          <NextButton onClick={nextStep}>
            {round < totalRounds ? 'Sonraki Deneme' : 'Sonuçları Gör'}
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
            margin: '1rem 0',
            width: '100%',
            maxWidth: '500px'
          }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
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
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Ortalama Tepki</span>
                  <span style={{ color: 'white' }}>
                    {getAverageReactionTime(player.id)} ms
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>En Hızlı Tepki</span>
                  <span style={{ 
                    color: getFastestReactionTime(player.id) === 
                      Math.min(...players.map(p => 
                        p.reactionTimes.length > 0 ? Math.min(...p.reactionTimes) : Infinity
                      )) && getFastestReactionTime(player.id) > 0
                      ? '#f1c40f' 
                      : 'white'
                  }}>
                    {getFastestReactionTime(player.id)} ms
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>En Uzun Hız Serisi</span>
                  <span style={{ 
                    color: player.maxStreak === getBestStreakPlayer().maxStreak && player.maxStreak > 0
                      ? '#f1c40f' 
                      : 'white'
                  }}>
                    {player.maxStreak}x
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Başarısız Denemeler</span>
                  <span style={{ color: 'white' }}>
                    {player.fails}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <NextButton onClick={() => window.location.reload()}>
            Ana Menüye Dön
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default ReactionBattle; 