import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 10px;
  position: relative;
  overflow: hidden;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 0.5rem 0 1rem;
  padding: 8px 20px;
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

const GameArea = styled.div`
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 500px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  margin: 0;
  cursor: none;
`;

const InfoText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin: 0.5rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 8px 20px;
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

const TargetDisplay = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  flex-wrap: wrap;
`;

const TargetItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(45deg, #3498db, #9b59b6);
  padding: 5px 10px;
  border-radius: 8px;
  margin: 5px;
`;

const TargetIcon = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
`;

const TargetCount = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: white;
`;

const Timer = styled.div<{ urgent?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  padding: 5px 15px;
  border-radius: 10px;
  background: ${props => props.urgent ? '#e74c3c' : '#3498db'};
  z-index: 10;
`;

// Düşen şekil stili - Optimize edilmiş animasyon
const createFallingAnimation = (startX: number, endX: number, duration: number, pattern: 'straight' | 'zigzag' | 'curve' = 'straight') => {
  if (pattern === 'straight') {
    return keyframes`
      0% { transform: translate(${startX}px, -50px); }
      100% { transform: translate(${endX}px, calc(100vh - 250px)); }
    `;
  } else if (pattern === 'zigzag') {
    const midPoint1 = startX + (endX - startX) * 0.3;
    const midPoint2 = startX + (endX - startX) * 0.7;
    return keyframes`
      0% { transform: translate(${startX}px, -50px); }
      25% { transform: translate(${startX + 50}px, calc((100vh - 250px) * 0.25)); }
      50% { transform: translate(${startX - 50}px, calc((100vh - 250px) * 0.5)); }
      75% { transform: translate(${startX + 30}px, calc((100vh - 250px) * 0.75)); }
      100% { transform: translate(${endX}px, calc(100vh - 250px)); }
    `;
  } else if (pattern === 'curve') {
    return keyframes`
      0% { transform: translate(${startX}px, -50px); }
      25% { transform: translate(${startX + 100}px, calc((100vh - 250px) * 0.25)); }
      75% { transform: translate(${startX - 100}px, calc((100vh - 250px) * 0.75)); }
      100% { transform: translate(${endX}px, calc(100vh - 250px)); }
    `;
  }
};

// El yakalayıcı SVG'sini ekle
const HandCatcher = styled.div<{ x: number, y: number, color: string }>`
  position: absolute;
  left: ${props => props.x - 30}px;
  top: ${props => props.y - 35}px;
  width: 60px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 5;
  transform: rotate(0deg);
`;

const ShapeContainer = styled.div<{ 
  startX: number, 
  endX: number, 
  duration: number,
  paused: boolean,
  color: string,
  caught: boolean,
  top: number,
  pattern: 'straight' | 'zigzag' | 'curve'
}>`
  position: absolute;
  top: ${props => props.top}px;
  left: 0;
  width: 50px;
  height: 50px;
  display: ${props => props.caught ? 'none' : 'flex'};
  justify-content: center;
  align-items: center;
  animation: ${props => createFallingAnimation(props.startX, props.endX, props.duration, props.pattern)} ${props => props.duration}s linear forwards;
  animation-play-state: ${props => props.paused ? 'paused' : 'running'};
  pointer-events: auto;
  z-index: 3;
  cursor: pointer;
  will-change: transform; /* GPU hızlandırması için */
  
  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.color};
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }
`;

// Yakalayıcı bileşenlerini değiştir
const CatcherContainer = styled.div`
  display: none;
`;

const CatcherInner = styled.div`
  display: none;
`;

const CatchEffect = styled.div<{ x: number, y: number, color: string }>`
  position: absolute;
  left: ${props => props.x - 30}px;
  top: ${props => props.y - 30}px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.color}88;
  pointer-events: none;
  animation: ${pulse} 0.3s ease-out forwards;
  z-index: 4;
