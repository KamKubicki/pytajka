import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JoinScreen from './components/JoinScreen';
import Game from './components/Game';

function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinScreen />} />
      <Route path="/join/:sessionId" element={<JoinScreen />} />
      <Route path="/game/:sessionId" element={<Game />} />
    </Routes>
  );
}

export default App;
