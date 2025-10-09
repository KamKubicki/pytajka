const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { GameSession, gameSessions, questionsDatabase } = require('./game');
const { getLocalIP } = require('./utils');

router.post('/session/create', (req, res) => {
  const sessionId = Math.floor(1000 + Math.random() * 9000).toString();
  const session = new GameSession(sessionId);
  gameSessions.set(sessionId, session);
  res.json({ sessionId, status: 'created' });
});

router.get('/session/:sessionId/qr', async (req, res) => {
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

router.get('/session/:sessionId', (req, res) => {
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

router.get('/questions/stats', (req, res) => {
  try {
    const categoriesStats = {};
    let totalQuestions = 0;
    
    Object.entries(questionsDatabase.categories || {}).forEach(([categoryKey, category]) => {
      const questionCount = category.questions ? category.questions.length : 0;
      categoriesStats[categoryKey] = {
        name: category.name,
        count: questionCount,
        icon: category.icon || '📚'
      };
      totalQuestions += questionCount;
    });
    
    res.json({
      totalQuestions,
      totalCategories: Object.keys(categoriesStats).length,
      categories: categoriesStats,
      gameSettings: questionsDatabase.gameSettings || {}
    });
  } catch (error) {
    console.error('Error getting questions stats:', error);
    res.status(500).json({ error: 'Failed to get questions stats' });
  }
});

module.exports = router;