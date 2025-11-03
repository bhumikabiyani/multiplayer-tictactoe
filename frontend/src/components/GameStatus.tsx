import React from 'react';
import { useGame } from '../contexts/GameContext';
import styled from 'styled-components';

const StatusContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const StatusText = styled.h2`
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: 300;
`;

const PlayerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
`;

const PlayerCard = styled.div<{ $isActive: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.$isActive ? 'rgba(255, 255, 255, 0.5)' : 'transparent'};
  transition: all 0.3s ease;
`;

const ResetButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const WinnerText = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 20px 0;
`;

const GameStatus: React.FC = () => {
  const { state, resetGame } = useGame();

  const getStatusMessage = () => {
    if (state.winner) {
      if (state.winner === 'tie') {
        return "It's a tie!";
      }
      if (state.isPlayingWithBot) {
        return state.winner === state.playerSymbol ? 'You won!' : 'Bot won!';
      }
      return state.winner === state.playerSymbol ? 'You won!' : 'You lost!';
    }

    if (state.isWaitingForPlayer && !state.isPlayingWithBot) {
      return 'Waiting for another player...';
    }

    if (state.currentPlayer === state.playerSymbol) {
      return 'Your turn';
    }

    if (state.isPlayingWithBot) {
      return "Bot's turn";
    }

    return "Opponent's turn";
  };

  return (
    <StatusContainer>
      {state.winner ? (
        <WinnerText>{getStatusMessage()}</WinnerText>
      ) : (
        <StatusText>{getStatusMessage()}</StatusText>
      )}

      {state.playerSymbol && (
        <PlayerInfo>
          <PlayerCard $isActive={state.currentPlayer === 'X'}>
            <div>Player X</div>
            <div>{state.playerSymbol === 'X' ? '(You)' : (state.isPlayingWithBot ? '(Bot)' : '(Opponent)')}</div>
          </PlayerCard>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>VS</div>
          
          <PlayerCard $isActive={state.currentPlayer === 'O'}>
            <div>Player O</div>
            <div>{state.playerSymbol === 'O' ? '(You)' : (state.isPlayingWithBot ? '(Bot)' : '(Opponent)')}</div>
          </PlayerCard>
        </PlayerInfo>
      )}

      {state.winner && (
        <ResetButton onClick={resetGame}>
          Play Again
        </ResetButton>
      )}
    </StatusContainer>
  );
};

export default GameStatus;