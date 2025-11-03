import React from 'react';
import { GameProvider } from './contexts/GameContext';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="App">
        <header className="App-header">
          <h1>Multiplayer Tic-Tac-Toe</h1>
        </header>
        <main>
          <Game />
        </main>
      </div>
    </GameProvider>
  );
}

export default App;