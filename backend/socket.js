const { v4: uuidv4 } = require('uuid');
const { gameSessions, gameQuestions, selectFreshQuestions } = require('./game');
const { validateSessionId, validatePlayerName, validateAvatar, validateAnswer, validateGameSettings } = require('./validation');

function initializeSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        // Allow localhost with any port for development (HTTP and HTTPS)
        if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
          return callback(null, true);
        }
        
        // Allow local network IPs with development ports (HTTP and HTTPS)
        if (/^https?:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) || 
            /^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin)) {
          return callback(null, true);
        }
        
        // Allow localhost without port (for same-origin requests)
        if (/^https?:\/\/(localhost|127\.0\.0\.1)$/.test(origin)) {
          return callback(null, true);
        }
        
        console.log('Socket CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e6, // 1MB limit
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Rate limiting for socket connections - track requests and last activity
  const socketRequestCounts = new Map();
  const SOCKET_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const SOCKET_RATE_LIMIT_MAX_REQUESTS = 50; // 50 requests per minute per socket
  const SOCKET_CLEANUP_TIMEOUT = 10 * 60 * 1000; // Clean up sockets after 10 minutes of inactivity

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Initialize rate limiting for this socket with lastActivity timestamp
    socketRequestCounts.set(socket.id, { requests: [], lastActivity: Date.now() });
    
    // Rate limiting middleware for socket events
    const rateLimitCheck = (eventName) => {
      const now = Date.now();
      const socketData = socketRequestCounts.get(socket.id);
      if (!socketData) return false;
      
      const requests = socketData.requests.filter(timestamp => now - timestamp < SOCKET_RATE_LIMIT_WINDOW);
      
      if (requests.length >= SOCKET_RATE_LIMIT_MAX_REQUESTS) {
        socket.emit('rate-limit-exceeded', { message: 'Too many requests' });
        return false;
      }
      
      requests.push(now);
      socketData.requests = requests;
      socketData.lastActivity = now;
      socketRequestCounts.set(socket.id, socketData);
      return true;
    };

    socket.on('host-join', (data) => {
      if (!rateLimitCheck('host-join')) return;
      
      try {
        const { sessionId } = data;
        const validatedSessionId = validateSessionId(sessionId);
        const session = gameSessions.get(validatedSessionId);
        
        if (session) {
          session.hostSocket = socket.id;
          session.updateActivity();
          socket.join(validatedSessionId);
          socket.emit('host-joined', { sessionId: validatedSessionId, session: session });
        } else {
          socket.emit('join-error', { message: 'Session not found' });
        }
      } catch (error) {
        socket.emit('join-error', { message: error.message });
      }
    });

    socket.on('player-join', (data) => {
      if (!rateLimitCheck('player-join')) return;
      
      try {
        const { sessionId, playerName, avatar } = data;
        const validatedSessionId = validateSessionId(sessionId);
        const validatedPlayerName = validatePlayerName(playerName);
        const validatedAvatar = validateAvatar(avatar);
        
        const session = gameSessions.get(validatedSessionId);
        
        if (!session) {
          socket.emit('join-error', { message: 'Session not found' });
          return;
        }
        
        if (session.status !== 'lobby') {
          socket.emit('join-error', { message: 'Game already started' });
          return;
        }
        
        // Check for duplicate names
        const existingNames = Array.from(session.players.values()).map(p => p.name.toLowerCase());
        if (existingNames.includes(validatedPlayerName.toLowerCase())) {
          socket.emit('join-error', { message: 'Nazwa gracza jest już zajęta' });
          return;
        }
        
        // Limit number of players
        if (session.players.size >= 20) {
          socket.emit('join-error', { message: 'Gra jest pełna (maksymalnie 20 graczy)' });
          return;
        }
        
        const playerId = uuidv4();
        session.addPlayer(playerId, {
          id: playerId,
          name: validatedPlayerName,
          avatar: validatedAvatar,
          socketId: socket.id
        });
        
        session.updateActivity();
        socket.join(validatedSessionId);
        socket.playerId = playerId;
        socket.sessionId = validatedSessionId;
        
        socket.emit('player-joined', { playerId, sessionId: validatedSessionId });
        
        io.to(validatedSessionId).emit('player-list-updated', {
          players: session.getPlayersArray()
        });
      } catch (error) {
        socket.emit('join-error', { message: error.message });
      }
    });

    socket.on('start-game', (data) => {
      if (!rateLimitCheck('start-game')) return;
      
      try {
        const { sessionId, settings } = data;
        const validatedSessionId = validateSessionId(sessionId);
        const validatedSettings = validateGameSettings(settings);
        const session = gameSessions.get(validatedSessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (session.hostSocket !== socket.id) {
          socket.emit('error', { message: 'Only host can start the game' });
          return;
        }
        
        if (session.players.size === 0) {
          socket.emit('error', { message: 'Cannot start game without players' });
          return;
        }
        
        if (validatedSettings) {
          session.rounds = validatedSettings.rounds || session.rounds;
          session.questionsPerRound = validatedSettings.questionsPerRound || session.questionsPerRound;
          session.totalQuestions = session.rounds * session.questionsPerRound;
          
          // Use fresh questions for new game settings
          session.shuffledQuestions = selectFreshQuestions(session.totalQuestions);
        }

        session.status = 'playing';
        session.updateActivity();
        io.to(validatedSessionId).emit('game-started');
        
        setTimeout(() => {
          session.startQuestion(io);
        }, 2000);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('player-answer', (data) => {
      if (!rateLimitCheck('player-answer')) return;
      
      try {
        const { sessionId, playerId, answer } = data;
        const validatedSessionId = validateSessionId(sessionId);
        const validatedAnswer = validateAnswer(answer);
        const session = gameSessions.get(validatedSessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (session.status !== 'playing') {
          socket.emit('error', { message: 'Game is not active' });
          return;
        }
        
        if (!session.players.has(playerId)) {
          socket.emit('error', { message: 'Player not found in session' });
          return;
        }
        
        // Prevent duplicate answers for the same question
        if (session.playerAnswers.has(playerId)) {
          socket.emit('error', { message: 'Answer already submitted' });
          return;
        }
        
        const answerTimestamp = Date.now();
        session.updateActivity();
        session.playerAnswers.set(playerId, {
          answer: validatedAnswer,
          timestamp: answerTimestamp
        });
        
        io.to(validatedSessionId).emit('player-answer-realtime', {
          playerId,
          answer: validatedAnswer,
          totalAnswers: session.playerAnswers.size,
          totalPlayers: session.players.size
        });
        
        if (session.playerAnswers.size >= session.players.size) {
          if (session.timer) {
            clearTimeout(session.timer);
            session.endQuestion(io);
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up rate limiting data for this socket
      socketRequestCounts.delete(socket.id);
      
      if (socket.sessionId && socket.playerId) {
        const session = gameSessions.get(socket.sessionId);
        if (session) {
          session.removePlayer(socket.playerId);
          session.updateActivity();
          
          // If host disconnects, notify players
          if (session.hostSocket === socket.id) {
            io.to(socket.sessionId).emit('host-disconnected');
            console.log(`Host disconnected from session ${socket.sessionId}`);
          }
          
          io.to(socket.sessionId).emit('player-list-updated', {
            players: session.getPlayersArray()
          });
          
          // Clean up session if no players left and no host
          if (session.players.size === 0 && session.hostSocket === socket.id) {
            console.log(`Cleaning up empty session ${socket.sessionId}`);
            session.cleanup();
            gameSessions.delete(socket.sessionId);
          }
        }
      }
    });
  });

  // Clean up socket rate limiting data every 5 minutes
  setInterval(() => {
    const now = Date.now();
    const SOCKET_CLEANUP_WINDOW = 5 * 60 * 1000; // 5 minutes for cleanup check
    
    socketRequestCounts.forEach((socketData, socketId) => {
      const timeSinceActivity = now - socketData.lastActivity;
      
      // Remove old requests outside the window
      const validRequests = socketData.requests.filter(timestamp => now - timestamp < SOCKET_RATE_LIMIT_WINDOW);
      
      // Clean up if no valid requests OR socket has been inactive for too long
      if (validRequests.length === 0 || timeSinceActivity > SOCKET_CLEANUP_TIMEOUT) {
        socketRequestCounts.delete(socketId);
        if (timeSinceActivity > SOCKET_CLEANUP_TIMEOUT) {
          console.log(`Cleaned up stale socket rate limit data: ${socketId} (inactive for ${Math.round(timeSinceActivity/60000)} min)`);
        }
      } else {
        socketData.requests = validRequests;
        socketRequestCounts.set(socketId, socketData);
      }
    });
  }, SOCKET_CLEANUP_WINDOW);

  return io;
}

module.exports = initializeSocket;