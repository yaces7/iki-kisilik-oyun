import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const GAME_COLORS = [
  { name: 'Kırmızı', code: '#e74c3c' },
  { name: 'Mavi', code: '#3498db' },
  { name: 'Yeşil', code: '#2ecc71' },
  { name: 'Sarı', code: '#f1c40f' },
  { name: 'Mor', code: '#9b59b6' },
  { name: 'Turuncu', code: '#e67e22' }
];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 1rem 0 2rem;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlayerScore = styled.div<{ color: string, active: boolean }>`
  color: ${props => props.color};
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
`;

const ColorTarget = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0,0,0,0.5);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  animation: ${pulse} 2s infinite;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 2rem auto;
`;

const ColorButton = styled.button<{ color: string }>`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: ${props => props.color};
  border: none;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const InfoText = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin: 1.5rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 15px 30px;
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
  margin-top: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
  }
`;

interface Player {
  id: number;
  score: number;
}

const ColorDash: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ id: i, score: 0 }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'selection' | 'result' | 'end'>('ready');
  const [targetColor, setTargetColor] = useState<typeof GAME_COLORS[0] | null>(null);
  const [colorOptions, setColorOptions] = useState<typeof GAME_COLORS>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [rounds, setRounds] = useState(0);
  const maxRounds = playerCount * 3; // Her oyuncu 3 tur oynasın
  
  // Yeni tur başlat
  const startNewRound = () => {
    // Rastgele bir hedef renk seç
    const target = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    setTargetColor(target);
    
    // Renk seçeneklerini karıştır (hedef renk dahil)
    let options = [...GAME_COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6); // 6 renk seçeneği göster
    
    // Hedef renk seçeneklerde yoksa, ekle
    if (!options.includes(target)) {
      options.pop(); // Son rengi çıkar
      options.push(target); // Hedef rengi ekle
    }
    
    // Seçenekleri karıştır
    options = options.sort(() => Math.random() - 0.5);
    setColorOptions(options);
    setSelectedColor(null);
    setPhase('selection');
  };
  
  // Renk seçme
  const handleColorSelect = (color: string) => {
    if (phase !== 'selection') return;
    
    setSelectedColor(color);
    
    // Doğru renk mi kontrol et
    const isCorrect = color === targetColor?.code;
    
    // Puanı güncelle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { ...p, score: p.score + (isCorrect ? 10 : -5) };
      }
      return p;
    }));
    
    setPhase('result');
    
    // 2 saniye sonra sonuç göster
    setTimeout(() => {
      setRounds(r => r + 1);
      
      // Oyun bitti mi kontrol et
      if (rounds + 1 >= maxRounds) {
        setPhase('end');
      } else {
        // Sıradaki oyuncuya geç
        setActivePlayer((activePlayer + 1) % playerCount);
        setPhase('ready');
      }
    }, 2000);
  };
  
  // Kazananı bul
  const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);
  
  return (
    <GameContainer>
      <Header>Renk Koşusu</Header>
      
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
          <NextButton onClick={startNewRound}>Başla</NextButton>
        </>
      )}
      
      {phase === 'selection' && targetColor && (
        <>
          <InfoText>Rengi Bul!</InfoText>
          <ColorTarget style={{ background: targetColor.code }}>
            {targetColor.name}
          </ColorTarget>
          
          <ColorGrid>
            {colorOptions.map((color, index) => (
              <ColorButton 
                key={index} 
                color={color.code}
                onClick={() => handleColorSelect(color.code)}
              />
            ))}
          </ColorGrid>
        </>
      )}
      
      {phase === 'result' && (
        <InfoText>
          {selectedColor === targetColor?.code ? '✅ Doğru!' : '❌ Yanlış!'}
        </InfoText>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            Oyun Bitti! Kazanan: Oyuncu {winner.id + 1}
          </InfoText>
          <ScoreBoard>
            {players.map((player, index) => (
              <PlayerScore 
                key={player.id} 
                color={PLAYER_COLORS[index]}
                active={player.id === winner.id}
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

export default ColorDash; 