`;

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const SHAPES = [
  {
    name: 'Kare',
    svg: <svg viewBox="0 0 24 24"><rect width="24" height="24" /></svg>,
    points: 1
  },
  {
    name: 'Daire',
    svg: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" /></svg>,
    points: 1
  },
  {
    name: 'Üçgen',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 24,24 0,24" /></svg>,
    points: 1
  },
  {
    name: 'Yıldız',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 15,9 24,9 17,15 20,24 12,18 4,24 7,15 0,9 9,9" /></svg>,
    points: 2
  },
  {
    name: 'Kalp',
    svg: <svg viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>,
    points: 2
  },
  {
    name: 'Altıgen',
    svg: <svg viewBox="0 0 24 24"><polygon points="12,0 23,6 23,18 12,24 1,18 1,6" /></svg>,
    points: 2
  },
  {
    name: 'Yıldırım',
    svg: <svg viewBox="0 0 24 24"><polygon points="13,0 4,12 10,12 7,24 16,12 10,12" /></svg>,
    points: 3
  },
  {
    name: 'Çarpı',
    svg: <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>,
    points: -2,
    penalty: true
  },
  {
    name: 'Bomba',
    svg: <svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="8" /><path d="M12,6L12,2M16,7L19,4M8,7L5,4" stroke="white" strokeWidth="2" fill="none" /></svg>,
    points: -3,
    penalty: true
  }
];

interface Player {
  id: number;
  score: number;
  shapesCollected: Record<string, number>;
  comboCount: number;
  penaltyCount: number;
  lastCaughtTimestamp: number;
}

interface ActiveShape {
  id: number;
  shape: typeof SHAPES[0];
  startX: number;
  endX: number;
  speed: number;
  y: number;
  caught: boolean;
  color: string;
  timestamp: number;
  pattern: 'straight' | 'zigzag' | 'curve';
}

interface TargetRequirement {
  shape: typeof SHAPES[0];
  count: number;
}

interface CatchEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface SpecialEffectObj {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'bonus' | 'penalty';
}

const ComboCounter = styled.div<{ active: boolean }>`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  padding: 5px 15px;
  border-radius: 10px;
  background: ${props => props.active ? '#27ae60' : '#7f8c8d'};
  transition: background 0.3s ease;
  z-index: 10;
`;

const SpecialEffect = styled.div<{ type: 'bonus' | 'penalty' }>`
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  padding: 5px 10px;
  border-radius: 8px;
  background: ${props => props.type === 'bonus' ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)'};
  animation: ${fadeIn} 0.3s ease-out, float 1s ease-out forwards;
  z-index: 10;
  pointer-events: none;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  
  @keyframes float {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-30px); opacity: 0; }
  }
