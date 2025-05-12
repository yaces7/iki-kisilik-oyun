import React, { useState } from 'react';
import styled from 'styled-components';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const FIELD_SIZE = 400;
const MIRROR_COUNT = 3;

const Field = styled.div`
  width: ${FIELD_SIZE}px;
  height: ${FIELD_SIZE}px;
  background: #e0eafc;
  border: 4px solid #888;
  border-radius: 18px;
  margin: 40px auto;
  position: relative;
`;

const PlayerBase = styled.div<{ color: string; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x - 16}px;
  top: ${props => props.y - 16}px;
  width: 32px;
  height: 32px;
  background: ${props => props.color};
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px #0002;
`;

const Mirror = styled.div<{ x: number; y: number; angle: number }>`
  position: absolute;
  left: ${props => props.x - 20}px;
  top: ${props => props.y - 4}px;
  width: 40px;
  height: 8px;
  background: #aaa;
  border-radius: 4px;
  transform: rotate(${props => props.angle}deg);
  box-shadow: 0 2px 8px #0002;
`;

const Laser = styled.div<{ x: number; y: number; w: number; h: number; color: string }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.w}px;
  height: ${props => props.h}px;
  background: ${props => props.color};
  border-radius: 4px;
  opacity: 0.7;
  box-shadow: 0 0 12px ${props => props.color};
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
  x: number;
  y: number;
}

interface MirrorObj {
  x: number;
  y: number;
  angle: number;
}

const LaserDuel: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncular köşelerde
  const basePositions = [
    { x: 32, y: 32 },
    { x: FIELD_SIZE - 32, y: 32 },
    { x: 32, y: FIELD_SIZE - 32 },
    { x: FIELD_SIZE - 32, y: FIELD_SIZE - 32 }
  ];
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      score: 0,
      x: basePositions[i].x,
      y: basePositions[i].y
    }))
  );
  const [mirrors] = useState<MirrorObj[]>(
    Array.from({ length: MIRROR_COUNT }, () => ({
      x: 80 + Math.random() * (FIELD_SIZE - 160),
      y: 80 + Math.random() * (FIELD_SIZE - 160),
      angle: Math.random() * 180
    }))
  );
  const [activePlayer, setActivePlayer] = useState<number | null>(0);
  const [phase, setPhase] = useState<'play' | 'end'>('play');
  const [laserPath, setLaserPath] = useState<{x: number, y: number, w: number, h: number, color: string}[]>([]);

  // Sıradaki hayatta olan oyuncuya geç
  const nextTurn = () => {
    const alivePlayers = players.filter(p => p);
    if (activePlayer === null || alivePlayers.length <= 1) {
      setPhase('end');
      return;
    }
    let next = activePlayer;
    for (let i = 1; i <= players.length; i++) {
      const candidate = (activePlayer + i) % players.length;
      if (players[candidate]) {
        next = candidate;
        break;
      }
    }
    setActivePlayer(next);
    setPhase('play');
  };

  // Lazer ateşle
  const handleFire = () => {
    if (phase !== 'play') return;
    if (activePlayer === null || !players[activePlayer]) return;
    // Lazer yatay başlasın, aynalara çarptıkça yön değişsin (basit mantık)
    let x = players[activePlayer].x;
    let y = players[activePlayer].y;
    let dx = 1, dy = 0;
    let path: {x: number, y: number, w: number, h: number, color: string}[] = [];
    let hitPlayer: number | null = null;
    for (let step = 0; step < 20; step++) {
      let nextX = x + dx * 40;
      let nextY = y + dy * 40;
      // Aynaya çarpma kontrolü
      const mirror = mirrors.find(m => Math.abs(m.x - nextX) < 24 && Math.abs(m.y - nextY) < 24);
      if (mirror) {
        // Basit yansıtma: yatay <-> dikey
        [dx, dy] = [dy, dx];
      }
      // Rakibe çarpma kontrolü
      const hit = players.find((p, idx) => activePlayer !== null && idx !== activePlayer && Math.abs(p.x - nextX) < 24 && Math.abs(p.y - nextY) < 24);
      if (hit) {
        hitPlayer = hit.id;
        path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
        break;
      }
      // Sınır kontrolü
      if (nextX < 0 || nextX > FIELD_SIZE || nextY < 0 || nextY > FIELD_SIZE) {
        path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
        break;
      }
      path.push({ x, y, w: nextX - x, h: nextY - y, color: PLAYER_COLORS[activePlayer!] });
      x = nextX;
      y = nextY;
    }
    setLaserPath(path);
    // Puan ver
    setPlayers(ps => ps.map((p, idx) => {
      if (activePlayer !== null && idx === activePlayer) {
        let score = path.length * 10;
        if (hitPlayer !== null) score += 50;
        return { ...p, score: p.score + score };
      }
      return p;
    }));
    setTimeout(() => {
      setLaserPath([]);
      if (activePlayer === null || activePlayer === players.length - 1) {
        setPhase('end');
      } else {
        nextTurn();
      }
    }, 900);
  };

  // Skor tablosu
  const renderScore = () => (
    <ScoreBoard>
      {players.map((p, i) => (
        <span key={p.id} style={{ color: PLAYER_COLORS[i], fontWeight: 700, fontSize: 22, marginRight: 16 }}>
          Oyuncu {i + 1}: {p.score} puan
        </span>
      ))}
    </ScoreBoard>
  );

  // Kazanan
  const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Laser Duel</h2>
      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 24, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)', borderRadius: 12, padding: '12px 0', boxShadow: '0 2px 12px #0003', marginTop: 16 }}>
        {phase === 'play' && activePlayer !== null
          ? `Sıra: Oyuncu ${activePlayer + 1} - Ateş etmek için butona bas!`
          : phase === 'end'
            ? `Kazanan: Oyuncu ${winner.id + 1}`
            : ''
        }
      </div>
      {renderScore()}
      <Field>
        {players.map((p, i) => (
          <PlayerBase key={p.id} color={PLAYER_COLORS[i]} x={p.x} y={p.y} />
        ))}
        {mirrors.map((m, i) => (
          <Mirror key={i} x={m.x} y={m.y} angle={m.angle} />
        ))}
        {laserPath.map((seg, i) => (
          <Laser key={i} x={seg.x} y={seg.y} w={seg.w} h={seg.h} color={seg.color} />
        ))}
      </Field>
      {phase === 'play' && <FireButton onClick={handleFire}>Ateş Et</FireButton>}
      {phase === 'end' && (
        <FireButton onClick={() => window.location.reload()}>Yeniden Oyna</FireButton>
      )}
    </div>
  );
};

export default LaserDuel; 