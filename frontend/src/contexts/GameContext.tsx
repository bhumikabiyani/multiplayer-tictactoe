import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getBotMove, checkWinner } from '../utils/botLogic';

export interface GameState {
  board: string[];
  currentPlayer: 'X' | 'O';
  winner: string | null;
  gameId: string | null;
  playerId: string | null;
  playerSymbol: 'X' | 'O' | null;
  isConnected: boolean;
  isWaitingForPlayer: boolean;
  opponentId: string | null;
  gameMode: 'multiplayer' | 'bot' | null;
  isPlayingWithBot: boolean;
}

type GameAction =
  | { type: 'MAKE_MOVE'; payload: { index: number; player: string } }
  | { type: 'SET_WINNER'; payload: string }
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_ID'; payload: string }
  | { type: 'SET_PLAYER_ID'; payload: string }
  | { type: 'SET_PLAYER_SYMBOL'; payload: 'X' | 'O' }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_WAITING'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: string }
  | { type: 'UPDATE_BOARD'; payload: string[] }
  | { type: 'SET_CURRENT_PLAYER'; payload: 'X' | 'O' }
  | { type: 'SET_GAME_MODE'; payload: 'multiplayer' | 'bot' | null }
  | { type: 'SET_BOT_PLAYING'; payload: boolean };