`;

const ShapeDrop: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ 
      id: i, 
      score: 0,
      shapesCollected: {},
      comboCount: 0,
      penaltyCount: 0,
      lastCaughtTimestamp: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(0);
  const [targets, setTargets] = useState<TargetRequirement[]>([]);
  const [activeShapes, setActiveShapes] = useState<ActiveShape[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gamePaused, setGamePaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [catchEffects, setCatchEffects] = useState<CatchEffect[]>([]);
  const [combo, setCombo] = useState(0);
  const [specialEffects, setSpecialEffects] = useState<SpecialEffectObj[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shapeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalRounds = playerCount;
  
  const endRound = useCallback(() => {
    if (shapeIntervalRef.current) {
      clearInterval(shapeIntervalRef.current);
      shapeIntervalRef.current = null;
    }
    
    setGamePaused(true);
    setPhase('result');
    
    const timer = setTimeout(() => {
      const newRound = round + 1;
      setRound(newRound);
      
      if (newRound >= totalRounds) {
        setPhase('end');
      } else {
        setActivePlayer((activePlayer + 1) % playerCount);
        setPhase('ready');
        setGamePaused(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [round, activePlayer, playerCount, totalRounds]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'playing' || gamePaused) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };
  
  const generateTargets = () => {
    const newTargets: TargetRequirement[] = [];
    const shapesCount = Math.floor(Math.random() * 2) + 4;
    
    const validShapes = SHAPES.filter(s => !s.penalty);
    const selectedShapes = [...validShapes].sort(() => Math.random() - 0.5).slice(0, shapesCount);
    
    selectedShapes.forEach(shape => {
      newTargets.push({
        shape,
        count: Math.floor(Math.random() * 8) + 5
      });
    });
    
    setTargets(newTargets);
  };
  
  const startRound = useCallback(() => {
    setActiveShapes([]);
    setCatchEffects([]);
    setCombo(0);
    setSpecialEffects([]);
    
    generateTargets();
    
    setTimeLeft(25);
    setPhase('playing');
    
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { ...p, shapesCollected: {} };
      }
      return p;
    }));
    
    setGamePaused(false);
  }, [activePlayer, generateTargets]);
  
  useEffect(() => {
    if (phase !== 'playing' || gamePaused) return;
    
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const gameHeight = gameArea.clientHeight;
    
    let animationFrameId: number;
    let lastTimestamp = 0;
    let frameSkipCounter = 0;
    
    const updateAnimation = (timestamp: number) => {
      if (frameSkipCounter < 2 && lastTimestamp !== 0) {
        frameSkipCounter++;
        animationFrameId = requestAnimationFrame(updateAnimation);
        return;
      }
      
      frameSkipCounter = 0;
      
      setActiveShapes(prev => {
        let hasChanges = false;
        
        const updated = prev.map(shape => {
          if (shape.caught) return shape;
          
          const elapsedTime = (timestamp - shape.timestamp) / 1000;
          const progress = Math.min(1, elapsedTime / shape.speed);
          
          const yPos = progress * (gameHeight + 100) - 50;
          
          if ((yPos > gameHeight && !shape.caught) || Math.abs(yPos - shape.y) > 1) {
            hasChanges = true;
            return { 
              ...shape, 
              y: yPos,
              caught: yPos > gameHeight ? true : shape.caught 
            };
          }
          
          return shape;
        });
        
        const filteredShapes = updated.filter(shape => {
          const age = (timestamp - shape.timestamp) / 1000;
          return !shape.caught || age < shape.speed + 2;
        });
        
        if (filteredShapes.length !== updated.length) {
          hasChanges = true;
        }
        
        return hasChanges ? filteredShapes : prev;
      });
      
      if (timestamp - lastTimestamp > 500 || lastTimestamp === 0) {
        const currentPlayer = players[activePlayer];
        let allTargetsCompleted = true;
        
        for (const target of targets) {
          const collected = currentPlayer.shapesCollected[target.shape.name] || 0;
          if (collected < target.count) {
            allTargetsCompleted = false;
            break;
          }
        }
        
        if (allTargetsCompleted) {
          setPlayers(prev => prev.map((p, i) => {
            if (i === activePlayer) {
              return { ...p, score: p.score + 10 };
            }
            return p;
          }));
          
          cancelAnimationFrame(animationFrameId);
          setPhase('result');
          setGamePaused(true);
          return;
        }
        
        lastTimestamp = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(updateAnimation);
    };
    
    animationFrameId = requestAnimationFrame(updateAnimation);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, gamePaused, activePlayer, players, targets]);
  
  const addRandomShape = useCallback(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea || phase !== 'playing' || gamePaused) return;
    
    const gameWidth = gameArea.clientWidth;
    
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    let selectedShape = SHAPES[shapeIndex];
    
    if (selectedShape.penalty && Math.random() > 0.2) {
      const normalShapeIndex = Math.floor(Math.random() * (SHAPES.length - 2));
      const normalShape = SHAPES[normalShapeIndex];
      selectedShape = normalShape;
    }
    
    const startX = Math.random() * (gameWidth - 50);
    const endX = Math.random() * (gameWidth - 50);
    
    const speed = Math.random() * 2 + 2;
    
    const patterns: ('straight' | 'zigzag' | 'curve')[] = ['straight', 'zigzag', 'curve'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const newShape: ActiveShape = {
      id: Date.now() + Math.random(),
      shape: selectedShape,
      startX,
      endX,
      speed,
      y: 0,
      caught: false,
      color: selectedShape.penalty ? '#e74c3c' : 
             targets.some(t => t.shape.name === selectedShape.name) ? '#FFD700' : '#FFFFFF',
      timestamp: Date.now(),
      pattern
    };
    
    setActiveShapes(prev => {
      if (prev.filter(s => !s.caught).length >= 25) {
        return prev;
      }
      return [...prev, newShape];
    });
  }, [phase, gamePaused, targets]);
  
  const calculateProgress = useCallback((shapeName: string) => {
    const target = targets.find(t => t.shape.name === shapeName);
    if (!target) return { collected: 0, target: 0, percent: 0 };
    
    const collected = players[activePlayer].shapesCollected[shapeName] || 0;
    const percent = Math.min(100, (collected / target.count) * 100);
    
    return { collected, target: target.count, percent };
  }, [targets, players, activePlayer]);
  
  useEffect(() => {
    if (phase !== 'playing') return;
    
    let shapeTimer: NodeJS.Timeout | null = null;
    let gameTimer: NodeJS.Timeout | null = null;
    
    if (!gamePaused) {
      addRandomShape();
      
      shapeTimer = setInterval(() => {
        addRandomShape();
      }, 1000);
    }
    
    if (!gamePaused) {
      gameTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (shapeTimer) clearInterval(shapeTimer);
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [phase, gamePaused, addRandomShape, endRound]);
  
  const winner = players.reduce(
    (max, p) => p.score > max.score ? p : max, 
    players[0]
  );
  
  const isTie = players.filter(p => p.score === winner.score).length > 1;
  
  const handleShapeClick = useCallback((shapeId: number) => {
    if (phase !== 'playing' || gamePaused) return;
    
    setActiveShapes(prev => {
      const clickedShapeIndex = prev.findIndex(shape => shape.id === shapeId && !shape.caught);
      if (clickedShapeIndex === -1) return prev;
      
      const clickedShape = prev[clickedShapeIndex];
      
      setCatchEffects(prevEffects => [...prevEffects, {
        id: Date.now() + Math.random(),
        x: clickedShape.startX + 25,
        y: clickedShape.y + 25,
        color: clickedShape.color
      }]);
      
      setTimeout(() => {
        setCatchEffects(eff => eff.filter(e => Date.now() - e.id < 400));
      }, 500);
      
      const shapePoints = clickedShape.shape.points || 1;
      const isPenalty = clickedShape.shape.penalty || false;
      
      const now = Date.now();
      const lastCaughtTime = players[activePlayer].lastCaughtTimestamp;
      const isCombo = !isPenalty && (now - lastCaughtTime < 1000);
      
      let comboMultiplier = 1;
      let newCombo = combo;
      
      if (isPenalty) {
        newCombo = 0;
        setCombo(0);
        
        setSpecialEffects(prev => [...prev, {
          id: Date.now(),
          x: clickedShape.startX,
          y: clickedShape.y,
          text: `${shapePoints}`,
          type: 'penalty'
        }]);
        
        setTimeout(() => {
          setSpecialEffects(prev => prev.filter(e => e.id !== Date.now()));
        }, 1000);
      } else {
        if (isCombo) {
          newCombo = Math.min(combo + 1, 10);
          setCombo(newCombo);
          comboMultiplier = 1 + (newCombo * 0.2);
          
          if (newCombo >= 3) {
            setSpecialEffects(prev => [...prev, {
              id: Date.now(),
              x: clickedShape.startX,
              y: clickedShape.y,
              text: `+${Math.round(shapePoints * comboMultiplier)} (${newCombo}x)`,
              type: 'bonus'
            }]);
            
            setTimeout(() => {
              setSpecialEffects(prev => prev.filter(e => e.id !== Date.now()));
            }, 1000);
          }
        } else {
          newCombo = 1;
          setCombo(1);
        }
      }
      
      setPlayers(prevPlayers => prevPlayers.map((p, i) => {
        if (i === activePlayer) {
          const pointsEarned = isPenalty ? shapePoints : Math.round(shapePoints * comboMultiplier);
          
          const updatedShapesCollected = { ...p.shapesCollected };
          if (!isPenalty) {
            const shapeName = clickedShape.shape.name;
            updatedShapesCollected[shapeName] = (updatedShapesCollected[shapeName] || 0) + 1;
          }
          
          return { 
            ...p, 
            shapesCollected: updatedShapesCollected,
            score: Math.max(0, p.score + pointsEarned),
            comboCount: isCombo && !isPenalty ? p.comboCount + 1 : p.comboCount,
            penaltyCount: isPenalty ? p.penaltyCount + 1 : p.penaltyCount,
            lastCaughtTimestamp: now
          };
        }
        return p;
      }));
      
      const newShapes = [...prev];
      newShapes[clickedShapeIndex] = { ...clickedShape, caught: true };
      return newShapes;
    });
  }, [phase, gamePaused, targets, activePlayer, players, combo]);
  
  return (
    <GameContainer>
      <Header>Şekil Yakalama</Header>
      
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
          <NextButton onClick={startRound}>Hazırım</NextButton>
        </>
      )}
      
      {(phase === 'playing' || phase === 'result') && (
        <>
          <InfoText>
            {phase === 'playing' 
              ? `Hedef şekilleri yakala!` 
              : `Süre doldu! Yakalalanlar: ${Object.values(players[activePlayer].shapesCollected).reduce((a, b) => a + b, 0)}`
            }
          </InfoText>
          
          <TargetDisplay>
            {targets.map((target, i) => {
              const progress = calculateProgress(target.shape.name);
              return (
                <TargetItem key={i}>
                  <TargetIcon>{target.shape.svg}</TargetIcon>
                  <TargetCount>{progress.collected}/{target.count}</TargetCount>
                </TargetItem>
              );
            })}
          </TargetDisplay>
          
          <GameArea 
            ref={gameAreaRef}
            onMouseMove={handleMouseMove}
          >
            {phase === 'playing' && (
              <Timer urgent={timeLeft <= 5}>
                {timeLeft}
              </Timer>
            )}
            
            {activeShapes
              .filter(shape => !shape.caught && shape.y >= -50 && shape.y <= (gameAreaRef.current?.clientHeight || 1000)) 
              .map(shape => (
                <ShapeContainer
                  key={shape.id}
                  startX={shape.startX}
                  endX={shape.endX}
                  duration={shape.speed}
                  paused={gamePaused}
                  color={shape.color}
                  caught={shape.caught}
                  onClick={() => handleShapeClick(shape.id)}
                  top={shape.y || 0}
                  pattern={shape.pattern}
                >
                  {shape.shape.svg}
                </ShapeContainer>
              ))
            }
            
            {catchEffects.slice(-5).map(effect => (
              <CatchEffect 
                key={effect.id}
                x={effect.x}
                y={effect.y}
                color={effect.color}
              />
            ))}
            
            {phase === 'playing' && (
              <HandCatcher
                x={mousePosition.x} 
                y={mousePosition.y}
                color={PLAYER_COLORS[activePlayer]}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={PLAYER_COLORS[activePlayer]} strokeWidth="2">
                  <path d="M6,12.5 v-2 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v-4 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v0 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v4 c0-1.1,0.9-2,2-2 s2,0.9,2,2 v6 c0,4.4-3.6,8-8,8 h-2 c-2.8,0-5.5-1.5-7-4 l-3-5" 
                   fill="rgba(255,255,255,0.2)" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </HandCatcher>
            )}
            
            {phase === 'playing' && (
              <ComboCounter active={combo >= 3}>
                {combo >= 3 ? `Combo: ${combo}x` : 'Combo: 1x'}
              </ComboCounter>
            )}
          </GameArea>
          
          {specialEffects.map(effect => (
            <SpecialEffect
              key={effect.id}
              style={{ 
                left: `${effect.x}px`, 
                top: `${effect.y - 30}px`
              }}
              type={effect.type}
            >
              {effect.text}
            </SpecialEffect>
          ))}
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

export default ShapeDrop; 