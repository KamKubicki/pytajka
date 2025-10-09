const { v4: uuidv4 } = require('uuid');
const { gameSessions, gameQuestions } = require('./game');

function initializeSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('host-join', (data) => {
      const { sessionId } = data;
      const session = gameSessions.get(sessionId);
      
      if (session) {
        session.hostSocket = socket.id;
        socket.join(sessionId);
        socket.emit('host-joined', { sessionId, session: session });
      }
    });

    socket.on('player-join', (data) => {
      const { sessionId, playerName, avatar } = data;
      const session = gameSessions.get(sessionId);
      
      if (!session) {
        socket.emit('join-error', { message: 'Session not found' });
        return;
      }
      
      if (session.status !== 'lobby') {
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
      
      socket.emit('player-joined', { playerId, sessionId });
      
      io.to(sessionId).emit('player-list-updated', {
        players: session.getPlayersArray()
      });
    });

    socket.on('start-game', (data) => {
      const { sessionId, settings } = data;
      const session = gameSessions.get(sessionId);
      
      if (session && session.hostSocket === socket.id) {
        if (settings) {
          session.rounds = settings.rounds;
          session.questionsPerRound = settings.questionsPerRound;
          session.totalQuestions = settings.rounds * settings.questionsPerRound;
          session.shuffledQuestions = session.shuffleArray(gameQuestions).slice(0, session.totalQuestions);
        }

        session.status = 'playing';
        io.to(sessionId).emit('game-started');
        
        setTimeout(() => {
          session.startQuestion(io);
        }, 2000);
      }
    });

    socket.on('player-answer', (data) => {
      const { sessionId, playerId, answer } = data;
      const session = gameSessions.get(sessionId);
      
      if (session) {
        const answerTimestamp = Date.now();
        session.playerAnswers.set(playerId, {
          answer,
          timestamp: answerTimestamp
        });
        
        io.to(sessionId).emit('player-answer-realtime', {
          playerId,
          answer,
          totalAnswers: session.playerAnswers.size,
          totalPlayers: session.players.size
        });
        
        if (session.playerAnswers.size >= session.players.size) {
          if (session.timer) {
            clearTimeout(session.timer);
            session.endQuestion(io);
          }
        }
      }
    });

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

  return io;
}

module.exports = initializeSocket;