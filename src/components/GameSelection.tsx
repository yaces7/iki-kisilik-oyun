import React from 'react';
import styled from 'styled-components';

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
`;

const GameCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-5px);
    border-color: #ff6b6b;
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
`;

const GameTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const GameDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.7rem;
  margin: 0;
  line-height: 1.5;
`;

const games = [
  {
    id: 1,
    title: 'Tank Savaşı',
    description: '2-4 oyuncu ile tanklarınızı kontrol edin ve rakiplerinizi yenin!',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 5,
    title: 'Bomber Arena',
    description: 'Sıra tabanlı bomba bırakma arenası! Rakiplerini patlat, puan topla.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 10,
    title: 'Rocket Race',
    description: 'Sıra tabanlı roket fırlatma yarışı! Hedefe en yakın olan kazanır.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 20,
    title: 'Laser Duel',
    description: 'Sıra tabanlı lazer düellosu! Aynalardan sek, rakibini vur, puan topla.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 30,
    title: 'Renk Koşusu',
    description: 'Gösterilen rengi bulun ve puan kazanın! Hız ve renk algısı yarışması.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 40,
    title: 'Hafıza Eşleştirme',
    description: 'Kartları çevir ve eşini bul! Eşleşen çiftleri bulan puan kazanır.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 50,
    title: 'Hızlı Matematik Düellosu',
    description: 'Matematik sorularını hızlı yanıtla ve puan topla! Yanlış yanıtlarsan puan kaybedersin.',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 60,
    title: 'Şekil Düşürme',
    description: 'Düşen şekilleri yakala! Doğru şekli yakalayan puan kazanır, yanlış yakalayan kaybeder.',
    minPlayers: 2,
    maxPlayers: 4
  }
];

interface GameSelectionProps {
  selectedPlayers: number;
  onGameSelect: (gameId: number) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ selectedPlayers, onGameSelect }) => {
  const availableGames = games.filter(
    game => selectedPlayers >= game.minPlayers && selectedPlayers <= game.maxPlayers
  );

  return (
    <GameGrid>
      {availableGames.map(game => (
        <GameCard key={game.id} onClick={() => onGameSelect(game.id)}>
          <GameTitle>{game.title}</GameTitle>
          <GameDescription>{game.description}</GameDescription>
        </GameCard>
      ))}
    </GameGrid>
  );
};

export default GameSelection; 