import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Client } from '@heroiclabs/nakama-js';
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
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  client: Client | null;
  makeMove: (index: number) => void;
  joinGame: () => void;
  resetGame: () => void;
  startBotGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [client, setClient] = React.useState<Client | null>(null);
  const [socket, setSocket] = React.useState<any>(null);
  const [match, setMatch] = React.useState<any>(null);

  useEffect(() => {
    const host = process.env.REACT_APP_NAKAMA_HOST || "192.168.31.127";
    const port = process.env.REACT_APP_NAKAMA_PORT || "7350";
    const key = process.env.REACT_APP_NAKAMA_KEY || "defaultkey";
    const useSSL = process.env.REACT_APP_NAKAMA_USE_SSL === "true";
    
    console.log('Connecting to Nakama:', { host, port, useSSL });
    const nakamaClient = new Client(key, host, port, useSSL);
    setClient(nakamaClient);
  }, []);

  const makeMove = async (index: number) => {
    console.log('makeMove called:', { index, currentBoard: state.board, currentPlayer: state.currentPlayer, playerSymbol: state.playerSymbol, isWaiting: state.isWaitingForPlayer });
    if ((state.board[index] && state.board[index] !== "") || state.winner || !state.playerSymbol) {
      console.log('Move blocked - cell occupied or no player symbol');
      return;
    }
    if (state.currentPlayer !== state.playerSymbol) {
      console.log('Move blocked - not your turn');
      return;
    }

    if (state.isPlayingWithBot) {
      // Local bot game logic
      dispatch({ type: 'MAKE_MOVE', payload: { index, player: state.playerSymbol } });
      
      // Check for winner after player move
      const newBoard = [...state.board];
      newBoard[index] = state.playerSymbol;
      const winner = checkWinner(newBoard);
      
      if (winner) {
        dispatch({ type: 'SET_WINNER', payload: winner });
        return;
      }
      
      // Bot's turn
      setTimeout(() => {
        const botSymbol = state.playerSymbol === 'X' ? 'O' : 'X';
        const botMoveIndex = getBotMove(newBoard, botSymbol);
        
        dispatch({ type: 'MAKE_MOVE', payload: { index: botMoveIndex, player: botSymbol } });
        
        // Check for winner after bot move
        const finalBoard = [...newBoard];
        finalBoard[botMoveIndex] = botSymbol;
        const finalWinner = checkWinner(finalBoard);
        
        if (finalWinner) {
          dispatch({ type: 'SET_WINNER', payload: finalWinner });
        }
      }, 500); // Small delay for better UX
      
      return;
    }

    // Multiplayer game logic
    if (!socket || !match) {
      console.log('No socket or match available');
      return;
    }

    try {
      const moveData = {
        type: "move",
        position: index + 1 // Lua arrays are 1-indexed
      };
      console.log('Sending move:', moveData);
      await socket.sendMatchState(match.match_id, 1, JSON.stringify(moveData));
      console.log('Move sent successfully');
    } catch (error) {
      console.error('Failed to send move:', error);
    }
  };

  const joinGame = async () => {
    if (!client) return;

    try {
      console.log('Starting authentication...');
      const session = await client.authenticateDevice("device-id-" + Math.random());
      console.log('Authenticated with session:', session.user_id);
      dispatch({ type: 'SET_PLAYER_ID', payload: session.user_id || '' });
      
      const newSocket = client.createSocket();
      await newSocket.connect(session, true);
      setSocket(newSocket);
      
      // Set up socket event handlers
      newSocket.onmatchdata = (matchData: any) => {
        try {
          // Convert Uint8Array to string if needed
          const dataString = matchData.data instanceof Uint8Array 
            ? new TextDecoder().decode(matchData.data)
            : matchData.data;
          const data = JSON.parse(dataString);
        
        switch (data.type) {
          case 'player_joined':
            console.log('Player joined:', data);
            if (data.player_id === session.user_id) {
              console.log('Setting my symbol to:', data.symbol);
              dispatch({ type: 'SET_PLAYER_SYMBOL', payload: data.symbol });
            }
            if (data.players_count === 2) {
              dispatch({ type: 'SET_WAITING', payload: false });
            }
            break;
            
          case 'game_start':
            console.log('Game start received:', data);
            dispatch({ type: 'SET_WAITING', payload: false });
            dispatch({ type: 'UPDATE_BOARD', payload: data.board });
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.current_player });
            console.log('Game started, waiting set to false');
            break;
            
          case 'move_made':
            const newBoard = [...data.board];
            dispatch({ type: 'UPDATE_BOARD', payload: newBoard });
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.current_player });
            if (data.winner) {
              dispatch({ type: 'SET_WINNER', payload: data.winner });
            }
            break;
            
          case 'game_reset':
            console.log('Game reset received:', data);
            dispatch({ type: 'RESET_GAME' });
            dispatch({ type: 'UPDATE_BOARD', payload: data.board });
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.current_player });
            console.log('Game reset completed');
            break;
            
          case 'player_left':
            dispatch({ type: 'SET_WAITING', payload: true });
            break;
        }
        } catch (error) {
          console.warn('Failed to parse match data as JSON:', matchData.data, error);
          return;
        }
      };
      
      // Join matchmaker
      console.log('Adding to matchmaker...');
      await newSocket.addMatchmaker("*", 2, 2);
      console.log('Successfully added to matchmaker');
      
      newSocket.onmatchmakermatched = async (matched: any) => {
        console.log('Matchmaker matched!', matched);
        const joinedMatch = await newSocket.joinMatch(matched.match_id);
        console.log('Joined match:', joinedMatch);
        setMatch(joinedMatch);
        dispatch({ type: 'SET_GAME_ID', payload: matched.match_id });
        dispatch({ type: 'SET_WAITING', payload: false });
        console.log('Match joined, waiting set to false');
      };
      
      dispatch({ type: 'SET_CONNECTED', payload: true });
      dispatch({ type: 'SET_WAITING', payload: true });
    } catch (error) {
      console.error('Failed to connect:', error);
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

  const resetGame = async () => {
    console.log('resetGame called, isPlayingWithBot:', state.isPlayingWithBot);
    if (state.isPlayingWithBot) {
      // Reset local bot game
      console.log('Resetting bot game');
      dispatch({ type: 'RESET_GAME' });
      return;
    }

    // Reset multiplayer game
    if (!socket || !match) {
      console.log('No socket or match available for reset');
      return;
    }
    
    try {
      const resetData = {
        type: "reset_game"
      };
      console.log('Sending reset to server:', resetData);
      await socket.sendMatchState(match.match_id, 1, JSON.stringify(resetData));
      console.log('Reset sent successfully');
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, client, makeMove, joinGame, resetGame, startBotGame }}>
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