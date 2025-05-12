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

interface Player {
  id: number;
  score: number;
  reactionTimes: number[];
}

const ReactionBattle: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      reactionTimes: []
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
  
  const totalRounds = playerCount * 3; // Her oyuncu 3 tur oynasın
  
  // Turu başlat
  const startRound = () => {
    setPhase('waiting');
    setEarlyClick(false);
    setReactionTime(null);
    
    // Rastgele bir süre sonra (2-6 saniye arasında) "Şimdi Bas!" yazısı göster
    const delay = 2000 + Math.random() * 4000;
    const timeout = setTimeout(() => {
      setPhase('active');
      setReactionStartTime(Date.now());
    }, delay);
    
    setActiveTimeout(timeout);
  };
  
  // Tıklama işlemi
  const handleAreaClick = () => {
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
          return { ...p, score: Math.max(0, p.score - 2) };
        }
        return p;
      }));
      
      setPhase('result');
      return;
    }
    
    // Aktif aşamada tıklama - reaksiyon süresi ölçümü
    if (phase === 'active' && reactionStartTime) {
      const clickTime = Date.now();
      const timeTaken = clickTime - reactionStartTime;
      setReactionTime(timeTaken);
      
      // Tepki süresi puanı (maksimum 5 puan, en hızlı 200ms ve üstü)
      const maxScore = 5;
      const scoreEarned = Math.max(1, Math.min(maxScore, Math.ceil(maxScore - (timeTaken - 200) / 100)));
      
      // Oyuncu puanı ve reaksiyon süresini güncelle
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          return { 
            ...p, 
            score: p.score + scoreEarned,
            reactionTimes: [...p.reactionTimes, timeTaken]
          };
        }
        return p;
      }));
      
      setPhase('result');
    }
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
    };
  }, [activeTimeout]);
  
  // Ortalama reaksiyon süresi hesapla
  const getAverageReactionTime = (playerId: number) => {
    const times = players[playerId].reactionTimes;
    if (times.length === 0) return null;
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    return Math.round(average);
  };
  
  // En hızlı reaksiyon süresi bul
  const getFastestReactionTime = (playerId: number) => {
    const times = players[playerId].reactionTimes;
    if (times.length === 0) return null;
    return Math.min(...times);
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
      <Header>Refleks Savaşı</Header>
      
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
          <ActionText size="1.4rem">
            "Şimdi Bas!" yazısı göründüğünde hızlıca tıkla. Erken tıklarsan puan kaybedersin!
          </ActionText>
          <NextButton onClick={startRound}>Hazırım</NextButton>
        </>
      )}
      
      {(phase === 'waiting' || phase === 'active') && (
        <ReactionArea 
          active={phase === 'active'} 
          wrong={false}
          onClick={handleAreaClick}
        >
          <ActionText>
            {phase === 'waiting' ? 'Bekle...' : 'ŞİMDİ BAS!'}
          </ActionText>
        </ReactionArea>
      )}
      
      {phase === 'result' && (
        <>
          <ReactionArea 
            active={false} 
            wrong={earlyClick}
            onClick={() => {}}
          >
            {earlyClick ? (
              <ActionText warn>Çok Erken Bastın!</ActionText>
            ) : (
              <>
                <ActionText>Tepki Süren</ActionText>
                <ActionText>{reactionTime} ms</ActionText>
              </>
            )}
          </ReactionArea>
          
          <ResultText positive={!earlyClick}>
            {earlyClick 
              ? '2 Puan Kaybettin!' 
              : reactionTime && reactionTime < 300 
                ? 'Harika Refleks!'
                : reactionTime && reactionTime < 500
                  ? 'İyi İş!'
                  : 'Biraz Daha Hızlı Olabilirsin!'}
          </ResultText>
          
          <NextButton onClick={nextStep}>
            {round >= totalRounds ? 'Sonuçları Gör' : 'Sonraki Tur'}
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
          
          {players.map((player, i) => {
            const avgTime = getAverageReactionTime(i);
            const fastestTime = getFastestReactionTime(i);
            
            return (
              <div key={i} style={{marginTop: '1rem'}}>
                <StatText style={{color: PLAYER_COLORS[i], fontWeight: 'bold'}}>
                  Oyuncu {i + 1}
                </StatText>
                {avgTime && (
                  <StatText>Ortalama Tepki: {avgTime} ms</StatText>
                )}
                {fastestTime && (
                  <StatText>En Hızlı Tepki: {fastestTime} ms</StatText>
                )}
              </div>
            );
          })}
          
          <NextButton onClick={() => window.location.reload()}>
            Tekrar Oyna
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default ReactionBattle; 