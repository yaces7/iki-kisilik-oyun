import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import GameSelection from './components/GameSelection';
import TankGame from './components/games/TankGame/TankGame';
import DeviceSelection from './components/DeviceSelection';
import BomberArena from './components/games/BomberArena/BomberArena';
import RocketRace from './components/games/RocketRace/RocketRace';
import LaserDuel from './components/games/LaserDuel/LaserDuel';
import ColorDash from './components/games/ColorDash/ColorDash';
import MemoryMatch from './components/games/MemoryMatch/MemoryMatch';
import QuickMathDuel from './components/games/QuickMathDuel/QuickMathDuel';
import ShapeDrop from './components/games/ShapeDrop/ShapeDrop';
import ReactionBattle from './components/games/ReactionBattle/ReactionBattle';
import MazeRunner from './components/games/MazeRunner/MazeRunner';
import EmojiGuess from './components/games/EmojiGuess/EmojiGuess';
import WordChain from './components/games/WordChain/WordChain';
import BalloonPop from './components/games/BalloonPop/BalloonPop';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Press Start 2P', cursive;
`;

const GameCanvas = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  animation: ${fadeIn} 0.5s ease-out;
  overflow-y: auto;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
  text-align: center;
`;

const GameMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const MenuButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  border: none;
  padding: 1rem 2rem;
  color: white;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const PlayerCount = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PlayerButton = styled(MenuButton)<{ selected?: boolean }>`
  background: ${props => props.selected ? '#4CAF50' : 'linear-gradient(45deg, #4a90e2, #63b3ed)'};
  flex: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  color: #e74c3c;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  &:hover {
    background: #ffeaea;
  }
`;

const App: React.FC = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<number>(2);
  const [showGameSelection, setShowGameSelection] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<'computer' | 'phone' | null>(null);

  const handleGameSelect = (gameId: number) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
    setShowGameSelection(false);
    setSelectedDevice(null);
  };

  if (selectedGame === 1) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <TankGame 
            playerCount={selectedPlayers} 
            deviceType={selectedDevice || 'computer'}
          />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 5) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <BomberArena playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 10) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <RocketRace playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 20) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <LaserDuel playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 30) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <ColorDash playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 40) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <MemoryMatch playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 50) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <QuickMathDuel playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 60) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <ShapeDrop playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 70) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <ReactionBattle playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 80) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <MazeRunner playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 90) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <EmojiGuess playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 100) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <WordChain playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (selectedGame === 110) {
    return (
      <GameContainer>
        <GameCanvas>
          <CloseButton 
            onClick={handleBackToMenu}
          >
            ✖️
          </CloseButton>
          <BalloonPop playerCount={selectedPlayers} />
        </GameCanvas>
      </GameContainer>
    );
  }

  if (!selectedDevice) {
    return (
      <GameContainer>
        <GameCanvas>
          <Title>2-4 Kişilik Oyunlar</Title>
          <DeviceSelection
            selectedDevice={selectedDevice}
            onDeviceSelect={setSelectedDevice}
          />
        </GameCanvas>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <GameCanvas>
        <Title>2-4 Kişilik Oyunlar</Title>
        {!showGameSelection ? (
          <GameMenu>
            <MenuButton onClick={() => setShowGameSelection(true)}>Oyun Seç</MenuButton>
            <MenuButton>Ayarlar</MenuButton>
            <MenuButton>Nasıl Oynanır?</MenuButton>
            
            <PlayerCount>
              <PlayerButton 
                selected={selectedPlayers === 2}
                onClick={() => setSelectedPlayers(2)}
              >
                2 Kişi
              </PlayerButton>
              <PlayerButton 
                selected={selectedPlayers === 3}
                onClick={() => setSelectedPlayers(3)}
              >
                3 Kişi
              </PlayerButton>
              <PlayerButton 
                selected={selectedPlayers === 4}
                onClick={() => setSelectedPlayers(4)}
              >
                4 Kişi
              </PlayerButton>
            </PlayerCount>
          </GameMenu>
        ) : (
          <>
            <MenuButton 
              onClick={() => setShowGameSelection(false)}
              style={{ marginBottom: '2rem' }}
            >
              Geri Dön
            </MenuButton>
            <GameSelection 
              selectedPlayers={selectedPlayers}
              onGameSelect={handleGameSelect}
            />
          </>
        )}
      </GameCanvas>
    </GameContainer>
  );
};

export default App; 