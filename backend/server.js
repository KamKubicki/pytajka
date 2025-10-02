const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for local development
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: true // Allow all origins for local development
}));
app.use(express.json());

// Store game sessions
const gameSessions = new Map();

// Sample questions
const sampleQuestions = [
  {
    id: 1,
    question: "Która planeta jest najbliżej Słońca?",
    answers: ["Merkury", "Wenus", "Ziemia", "Mars"],
    correct: 0,
    category: "nauka"
  },
  {
    id: 2,
    question: "Kto napisał 'Lalka'?",
    answers: ["Adam Mickiewicz", "Bolesław Prus", "Henryk Sienkiewicz", "Juliusz Słowacki"],
    correct: 1,
    category: "literatura"
  },
  {
    id: 3,
    question: "W którym roku Polska wstąpiła do Unii Europejskiej?",
    answers: ["2002", "2003", "2004", "2005"],
    correct: 2,
    category: "historia"
  },
  {
    id: 4,
    question: "Która drużyna wygrała ostatnie Mistrzostwa Świata w piłce nożnej?",
    answers: ["Francja", "Argentyna", "Brazylia", "Niemcy"],
    correct: 1,
    category: "sport"
  },
  {
    id: 5,
    question: "Stolica Australii to:",
    answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct: 2,
    category: "geografia"
  }
];

// Game state management
class GameSession {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.status = 'lobby'; // lobby, playing, finished
    this.currentQuestion = null;
    this.questionStartTime = null;
    this.round = 0;
    this.hostSocket = null;
    this.questionIndex = 0;
    this.timer = null;
    this.playerAnswers = new Map();
  }

  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      ...playerData,
      score: 0,
      socketId: playerData.socketId
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getPlayersArray() {
    return Array.from(this.players.values());
  }

  startQuestion() {
    if (this.questionIndex < sampleQuestions.length) {
      const question = sampleQuestions[this.questionIndex];
      this.currentQuestion = question;
      this.playerAnswers.clear();
      
      console.log(`Starting question ${this.questionIndex + 1}:`, question.question);
      
      // Send preparation message first
      io.to(this.id).emit('question-prepare', {
        questionNumber: this.questionIndex + 1,
        totalQuestions: sampleQuestions.length
      });
      
      // Wait 5 seconds, then send actual question
      setTimeout(() => {
        io.to(this.id).emit('new-question', {
          question: {
            ...question,
            correct: undefined
          }
        });
        
        // Start 15-second timer for answers
        let timeLeft = 15;
        this.timer = setInterval(() => {
          timeLeft--;
          if (timeLeft <= 0) {
            clearInterval(this.timer);
            this.endQuestion();
          }
        }, 1000);
      }, 5000);
      
    } else {
      this.status = 'finished';
      io.to(this.id).emit('game-finished');
      console.log('Game finished for session:', this.id);
    }
  }

  endQuestion() {
    console.log('Question ended for session:', this.id);
    
    // Calculate scores
    const updatedPlayers = Array.from(this.players.values()).map(player => {
      const playerAnswer = this.playerAnswers.get(player.id);
      const isCorrect = playerAnswer === this.currentQuestion.correct;
      return {
        ...player,
        score: player.score + (isCorrect ? 100 : 0),
        lastAnswer: playerAnswer,
        lastCorrect: isCorrect
      };
    });
    
    // Update players in session
    updatedPlayers.forEach(player => {
      this.players.set(player.id, player);
    });
    
    // Send results
    io.to(this.id).emit('question-ended', {
      correctAnswer: this.currentQuestion.correct,
      updatedPlayers
    });
    
    // Send break state and next question after 5 seconds
    io.to(this.id).emit('question-break', {
      nextQuestionNumber: this.questionIndex + 2,
      totalQuestions: sampleQuestions.length
    });
    
    setTimeout(() => {
      this.questionIndex++;
      this.startQuestion();
    }, 5000);
  }
}

