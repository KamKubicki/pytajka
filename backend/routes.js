const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { GameSession, gameSessions, questionsDatabase, gameQuestions, usedQuestionsHistory } = require('./game');
const { getLocalIP } = require('./utils');
const { validateSessionId } = require('./validation');

router.post('/session/create', (req, res) => {
  try {
    // Limit number of active sessions
    if (gameSessions.size >= 100) {
      return res.status(429).json({ error: 'Too many active sessions. Please try again later.' });
    }
    
    let sessionId;
    let attempts = 0;
    
    // Ensure unique session ID
    do {
      sessionId = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
    } while (gameSessions.has(sessionId) && attempts < 10);
    
    if (attempts >= 10) {
      return res.status(500).json({ error: 'Failed to generate unique session ID' });
    }
    
    const session = new GameSession(sessionId);
    gameSessions.set(sessionId, session);
    
    console.log(`Created new session ${sessionId}. Active sessions: ${gameSessions.size}`);
    res.json({ sessionId, status: 'created' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/session/:sessionId/qr', async (req, res) => {
  try {
    const sessionId = validateSessionId(req.params.sessionId);
    const session = gameSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const localIP = getLocalIP();
    const joinUrl = `http://${localIP}:3002/join/${sessionId}`;
    const qrCode = await QRCode.toDataURL(joinUrl);
    res.json({ qrCode, joinUrl, localIP });
  } catch (error) {
    if (error.message.includes('format')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

router.get('/session/:sessionId', (req, res) => {
  try {
    const sessionId = validateSessionId(req.params.sessionId);
    const session = gameSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.updateActivity();
    
    res.json({
      sessionId: session.id,
      status: session.status,
      playerCount: session.players.size,
      players: session.getPlayersArray(),
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });
  } catch (error) {
    if (error.message.includes('format')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
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

router.get('/admin/questions/pool', (req, res) => {
  try {
    const totalQuestions = gameQuestions.length;
    const usedQuestions = usedQuestionsHistory.size;
    const availableQuestions = totalQuestions - usedQuestions;
    
    res.json({
      totalQuestions,
      usedQuestions,
      availableQuestions,
      usagePercentage: Math.round((usedQuestions / totalQuestions) * 100),
      activeSessions: gameSessions.size,
      questionHistory: Array.from(usedQuestionsHistory).slice(-20) // Last 20 used question IDs
    });
  } catch (error) {
    console.error('Error getting question pool status:', error);
    res.status(500).json({ error: 'Failed to get question pool status' });
  }
});

router.get('/admin/questions/duplicates', (req, res) => {
  try {
    const allIds = gameQuestions.map(q => q.id);
    const uniqueIds = new Set(allIds);
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    const duplicateGroups = {};
    
    duplicates.forEach(id => {
      if (!duplicateGroups[id]) {
        duplicateGroups[id] = gameQuestions.filter(q => q.id === id);
      }
    });
    
    res.json({
      totalQuestions: allIds.length,
      uniqueQuestions: uniqueIds.size,
      duplicateIds: [...new Set(duplicates)],
      duplicateCount: duplicates.length,
      duplicateGroups: Object.keys(duplicateGroups).length > 0 ? duplicateGroups : null
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
});

router.post('/admin/test/mark-questions-used', (req, res) => {
  try {
    const { count = 10 } = req.body;
    const { markQuestionsAsUsed } = require('./game');
    
    // Get first N questions and mark them as used for testing
    const questionsToMark = gameQuestions.slice(0, count);
    markQuestionsAsUsed(questionsToMark);
    
    res.json({
      message: `Marked ${questionsToMark.length} questions as used for testing`,
      markedQuestions: questionsToMark.map(q => q.id)
    });
  } catch (error) {
    console.error('Error marking questions as used:', error);
    res.status(500).json({ error: 'Failed to mark questions as used' });
  }
});

module.exports = router;