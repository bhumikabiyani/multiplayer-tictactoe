const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 7350;

// Game state storage
const games = new Map();
const players = new Map();

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', games: games.size, players: players.size }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createGame(gameId, playerId) {
  return {
    id: gameId,
    players: [playerId],
    board: Array(9).fill(null),
    currentPlayer: 0,
    status: 'waiting',
    winner: null,
    createdAt: Date.now()
  };
}

function broadcastToGame(gameId, message, excludePlayer = null) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.players.forEach(playerId => {
    if (playerId !== excludePlayer) {
      const playerWs = players.get(playerId);
      if (playerWs && playerWs.readyState === WebSocket.OPEN) {
        playerWs.send(JSON.stringify(message));
      }
    }
  });
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  return board.includes(null) ? null : 'draw';
}

wss.on('connection', (ws) => {
  const playerId = Math.random().toString(36).substring(2, 15);
  players.set(playerId, ws);
  
  console.log(`Player ${playerId} connected`);
  
  ws.send(JSON.stringify({
    type: 'connected',
    playerId: playerId
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'create_game':
          const gameId = generateGameId();
          const game = createGame(gameId, playerId);
          games.set(gameId, game);
          
          ws.send(JSON.stringify({
            type: 'game_created',
            gameId: gameId,
            game: game
          }));
          break;
          
        case 'join_game':
          const existingGame = games.get(message.gameId);
          if (!existingGame) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Game not found'
            }));
            return;
          }
          
          if (existingGame.players.length >= 2) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Game is full'
            }));
            return;
          }
          
          existingGame.players.push(playerId);
          existingGame.status = 'playing';
          
          // Notify both players
          broadcastToGame(message.gameId, {
            type: 'game_started',
            game: existingGame
          });
          break;
          
        case 'make_move':
          const gameToUpdate = games.get(message.gameId);
          if (!gameToUpdate) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Game not found'
            }));
            return;
          }
          
          const playerIndex = gameToUpdate.players.indexOf(playerId);
          if (playerIndex === -1) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'You are not in this game'
            }));
            return;
          }
          
          if (playerIndex !== gameToUpdate.currentPlayer) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Not your turn'
            }));
            return;
          }
          
          if (gameToUpdate.board[message.position] !== null) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Position already taken'
            }));
            return;
          }
          
          // Make the move
          gameToUpdate.board[message.position] = playerIndex === 0 ? 'X' : 'O';
          gameToUpdate.currentPlayer = 1 - gameToUpdate.currentPlayer;
          
          // Check for winner
          const winner = checkWinner(gameToUpdate.board);
          if (winner) {
            gameToUpdate.status = 'finished';
            gameToUpdate.winner = winner;
          }
          
          // Broadcast move to all players
          broadcastToGame(message.gameId, {
            type: 'move_made',
            game: gameToUpdate,
            position: message.position,
            player: playerIndex
          });
          break;
          
        case 'list_games':
          const availableGames = Array.from(games.values())
            .filter(g => g.status === 'waiting')
            .map(g => ({ id: g.id, players: g.players.length }));
          
          ws.send(JSON.stringify({
            type: 'games_list',
            games: availableGames
          }));
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    players.delete(playerId);
    
    // Remove player from games and clean up
    for (let [gameId, game] of games.entries()) {
      const playerIndex = game.players.indexOf(playerId);
      if (playerIndex !== -1) {
        if (game.players.length === 1) {
          // Remove empty game
          games.delete(gameId);
        } else {
          // Notify other player
          broadcastToGame(gameId, {
            type: 'player_disconnected',
            gameId: gameId
          }, playerId);
          
          // Remove game after disconnect
          setTimeout(() => {
            games.delete(gameId);
          }, 5000);
        }
        break;
      }
    }
  });
});

// Clean up old games periodically
setInterval(() => {
  const now = Date.now();
  for (let [gameId, game] of games.entries()) {
    if (now - game.createdAt > 30 * 60 * 1000) { // 30 minutes
      games.delete(gameId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tic-tac-toe server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});