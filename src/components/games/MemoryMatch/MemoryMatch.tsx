import React, { useState, useEffect } from 'react';
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

const flip = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(180deg); }
`;

const flipBack = keyframes`
  0% { transform: rotateY(180deg); }
  100% { transform: rotateY(0deg); }
`;

// Stil componentleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-top: 1rem;
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
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  max-width: 650px;
  margin: 0 auto;

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const CardContainer = styled.div<{ flipped: boolean, matched: boolean }>`
  width: 120px;
  height: 120px;
  position: relative;
  perspective: 1000px;
  cursor: ${props => (props.flipped || props.matched) ? 'default' : 'pointer'};
  
  @media (max-width: 600px) {
    width: 100px;
    height: 100px;
  }
`;

const CardFace = styled.div<{ flipped: boolean, matched: boolean, back?: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  backface-visibility: hidden;
  transition: all 0.4s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  user-select: none;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  
  ${props => props.back && `
    transform: rotateY(180deg);
  `}
  
  ${props => props.flipped && `
    transform: ${props.back ? 'rotateY(0deg)' : 'rotateY(-180deg)'};
  `}
  
  ${props => props.matched && `
    opacity: 0.8;
    box-shadow: 0 0 15px rgba(46, 204, 113, 0.8);
  `}
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, #3498db, #9b59b6);
`;

const CardFront = styled(CardFace)`
  background: #fff;
  color: #333;
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

// Oyun sembolleri
const CARD_SYMBOLS = [
  '🍎', '🍌', '🍒', '🍓', '🍊', '🍉', 
  '🍇', '🥝', '🍍', '🥥', '🍄', '🌶️'
];

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

interface Player {
  id: number;
  score: number;
}

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ id: i, score: 0 }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'end'>('ready');
  
  // Kartları karıştır ve oyunu hazırla
  const initializeGame = () => {
    // Oyuncu sayısına göre kart sayısını belirle (çift sayı olmalı)
    const pairCount = playerCount === 2 ? 8 : (playerCount === 3 ? 9 : 12);
    
    // Sembolleri seç ve çiftler oluştur
    const selectedSymbols = CARD_SYMBOLS.slice(0, pairCount);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Kartları karıştır ve id ekle
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false
      }));
    
    setCards(shuffledCards);
    setMatchedPairs(0);
    setFlippedCards([]);
    setPhase('playing');
    
    // Oyuncuların skorlarını sıfırla
    setPlayers(Array.from({ length: playerCount }, (_, i) => ({ id: i, score: 0 })));
    setActivePlayer(0);
  };
  
  // Kart tıklama
  const handleCardClick = (cardId: number) => {
    // İşlem sürüyorsa veya kart çevrilmiş/eşleşmiş ise tıklanamaz
    if (
      isProcessing || 
      flippedCards.length >= 2 || 
      cards[cardId].flipped || 
      cards[cardId].matched
    ) {
      return;
    }
    
    // Kartı çevir
    const updatedCards = [...cards];
    updatedCards[cardId].flipped = true;
    setCards(updatedCards);
    
    // Çevrilen kartları güncelle
    const updatedFlippedCards = [...flippedCards, cardId];
    setFlippedCards(updatedFlippedCards);
    
    // İki kart çevrildiyse, eşleşme kontrolü
    if (updatedFlippedCards.length === 2) {
      setIsProcessing(true);
      
      const [firstCardId, secondCardId] = updatedFlippedCards;
      const firstCard = updatedCards[firstCardId];
      const secondCard = updatedCards[secondCardId];
      
      // Eşleşme kontrolü
      if (firstCard.symbol === secondCard.symbol) {
        // Eşleşme durumu
        setTimeout(() => {
          // Kartları eşleşti olarak işaretle
          const matchedCards = [...updatedCards];
          matchedCards[firstCardId].matched = true;
          matchedCards[secondCardId].matched = true;
          setCards(matchedCards);
          
          // Aktif oyuncuya puan ekle
          setPlayers(prev => prev.map((p, i) => {
            if (i === activePlayer) {
              return { ...p, score: p.score + 10 };
            }
            return p;
          }));
          
          // Eşleşen çift sayısını artır
          setMatchedPairs(prev => prev + 1);
          
          // Sıradaki hamle için hazırlık
          setFlippedCards([]);
          setIsProcessing(false);
          
          // Oyun bitti mi kontrol et
          const totalPairs = updatedCards.length / 2;
          if (matchedPairs + 1 >= totalPairs) {
            setPhase('end');
          }
        }, 1000);
      } else {
        // Eşleşmeme durumu
        setTimeout(() => {
          // Kartları geri çevir
          const unflippedCards = [...updatedCards];
          unflippedCards[firstCardId].flipped = false;
          unflippedCards[secondCardId].flipped = false;
          setCards(unflippedCards);
          
          // Sıradaki oyuncuya geç
          setActivePlayer((activePlayer + 1) % playerCount);
          
          // Sıradaki hamle için hazırlık
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };
  
  // Kazananı bul
  const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);
  
  // Beraberlik durumu
  const isTie = players.filter(p => p.score === winner.score).length > 1;
  
  return (
    <GameContainer>
      <Header>Hafıza Eşleştirme</Header>
      
      <ScoreBoard>
        {players.map((player, index) => (
          <PlayerScore 
            key={player.id} 
            color={PLAYER_COLORS[index]} 
            active={activePlayer === index && phase === 'playing'}
          >
            Oyuncu {index + 1}: {player.score}
          </PlayerScore>
        ))}
      </ScoreBoard>
      
      {phase === 'ready' && (
        <>
          <InfoText>Hafızanı Test Et!</InfoText>
          <NextButton onClick={initializeGame}>Oyunu Başlat</NextButton>
        </>
      )}
      
      {phase === 'playing' && (
        <>
          <InfoText>Sıra: Oyuncu {activePlayer + 1}</InfoText>
          <CardsGrid>
            {cards.map(card => (
              <CardContainer 
                key={card.id} 
                flipped={card.flipped} 
                matched={card.matched}
                onClick={() => handleCardClick(card.id)}
              >
                <CardBack 
                  flipped={card.flipped} 
                  matched={card.matched}
                />
                <CardFront 
                  flipped={card.flipped}
                  matched={card.matched}
                  back
                >
                  {card.symbol}
                </CardFront>
              </CardContainer>
            ))}
          </CardsGrid>
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

export default MemoryMatch;