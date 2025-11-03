// Bot AI logic for Tic-Tac-Toe
export const getBotMove = (board: (string | null)[], botSymbol: 'X' | 'O'): number => {
  const playerSymbol = botSymbol === 'X' ? 'O' : 'X';

  // Check if bot can win
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = botSymbol;
      if (checkWinner(testBoard) === botSymbol) {
        return i;
      }
    }
  }

  // Check if bot needs to block player from winning
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = playerSymbol;
      if (checkWinner(testBoard) === playerSymbol) {
        return i;
      }
    }
  }

  // Take center if available
  if (board[4] === null) {
    return 4;
  }

  // Take corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Take any available spot
  const availableSpots = board.map((cell, index) => cell === null ? index : null)
                             .filter(val => val !== null) as number[];
  
  if (availableSpots.length > 0) {
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
  }

  return 0; // Fallback
};

export const checkWinner = (board: (string | null)[]): string | null => {
  // Check rows
  for (let i = 0; i < 9; i += 3) {
    if (board[i] && board[i] === board[i + 1] && board[i] === board[i + 2]) {
      return board[i];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
      return board[i];
    }
  }

  // Check diagonals
  if (board[0] && board[0] === board[4] && board[0] === board[8]) {
    return board[0];
  }
  if (board[2] && board[2] === board[4] && board[2] === board[6]) {
    return board[2];
  }

  // Check for tie
  if (board.every(cell => cell !== null)) {
    return 'tie';
  }

  return null;
};