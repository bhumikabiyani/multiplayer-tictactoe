import React from 'react';
import { useGame } from '../contexts/GameContext';
import styled from 'styled-components';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 8px;
  width: 300px;
  height: 300px;
  margin: 20px auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
`;

const Cell = styled.button<{ $hasValue: boolean }>`
  pointer-events: auto;
  background: ${props => props.$hasValue ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.$hasValue ? '#333' : 'white'};
  cursor: ${props => props.$hasValue ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  
  &:hover {
    background: ${props => props.$hasValue ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
    transform: ${props => props.$hasValue ? 'none' : 'scale(1.05)'};
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: ${props => props.$hasValue ? 'none' : 'scale(0.95)'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const XSymbol = styled.span`
  color: #e74c3c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const OSymbol = styled.span`
  color: #3498db;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Board: React.FC = () => {
  const { state, makeMove } = useGame();

  const renderSymbol = (value: string | null) => {
    if (value === 'X') return <XSymbol>X</XSymbol>;
    if (value === 'O') return <OSymbol>O</OSymbol>;
    return null;
  };

  const isCellDisabled = (index: number) => {
    return (
      state.board[index] !== null ||
      state.winner !== null ||
      !state.playerSymbol ||
      state.currentPlayer !== state.playerSymbol ||
      state.isWaitingForPlayer
    );
  };

  return (
    <BoardContainer>
      {state.board.map((cell, index) => (
        <Cell
          key={index}
          $hasValue={cell !== null && cell !== ""}
          onClick={() => {
            console.log('Cell clicked:', index);
            makeMove(index);
          }}
          disabled={isCellDisabled(index)}
        >
          {renderSymbol(cell)}
        </Cell>
      ))}
    </BoardContainer>
  );
};

export default Board;