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
    id: 2,
    title: 'Uzay Yarışı',
    description: 'Uzay geminizi kontrol edin ve yıldızları toplayın!',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 3,
    title: 'Labirent Kaçış',
    description: 'Labirentten çıkmaya çalışın ve hazineyi bulun!',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 4,
    title: 'Puzzle Savaşı',
    description: 'En hızlı puzzle çözen siz olun!',
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