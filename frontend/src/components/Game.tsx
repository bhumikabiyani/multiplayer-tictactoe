import React from 'react';
import { useGame } from '../contexts/GameContext';
import Board from './Board';
import GameStatus from './GameStatus';
import ConnectionPanel from './ConnectionPanel';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 600px;
  margin: 0 auto;
`;

const GameContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Game: React.FC = () => {
  const { state } = useGame();

  return (
    <GameContainer>
      <ConnectionPanel />
      {state.isConnected && (
        <GameContent>
          <GameStatus />
          <Board />
        </GameContent>
      )}
    </GameContainer>
  );
};

export default Game;