const initialState: GameState = {
  board: Array(9).fill(""),
  currentPlayer: 'X',
  winner: null,
  gameId: null,
  playerId: null,
  playerSymbol: null,
  isConnected: false,
  isWaitingForPlayer: false,
  opponentId: null,
  gameMode: null,
  isPlayingWithBot: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE':
      const newBoard = [...state.board];
      newBoard[action.payload.index] = action.payload.player;
      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
      };
    case 'SET_WINNER':
      return { ...state, winner: action.payload };
    case 'RESET_GAME':
      return {
        ...state,
        board: Array(9).fill(""),
        currentPlayer: 'X',
        winner: null,
      };
    case 'SET_GAME_ID':
      return { ...state, gameId: action.payload };
    case 'SET_PLAYER_ID':
      return { ...state, playerId: action.payload };
    case 'SET_PLAYER_SYMBOL':
      return { ...state, playerSymbol: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_WAITING':
      return { ...state, isWaitingForPlayer: action.payload };
    case 'SET_OPPONENT':
      return { ...state, opponentId: action.payload };
    case 'UPDATE_BOARD':
      return { ...state, board: action.payload };
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    case 'SET_BOT_PLAYING':
      return { ...state, isPlayingWithBot: action.payload };
    default:
      console.log('Unknown action type:', (action as any).type);
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  makeMove: (index: number) => void;
  joinGame: () => void;
  resetGame: () => void;
  startBotGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const providerId = React.useRef(Math.random().toString(36).substring(2, 8));
  
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const playerIdRef = React.useRef<string | null>(null);
  const gameModeRef = React.useRef<'multiplayer' | 'bot' | null>(null);
  const playerSymbolRef = React.useRef<'X' | 'O' | null>(null);
  const gameIdRef = React.useRef<string | null>(null);

  const connectWebSocket = () => {
    // Prevent duplicate connections
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping...');
      return;
    }
    
    const host = process.env.REACT_APP_WS_HOST || "localhost";
    const port = process.env.REACT_APP_WS_PORT || "7350";
    const useSSL = process.env.REACT_APP_WS_USE_SSL === "true";
    
    const protocol = useSSL ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}${port !== "80" && port !== "443" ? `:${port}` : ""}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      dispatch({ type: 'SET_CONNECTED', payload: true });
      
      // Auto-join game if in multiplayer mode
      setTimeout(() => {
        if (state.gameMode === 'multiplayer' && !state.gameId) {
          console.log('Auto-looking for games after connection...');
          websocket.send(JSON.stringify({ type: "list_games" }));
        }
      }, 500);
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        switch (data.type) {
          case 'connected':
            console.log('Server assigned player ID:', data.playerId);
            playerIdRef.current = data.playerId;
            dispatch({ type: 'SET_PLAYER_ID', payload: data.playerId });
            
            // Auto-join game if in multiplayer mode
            if (gameModeRef.current === 'multiplayer' && !gameIdRef.current) {
              console.log('Auto-looking for games after getting player ID...');
              setTimeout(() => {
                if (websocket.readyState === WebSocket.OPEN) {
                  websocket.send(JSON.stringify({ type: "list_games" }));
                }
              }, 100);
            }
            break;
            
          case 'games_list':
            console.log('Available games:', data.games);
            if (data.games.length > 0) {
              // Join first available game
              console.log('Joining existing game:', data.games[0].id);
              websocket.send(JSON.stringify({
                type: "join_game",
                gameId: data.games[0].id
              }));
            } else {
              // No games available, create new one
              console.log('No games available, creating new game');
              websocket.send(JSON.stringify({ type: "create_game" }));
            }
            break;
            
          case 'game_created':
            console.log('Game created:', data.gameId);
            gameIdRef.current = data.gameId;
            dispatch({ type: 'SET_GAME_ID', payload: data.gameId });
            dispatch({ type: 'SET_WAITING', payload: true });
            dispatch({ type: 'SET_PLAYER_SYMBOL', payload: 'X' }); // Creator is always X
            playerSymbolRef.current = 'X';
            // Don't set current player yet - wait for second player
            break;
            
          case 'game_started':
            console.log('Game started:', data.game);
            console.log('My player ID (ref):', playerIdRef.current);
            console.log('My player ID (state):', state.playerId);
            console.log('Players in game:', data.game.players);
            
            // Update game ID ref for joined games
            gameIdRef.current = data.game.id;
            
            dispatch({ type: 'SET_GAME_ID', payload: data.game.id });
            dispatch({ type: 'SET_WAITING', payload: false });
            dispatch({ type: 'UPDATE_BOARD', payload: data.game.board });
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.game.currentPlayer === 0 ? 'X' : 'O' });
            
            // Use ref for reliable player ID
            const currentPlayerId = playerIdRef.current || state.playerId;
            const myPlayerIndex = data.game.players.indexOf(currentPlayerId);
            console.log('My player index:', myPlayerIndex);
            const mySymbol = myPlayerIndex === 0 ? 'X' : 'O';
            console.log('Setting my symbol to:', mySymbol);
            playerSymbolRef.current = mySymbol;
            dispatch({ type: 'SET_PLAYER_SYMBOL', payload: mySymbol });
            break;
            
          case 'move_made':
            console.log('Move made:', data);
            console.log('Updated board:', data.game.board);
            console.log('Current player index:', data.game.currentPlayer);
            console.log('My player symbol (state):', state.playerSymbol);
            console.log('My player symbol (ref):', playerSymbolRef.current);
            
            const boardWithSymbols = data.game.board.map((cell: string | null) => cell || "");
            dispatch({ type: 'UPDATE_BOARD', payload: boardWithSymbols });
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.game.currentPlayer === 0 ? 'X' : 'O' });
            
            const newCurrentPlayer = data.game.currentPlayer === 0 ? 'X' : 'O';
            const currentPlayerSymbol = playerSymbolRef.current || state.playerSymbol;
            
            if (data.game.winner) {
              if (data.game.winner === 'draw') {
                dispatch({ type: 'SET_WINNER', payload: 'Draw' });
              } else {
                dispatch({ type: 'SET_WINNER', payload: data.game.winner });
              }
            }
            break;
            
          case 'player_disconnected':
            console.log('Player disconnected');
            dispatch({ type: 'SET_WAITING', payload: true });
            break;
            
          case 'error':
            console.error('Server error:', data.message);
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      dispatch({ type: 'SET_CONNECTED', payload: false });
      setWs(null);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setWs(websocket);
  };

  const makeMove = (index: number) => {
    console.log('makeMove called:', { 
      index, 
      currentBoard: state.board, 
      currentPlayer: state.currentPlayer, 
      playerSymbol: state.playerSymbol,
      playerSymbolRef: playerSymbolRef.current,
      isWaitingForPlayer: state.isWaitingForPlayer,
      winner: state.winner
    });
    
    // Use refs for validation since state might be stale
    const currentPlayerSymbol = playerSymbolRef.current;
    
    if ((state.board[index] && state.board[index] !== "") || state.winner || !currentPlayerSymbol) {
      console.log('Move blocked - cell occupied, game over, or no player symbol:', {
        cellOccupied: state.board[index] !== "",
        cellValue: state.board[index],
        winner: state.winner,
        playerSymbol: currentPlayerSymbol
      });
      return;
    }
    
    if (state.currentPlayer !== currentPlayerSymbol) {
      console.log('Move blocked - not your turn:', {
        currentPlayer: state.currentPlayer,
        playerSymbol: currentPlayerSymbol
      });
      return;
    }

    if (state.isPlayingWithBot) {
      // Local bot game logic - use ref for reliable player symbol
      const playerSymbol = currentPlayerSymbol!;
      dispatch({ type: 'MAKE_MOVE', payload: { index, player: playerSymbol } });
      
      // Check for winner after player move
      const newBoard = [...state.board];
      newBoard[index] = playerSymbol;
      const winner = checkWinner(newBoard);
      
      if (winner) {
        dispatch({ type: 'SET_WINNER', payload: winner });
        return;
      }
      
      // Bot's turn
      setTimeout(() => {
        const botSymbol = playerSymbol === 'X' ? 'O' : 'X';
        const botMoveIndex = getBotMove(newBoard, botSymbol);
        
        dispatch({ type: 'MAKE_MOVE', payload: { index: botMoveIndex, player: botSymbol } });
        
        // Check for winner after bot move
        const finalBoard = [...newBoard];
        finalBoard[botMoveIndex] = botSymbol;
        const finalWinner = checkWinner(finalBoard);
        
        if (finalWinner) {
          dispatch({ type: 'SET_WINNER', payload: finalWinner });
        }
      }, 500);
      
      return;
    }

    // Multiplayer game logic
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected');
      return;
    }

    try {
      const moveData = {
        type: "make_move",
        gameId: gameIdRef.current || state.gameId,
        position: index
      };
      console.log('Sending move:', moveData);
      ws.send(JSON.stringify(moveData));
    } catch (error) {
      console.error('Failed to send move:', error);
    }
  };

  const joinGame = () => {
    dispatch({ type: 'SET_GAME_MODE', payload: 'multiplayer' });
    dispatch({ type: 'SET_BOT_PLAYING', payload: false });
    gameModeRef.current = 'multiplayer';
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      return;
    }

    // Try to join existing game first, then create if none available
    try {
      console.log('Looking for available games...');
      ws.send(JSON.stringify({ type: "list_games" }));
    } catch (error) {
      console.error('Failed to list games:', error);
    }
  };

  const startBotGame = () => {
    dispatch({ type: 'SET_GAME_MODE', payload: 'bot' });
    dispatch({ type: 'SET_BOT_PLAYING', payload: true });
    dispatch({ type: 'SET_PLAYER_SYMBOL', payload: 'X' });
    dispatch({ type: 'SET_CONNECTED', payload: true });
    dispatch({ type: 'SET_WAITING', payload: false });
    dispatch({ type: 'RESET_GAME' });
  };

  const resetGame = () => {
    console.log('resetGame called, isPlayingWithBot:', state.isPlayingWithBot);
    
    if (state.isPlayingWithBot) {
      // Reset local bot game
      console.log('Resetting bot game');
      dispatch({ type: 'RESET_GAME' });
      return;
    }

    // Reset multiplayer game
    if (!ws || ws.readyState !== WebSocket.OPEN || !state.gameId) {
      console.log('No WebSocket connection or game ID available for reset');
      return;
    }
    
    try {
      const resetData = {
        type: "create_game" // Create a new game instead of resetting
      };
      console.log('Creating new game:', resetData);
      ws.send(JSON.stringify(resetData));
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, makeMove, joinGame, resetGame, startBotGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};