import React from 'react';
import styled from 'styled-components';

const DeviceSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  margin-top: 2rem;
`;

const DeviceButton = styled.button<{ selected?: boolean }>`
  background: ${props => props.selected ? '#4CAF50' : 'linear-gradient(45deg, #4a90e2, #63b3ed)'};
  border: none;
  padding: 1.5rem 3rem;
  color: white;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const DeviceIcon = styled.span`
  font-size: 2rem;
`;

interface DeviceSelectionProps {
  selectedDevice: 'computer' | 'phone' | null;
  onDeviceSelect: (device: 'computer' | 'phone') => void;
}

const DeviceSelection: React.FC<DeviceSelectionProps> = ({ selectedDevice, onDeviceSelect }) => {
  return (
    <DeviceSelectionContainer>
      <DeviceButton
        selected={selectedDevice === 'computer'}
        onClick={() => onDeviceSelect('computer')}
      >
        <DeviceIcon>💻</DeviceIcon>
        Bilgisayar
      </DeviceButton>
      <DeviceButton
        selected={selectedDevice === 'phone'}
        onClick={() => onDeviceSelect('phone')}
      >
        <DeviceIcon>📱</DeviceIcon>
        Telefon / Akıllı Tahta
      </DeviceButton>
    </DeviceSelectionContainer>
  );
};

export default DeviceSelection; 