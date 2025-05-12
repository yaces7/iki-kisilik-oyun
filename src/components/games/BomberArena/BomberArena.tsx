import React, { useState } from 'react';
import styled from 'styled-components';

const GRID_SIZE = 10;
const CELL_SIZE = 60;
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const Arena = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);
  grid-template-rows: repeat(${GRID_SIZE}, ${CELL_SIZE}px);
  gap: 2px;
  background: #d2b48c;
  border: 4px solid #888;
  margin: 40px auto;
  width: ${GRID_SIZE * CELL_SIZE}px;
  height: ${GRID_SIZE * CELL_SIZE}px;
`;

const Cell = styled.div<{ isActive: boolean; clickable: boolean }>`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background: ${props => props.isActive ? '#fffbe6' : '#f5e1a4'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border-radius: 8px;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: ${props => props.clickable ? '0 0 0 4px #2ecc71aa' : 'none'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
`;

const PlayerIcon = styled.div<{ color: string; faded?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 3px solid #fff;
  box-shadow: 0 2px 8px #0002;
  opacity: ${props => props.faded ? 0.3 : 1};
  transition: opacity 0.5s;
`;

const BombIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #333;
  position: relative;
  box-shadow: 0 0 8px #0008;
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: orange;
    border-radius: 50%;
    transform: translateX(-50%);
  }
`;

const ScoreBoard = styled.div`
  margin: 24px auto;
  display: flex;
  justify-content: center;
  gap: 32px;
  font-size: 1.3rem;
`;

const NextButton = styled.button`
  margin: 32px auto 0 auto;
  display: block;
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

const AnimatedScoreBoard = styled(ScoreBoard)`
  animation: pop 0.7s cubic-bezier(.4,2,.6,1);
  @keyframes pop {
    0% { transform: scale(0.7); opacity: 0.5; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const NextGameButton = styled(NextButton)`
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  font-size: 1.3rem;
`;

const TurnInfo = styled.div`
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin: 16px 0 24px 0;
  background: linear-gradient(90deg, #ff6b6b 0%, #f1c40f 100%);
  border-radius: 12px;
  padding: 12px 0;
  box-shadow: 0 2px 12px #0003;
`;

interface Player {
  id: number;
  x: number;
  y: number;
  alive: boolean;
  score: number;
}

interface Bomb {
  x: number;
  y: number;
  owner: number;
  exploded: boolean;
}

const BomberArena: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      alive: true,
      score: 0
    }))
  );
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'play' | 'explode' | 'score' | 'end'>('play');
  const [explodedCells, setExplodedCells] = useState<{x: number, y: number}[]>([]);
  const [explosions, setExplosions] = useState<{x: number, y: number, id: number}[]>([]);

  // Bomba bırakma
  const handleCellClick = (x: number, y: number) => {
    if (phase !== 'play') return;
    if (!players[activePlayer] || !players[activePlayer].alive) return;
    // Aynı hücreye tekrar bomba bırakma
    const bombHere = bombs.some(b => b.x === x && b.y === y);
    const playerHere = players.some(p => p.x === x && p.y === y);
    if (bombHere || playerHere) return;
    setBombs([...bombs, { x, y, owner: players[activePlayer].id, exploded: false }]);
    setPhase('explode');
    setTimeout(() => {
      explodeBomb(x, y);
    }, 500);
  };

  // Patlama ve puanlama
  const explodeBomb = (x: number, y: number) => {
    // Patlayan hücreler (merkez + 4 yön)
    const cells = [
      {x, y},
      {x: x-1, y},
      {x: x+1, y},
      {x, y: y-1},
      {x, y: y+1}
    ].filter(c => c.x >= 0 && c.x < GRID_SIZE && c.y >= 0 && c.y < GRID_SIZE);
    setExplodedCells(cells);
    setBombs(bs => bs.map(b => (b.x === x && b.y === y ? { ...b, exploded: true } : b)));
    // Patlama animasyonu ekle
    setExplosions(explosions => [...explosions, ...cells.map((c, i) => ({x: c.x, y: c.y, id: Date.now() + i}))]);
    setTimeout(() => {
      setExplosions(explosions => []);
    }, 600);
    // Oyuncu vuruldu mu?
    setPlayers(ps => ps.map(p => {
      if (!p.alive) return p;
      if (cells.some(c => c.x === p.x && c.y === p.y)) {
        return { ...p, alive: false };
      }
      return p;
    }));
    // Puan ver
    setPlayers(ps => ps.map((p, idx) => {
      if (idx === activePlayer) {
        // Her vurulan için +2, hayatta kalırsa +1
        const killed = players.filter(pl => pl.alive && cells.some(c => c.x === pl.x && c.y === pl.y) && pl.id !== p.id).length;
        return { ...p, score: p.score + killed * 2 + (killed === 0 ? 1 : 0) };
      }
      return p;
    }));
    setTimeout(() => {
      setExplodedCells([]);
      nextTurn();
    }, 800);
  };

  // Sıradaki hayatta olan oyuncuya geç
  const nextTurn = () => {
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length <= 1 || bombs.length >= GRID_SIZE * GRID_SIZE) {
      setPhase('end');
      return;
    }
    let next = activePlayer;
    for (let i = 1; i <= players.length; i++) {
      const candidate = (activePlayer + i) % players.length;
      if (players[candidate].alive) {
        next = candidate;
        break;
      }
    }
    setActivePlayer(next);
    setPhase('play');
  };

  // Skor tablosu
  const renderScore = () => (
    <AnimatedScoreBoard>
      {players.map((p, i) => (
        <span key={p.id} style={{ color: PLAYER_COLORS[i], fontWeight: 700, fontSize: 24, marginRight: 16 }}>
          Oyuncu {i + 1}: {p.score} puan {p.alive ? '' : '💀'}
        </span>
      ))}
    </AnimatedScoreBoard>
  );

  // Kazanan
  const winner = players.find(p => p.alive);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Bomber Arena</h2>
      <TurnInfo>
        {phase === 'play' && players[activePlayer].alive
          ? `Sıra: Oyuncu ${activePlayer + 1} - Bomba bırakmak için bir hücreye tıkla!`
          : phase === 'play'
            ? `Sıra: Oyuncu ${activePlayer + 1} (Elendi)`
            : phase === 'end' && winner
              ? `Kazanan: Oyuncu ${winner.id + 1}`
              : phase === 'end' && !winner
                ? 'Kimse hayatta kalamadı!'
                : ''
        }
      </TurnInfo>
      {renderScore()}
      <Arena>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const playerHere = players.find((p, i) => p.x === x && p.y === y);
          const bombHere = bombs.find(b => b.x === x && b.y === y);
          const exploded = explodedCells.some(c => c.x === x && c.y === y);
          // Sadece boş ve bomba olmayan hücreler tıklanabilir
          const clickable = phase === 'play' && players[activePlayer].alive && !bombHere && !playerHere;
          return (
            <Cell
              key={idx}
              isActive={phase === 'play' && clickable}
              clickable={clickable}
              onClick={() => clickable && handleCellClick(x, y)}
              style={{ background: exploded ? '#ffb347' : undefined }}
            >
              {playerHere && <PlayerIcon color={PLAYER_COLORS[players.indexOf(playerHere)]} faded={!playerHere.alive} />}
              {bombHere && <BombIcon />}
            </Cell>
          );
        })}
        {explosions.map(e => <Explosion key={e.id} x={e.x} y={e.y} />)}
      </Arena>
      {phase === 'end' && (
        <NextGameButton onClick={() => window.location.reload()}>Sonraki Oyun</NextGameButton>
      )}
    </div>
  );
};

const Explosion = ({x, y}: {x: number, y: number}) => (
  <div style={{
    position: 'absolute',
    left: x * CELL_SIZE,
    top: y * CELL_SIZE,
    width: CELL_SIZE,
    height: CELL_SIZE,
    pointerEvents: 'none',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <svg width={CELL_SIZE} height={CELL_SIZE}>
      <circle cx={CELL_SIZE/2} cy={CELL_SIZE/2} r={CELL_SIZE/2-2} fill="orange" fillOpacity="0.7">
        <animate attributeName="r" from={CELL_SIZE/2-2} to={CELL_SIZE} dur="0.5s" fill="freeze" />
        <animate attributeName="opacity" from="0.7" to="0" dur="0.5s" fill="freeze" />
      </circle>
    </svg>
  </div>
);

export default BomberArena; 