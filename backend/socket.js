const { v4: uuidv4 } = require('uuid');
const { gameSessions, gameQuestions, selectFreshQuestions } = require('./game');
const { validateSessionId, validatePlayerName, validateAvatar, validateAnswer, validateGameSettings, validateCategoryKey, validatePlayerId } = require('./validation');

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
            /^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
            /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/.test(origin)) {
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
  const SOCKET_CLEANUP_WINDOW = 5 * 60 * 1000; // 5 minutes for cleanup check

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Initialize rate limiting for this socket with lastActivity timestamp
    socketRequestCounts.set(socket.id, { requests: [], lastActivity: Date.now() });
    
    // Rate limiting middleware for socket events
    const rateLimitCheck = (eventName) => {
      const now = Date.now();
      let socketData = socketRequestCounts.get(socket.id);
      if (!socketData) {
        // 🔧 Entry may have been removed by periodic cleanup - recreate instead of blocking the socket forever
        socketData = { requests: [], lastActivity: now };
        socketRequestCounts.set(socket.id, socketData);
      }
      
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
          // 🗳️ TV reconnect during category vote
          if (session.vote && session.vote.active) {
            socket.emit('category-vote-start', session.getVoteStartPayload());
            socket.emit('category-vote-update', session.getVoteUpdatePayload());
          }
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
        const { sessionId, playerName, avatar, previousPlayerId } = data;
        const validatedSessionId = validateSessionId(sessionId);
        const validatedPlayerName = validatePlayerName(playerName);
        const validatedAvatar = validateAvatar(avatar);
        
        const session = gameSessions.get(validatedSessionId);
        
        if (!session) {
          socket.emit('join-error', { message: 'Session not found' });
          return;
        }
        
        // 🔄 Reconnect: known previousPlayerId, or same name as a disconnected player
        // (or any same-name player once the game runs - old socket may not have timed out yet) -> reattach, score kept
        const byPreviousId = typeof previousPlayerId === 'string' ? session.players.get(previousPlayerId) : null;
        const byName = Array.from(session.players.values())
          .find(p => p.name.toLowerCase() === validatedPlayerName.toLowerCase());
        const existingPlayer = byPreviousId ||
          (byName && (byName.connected === false || session.status !== 'lobby') ? byName : null);
        if (existingPlayer) {
          session.players.set(existingPlayer.id, {
            ...existingPlayer,
            avatar: validatedAvatar,
            socketId: socket.id,
            connected: true
          });
          session.updateActivity();
          socket.join(validatedSessionId);
          socket.playerId = existingPlayer.id;
          socket.sessionId = validatedSessionId;
          console.log(`🔄 Player ${existingPlayer.name} reconnected to session ${validatedSessionId}`);
          
          socket.emit('player-joined', { playerId: existingPlayer.id, sessionId: validatedSessionId });
          if (session.status === 'playing') {
            socket.emit('game-started');
            // 🗳️ Reconnect during category vote -> resend vote with remaining time
            if (session.vote && session.vote.active) {
              socket.emit('category-vote-start', session.getVoteStartPayload());
            }
          }
          io.to(validatedSessionId).emit('player-list-updated', {
            players: session.getPlayersArray()
          });
          if (session.vote && session.vote.active) {
            io.to(validatedSessionId).emit('category-vote-update', session.getVoteUpdatePayload());
          }
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
        
        // 🔒 Prevent double start (double click / re-emit) -> parallel question loops
        if (session.status !== 'lobby') {
          socket.emit('error', { message: 'Game already started' });
          return;
        }
        
        if (session.players.size === 0) {
          socket.emit('error', { message: 'Cannot start game without players' });
          return;
        }
        
        if (validatedSettings) {
          session.rounds = validatedSettings.rounds || session.rounds;
          session.questionsPerRound = validatedSettings.questionsPerRound || session.questionsPerRound;
        }
        // Reset per-game state (clamped to available questions); questions are picked per round after the vote
        session.pickQuestions();
        if (session.totalQuestions === 0) {
          socket.emit('error', { message: 'Brak pytań w bazie' });
          return;
        }

        session.status = 'playing';
        session.updateActivity();
        io.to(validatedSessionId).emit('game-started');
        
        session.schedule(() => {
          session.startCategoryVote(io);
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
        
        // 🔒 Late answers (after time is up / during results) must not re-trigger endQuestion
        if (!session.questionActive) {
          socket.emit('error', { message: 'Question is not active' });
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
        
        // 🔒 Do not reveal the chosen answer before question-ended
        io.to(validatedSessionId).emit('player-answer-realtime', {
          playerId,
          totalAnswers: session.playerAnswers.size,
          totalPlayers: session.players.size
        });
        
        session.checkAllAnswered(io);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('category-vote', (data) => {
      if (!rateLimitCheck('category-vote')) return;
      
      try {
        const { sessionId, playerId, categoryKey } = data || {};
        const validatedSessionId = validateSessionId(sessionId);
        const validatedPlayerId = validatePlayerId(playerId);
        const validatedKey = validateCategoryKey(categoryKey);
        const session = gameSessions.get(validatedSessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (session.status !== 'playing') {
          socket.emit('error', { message: 'Game is not active' });
          return;
        }
        
        const errorMessage = session.castVote(io, validatedPlayerId, validatedKey);
        if (errorMessage) {
          socket.emit('error', { message: errorMessage });
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
        const player = session && session.players.get(socket.playerId);
        // Ignore if this socket was already replaced by a reconnect
        if (session && player && player.socketId === socket.id) {
          if (session.status === 'lobby') {
            session.removePlayer(socket.playerId);
          } else {
            // 🔌 Keep player + score so the phone can rejoin with the same name
            session.markPlayerDisconnected(socket.playerId);
            session.checkAllAnswered(io);
            session.checkAllVoted(io);
          }
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