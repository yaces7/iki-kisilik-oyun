import React, { useState } from 'react';
import styled from 'styled-components';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 300;
const TARGET_X = FIELD_WIDTH - 60;
const TARGET_Y = FIELD_HEIGHT / 2;

const Field = styled.div`
  width: ${FIELD_WIDTH}px;
  height: ${FIELD_HEIGHT}px;
  background: #e0eafc;
  border: 4px solid #888;
  border-radius: 18px;
  margin: 40px auto;
  position: relative;
`;

const Rocket = styled.div<{ color: string; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 32px;
  height: 16px;
  background: ${props => props.color};
  border-radius: 8px 16px 16px 8px;
  box-shadow: 0 2px 8px #0002;
  transition: left 0.7s cubic-bezier(.4,2,.6,1), top 0.7s cubic-bezier(.4,2,.6,1);
`;

const Target = styled.div`
  position: absolute;
  left: ${TARGET_X}px;
  top: ${TARGET_Y - 20}px;
  width: 40px;
  height: 40px;
  background: #f1c40f;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 16px #f1c40f88;
`;

const FireButton = styled.button`
  display: block;
  margin: 32px auto 0 auto;
  font-size: 1.2rem;
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  background: #333;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px #0002;
`;

const ScoreBoard = styled.div`
  margin: 24px auto;
  display: flex;
  justify-content: center;
  gap: 32px;
  font-size: 1.3rem;
`;

interface Player {
  id: number;
  score: number;
}

interface Shot {
  x: number;
  y: number;
  distance: number;
}

const RocketRace: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ id: i, score: 0 }))
  );
  const [shots, setShots] = useState<Shot[]>([]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'play' | 'score' | 'end'>('play');
  const [rocketPos, setRocketPos] = useState<{x: number, y: number} | null>(null);

  // Roket fırlatma
  const handleFire = () => {
    if (phase !== 'play') return;
    // Y ekseni rastgele, X sabit
    const y = 40 + Math.random() * (FIELD_HEIGHT - 80);
    const x = TARGET_X + (Math.random() - 0.5) * 40; // Hedef etrafında rastgele
    setRocketPos({ x, y });
    // Mesafe hesapla
    const dist = Math.sqrt((x - TARGET_X) ** 2 + (y - TARGET_Y) ** 2);
    setShots([...shots, { x, y, distance: dist }]);
    // Puan ver
    setPlayers(ps => ps.map((p, idx) => idx === activePlayer ? { ...p, score: p.score + Math.max(0, 100 - Math.round(dist)) } : p));
    setTimeout(() => {
      setRocketPos(null);
      if (activePlayer === playerCount - 1) {
        setPhase('end');
      } else {
        setActivePlayer(a => a + 1);
      }
    }, 900);
  };

  // Skor tablosu
  const renderScore = () => (
    <ScoreBoard>
      {players.map((p, i) => (
        <span key={p.id} style={{ color: PLAYER_COLORS[i] }}>
          Oyuncu {i + 1}: {p.score} puan
        </span>
      ))}
    </ScoreBoard>
  );

  // Kazanan
  const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Rocket Race</h2>
      {renderScore()}
      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 20, fontWeight: 600 }}>
        {phase === 'play' && `Sıra: Oyuncu ${activePlayer + 1}`}
        {phase === 'end' && `Kazanan: Oyuncu ${winner.id + 1}`}
      </div>
      <Field>
        <Target />
        {shots.map((shot, idx) => (
          <Rocket key={idx} color={PLAYER_COLORS[idx]} x={shot.x} y={shot.y} />
        ))}
        {rocketPos && (
          <Rocket color={PLAYER_COLORS[activePlayer]} x={rocketPos.x} y={rocketPos.y} />
        )}
      </Field>
      {phase === 'play' && <FireButton onClick={handleFire}>Fırlat</FireButton>}
      {phase === 'end' && (
        <FireButton onClick={() => window.location.reload()}>Yeniden Oyna</FireButton>
      )}
    </div>
  );
};

export default RocketRace; 