// Get local IP address
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Generate QR code for game session
app.get('/api/session/:sessionId/qr', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const localIP = getLocalIP();
    const joinUrl = `http://${localIP}:3002/join/${sessionId}`;
    const qrCode = await QRCode.toDataURL(joinUrl);
    res.json({ qrCode, joinUrl, localIP });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Create new game session
app.post('/api/session/create', (req, res) => {
  const sessionId = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
  const session = new GameSession(sessionId);
  gameSessions.set(sessionId, session);
  
  res.json({ sessionId, status: 'created' });
});

// Get session info
app.get('/api/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const session = gameSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.id,
    status: session.status,
    playerCount: session.players.size,
    players: session.getPlayersArray()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Host creates/joins game session
  socket.on('host-join', (data) => {
    const { sessionId } = data;
    const session = gameSessions.get(sessionId);
    
    console.log('Host joining:', sessionId, session ? 'found' : 'not found');
    
    if (session) {
      session.hostSocket = socket.id;
      socket.join(sessionId);
      socket.emit('host-joined', { sessionId, session: session });
      console.log('Host joined successfully:', sessionId);
    }
  });

  // Player joins game session
  socket.on('player-join', (data) => {
    const { sessionId, playerName, avatar } = data;
    const session = gameSessions.get(sessionId);
    
    console.log('Player joining:', { sessionId, playerName, avatar });
    console.log('Session exists:', session ? 'yes' : 'no');
    
    if (!session) {
      console.log('Session not found for:', sessionId);
      socket.emit('join-error', { message: 'Session not found' });
      return;
    }
    
    if (session.status !== 'lobby') {
      console.log('Game already started for:', sessionId);
      socket.emit('join-error', { message: 'Game already started' });
      return;
    }
    
    const playerId = uuidv4();
    session.addPlayer(playerId, {
      id: playerId,
      name: playerName,
      avatar: avatar,
      socketId: socket.id
    });
    
    socket.join(sessionId);
    socket.playerId = playerId;
    socket.sessionId = sessionId;
    
    console.log('Player added successfully:', { playerId, playerName });
    console.log('Total players in session:', session.players.size);
    
    socket.emit('player-joined', { playerId, sessionId });
    
    // Notify host and all players about new player
    io.to(sessionId).emit('player-list-updated', {
      players: session.getPlayersArray()
    });
    
    console.log('Sent player-list-updated to room:', sessionId);
  });

  // Start game
  socket.on('start-game', (data) => {
    const { sessionId } = data;
    const session = gameSessions.get(sessionId);
    
    console.log('Start game request:', { sessionId, hostSocket: session?.hostSocket, currentSocket: socket.id });
    
    if (session && session.hostSocket === socket.id) {
      session.status = 'playing';
      console.log('Game started, emitting to room:', sessionId);
      io.to(sessionId).emit('game-started');
      
      // Start first question after 2 seconds
      setTimeout(() => {
        session.startQuestion();
      }, 2000);
    } else {
      console.log('Cannot start game - invalid session or not host');
    }
  });

  // Player answer
  socket.on('player-answer', (data) => {
    const { sessionId, playerId, answer } = data;
    const session = gameSessions.get(sessionId);
    
    console.log('Player answer:', { sessionId, playerId, answer });
    
    if (session) {
      // Store answer
      session.playerAnswers.set(playerId, answer);
      console.log(`Player ${playerId} answered ${answer}. Total answers: ${session.playerAnswers.size}/${session.players.size}`);
      
      // Notify host about answer count
      if (session.hostSocket) {
        io.to(session.hostSocket).emit('player-answer', {
          playerId,
          answer,
          totalAnswers: session.playerAnswers.size,
          totalPlayers: session.players.size
        });
      }
      
      // If all players answered, end question early
      if (session.playerAnswers.size >= session.players.size) {
        console.log('All players answered, ending question early');
        if (session.timer) {
          clearInterval(session.timer);
          session.endQuestion();
        }
      }
    }
  });

  // These handlers are no longer needed - backend manages questions automatically

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.sessionId && socket.playerId) {
      const session = gameSessions.get(socket.sessionId);
      if (session) {
        session.removePlayer(socket.playerId);
        io.to(socket.sessionId).emit('player-list-updated', {
          players: session.getPlayersArray()
        });
      }
    }
  });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${getLocalIP()}:${PORT}`);
});