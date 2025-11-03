import React from 'react';
import { useGame } from '../contexts/GameContext';
import styled from 'styled-components';

const PanelContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 400px;
`;

const ConnectButton = styled.button`
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BotButton = styled.button`
  background: linear-gradient(45deg, #FF9800, #F57C00);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const StatusIndicator = styled.div<{ $isConnected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  background: ${props => props.$isConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  border: 1px solid ${props => props.$isConnected ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'};
  margin-bottom: 20px;
`;

const StatusDot = styled.div<{ $isConnected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isConnected ? '#4CAF50' : '#f44336'};
  animation: ${props => props.$isConnected ? 'none' : 'pulse 2s infinite'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.8rem;
  font-weight: 300;
`;

const Description = styled.p`
  margin: 0 0 20px 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const ConnectionPanel: React.FC = () => {
  const { state, joinGame, startBotGame } = useGame();

  if (state.isConnected) {
    return (
      <PanelContainer>
        <StatusIndicator $isConnected={true}>
          <StatusDot $isConnected={true} />
          <span>{state.isPlayingWithBot ? 'Playing with Bot' : 'Connected to game server'}</span>
        </StatusIndicator>
        
        {state.isWaitingForPlayer && !state.isPlayingWithBot && (
          <div>
            <Title>Waiting for opponent...</Title>
            <Description>
              Share this game with a friend or wait for someone to join!
            </Description>
          </div>
        )}
        
        {state.playerSymbol && (
          <div>
            <Title>You are playing as: {state.playerSymbol}</Title>
            {state.isPlayingWithBot && (
              <Description>Playing against AI Bot (O)</Description>
            )}
          </div>
        )}
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <StatusIndicator $isConnected={false}>
        <StatusDot $isConnected={false} />
        <span>Choose your game mode</span>
      </StatusIndicator>
      
      <Title>Welcome to Tic-Tac-Toe!</Title>
      <Description>
        Choose to play online with other players or practice against our AI bot.
      </Description>
      
      <ButtonContainer>
        <ConnectButton onClick={joinGame}>
          🌐 Play Online (Multiplayer)
        </ConnectButton>
        
        <BotButton onClick={startBotGame}>
          🤖 Play vs Bot (Practice)
        </BotButton>
      </ButtonContainer>
    </PanelContainer>
  );
};

export default ConnectionPanel;