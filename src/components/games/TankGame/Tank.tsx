import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const TankContainer = styled.div<{ color: string; rotation: number; isMoving: boolean }>`
  position: absolute;
  width: 60px;
  height: 60px;
  transition: transform 0.2s ease;
`;

const TankBody = styled.div<{ color: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.color};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: ${props => props.color}dd;
    border-radius: 8px;
  }
`;

const TankCannon = styled.div<{ color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 12px;
  background: ${props => props.color}dd;
  transform: translate(0, -50%);
  border-radius: 6px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const TankTracks = styled.div<{ color: string; isMoving: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 100%;
    background: ${props => props.color}99;
    border-radius: 4px;
  }
  
  &::before {
    left: 0;
  }
  
  &::after {
    right: 0;
  }
`;

interface TankProps {
  color: string;
  rotation: number;
  position: { x: number; y: number };
  isMoving: boolean;
}

const Tank: React.FC<TankProps> = ({ color, rotation, position, isMoving }) => {
  return (
    <TankContainer 
      color={color} 
      rotation={rotation}
      isMoving={isMoving}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`
      }}
    >
      <TankBody color={color} />
      <TankCannon color={color} />
      <TankTracks color={color} isMoving={isMoving} />
    </TankContainer>
  );
};

export default Tank; 