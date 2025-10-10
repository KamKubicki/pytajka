const fs = require('fs');
const path = require('path');

let questionsDatabase = { categories: {} };
let gameQuestions = [];

const CATEGORY_MAPPING = {
  'sci_': 'nauka_polska',
  'tech_': 'nauka_polska', 
  'geo_world_': 'geografia_swiata',
  'geo_': 'geografia_polski',
  'hist_world_': 'historia_swiata',
  'hist_': 'historia_polski',
  'sport_': 'sport_polski',
  'cult_': 'kultura_polska',
  'art_': 'kultura_polska',
  'lit_': 'kultura_polska',
  'ent_': 'rozrywka_polska',
  'film_': 'rozrywka_polska',
  'music_': 'rozrywka_polska',
  'mus_': 'rozrywka_polska',
  'food_': 'nauka_polska',
  'med_': 'nauka_polska',
  'biz_': 'nauka_polska',
  'nat_': 'nauka_polska'
};

const CATEGORY_TEMPLATES = {
  'historia_polski': { name: 'Historia Polski', color: '#8B4513', icon: '🏛️', questions: [] },
  'geografia_polski': { name: 'Geografia Polski', color: '#228B22', icon: '🗺️', questions: [] },
  'kultura_polska': { name: 'Kultura Polska', color: '#9932CC', icon: '🎭', questions: [] },
  'sport_polski': { name: 'Sport Polski', color: '#FF4500', icon: '⚽', questions: [] },
  'nauka_polska': { name: 'Nauka i Wynalazki', color: '#4169E1', icon: '🔬', questions: [] },
  'rozrywka_polska': { name: 'Rozrywka Polska', color: '#FF1493', icon: '🎬', questions: [] },
  'geografia_swiata': { name: 'Geografia Świata', color: '#228B22', icon: '🌍', questions: [] }
};

function determineCategory(question) {
  const qId = question.id || '';
  const qText = (question.question || '').toLowerCase();
  
  for (const [prefix, category] of Object.entries(CATEGORY_MAPPING)) {
    if (qId.startsWith(prefix)) {
      return category;
    }
  }
  
  if (qText.includes('polska') || qText.includes('polsk')) {
    if (qText.includes('historia') || qText.includes('król') || qText.includes('wojna')) {
      return 'historia_polski';
    } else if (qText.includes('rzeka') || qText.includes('góra') || qText.includes('miasto')) {
      return 'geografia_polski';
    } else if (qText.includes('sport') || qText.includes('piłka')) {
      return 'sport_polski';
    } else {
      return 'kultura_polska';
    }
  }
  
  return 'nauka_polska';
}

function loadQuestionsFromDirectory() {
  try {
    const questionsDir = path.join(__dirname, '../questions');
    
    if (!fs.existsSync(questionsDir)) {
      console.warn('Questions directory not found:', questionsDir);
      return;
    }
    
    const files = fs.readdirSync(questionsDir).filter(file => file.endsWith('.json'));
    
    console.log(`📚 Found ${files.length} question files:`, files);
    
    gameQuestions = [];
    questionsDatabase.categories = { ...CATEGORY_TEMPLATES };
    const usedIds = new Set(); // Global tracking of used IDs
    
    files.forEach(file => {
      try {
        const filePath = path.join(questionsDir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Handle array of questions (most files)
        if (Array.isArray(fileData)) {
          fileData.forEach((question, index) => {
            if (question.question && question.answers && question.correct !== undefined) {
              const category = determineCategory(question);
              question.source = file;
              
              // Generate truly unique ID
              let uniqueId = question.id;
              
              // If no ID or empty, generate one
              if (!uniqueId || !uniqueId.trim()) {
                uniqueId = `${file.replace('.json', '')}_${index}`;
              }
              
              // Ensure global uniqueness by adding suffix if needed
              let finalId = uniqueId;
              let suffix = 1;
              while (usedIds.has(finalId)) {
                finalId = `${uniqueId}_${suffix}`;
                suffix++;
              }
              
              question.id = finalId;
              usedIds.add(finalId);
              
              questionsDatabase.categories[category].questions.push(question);
              gameQuestions.push({
                ...question,
                category: questionsDatabase.categories[category].name
              });
            }
          });
        } 
        // Handle structured object with categories (if any)
        else if (fileData.categories) {
          Object.values(fileData.categories).forEach(category => {
            if (category.questions) {
              category.questions.forEach((question, index) => {
                question.source = file;
                
                // Generate truly unique ID for structured format too
                let uniqueId = question.id;
                
                // If no ID or empty, generate one
                if (!uniqueId || !uniqueId.trim()) {
                  uniqueId = `${file.replace('.json', '')}_struct_${index}`;
                }
                
                // Ensure global uniqueness by adding suffix if needed
                let finalId = uniqueId;
                let suffix = 1;
                while (usedIds.has(finalId)) {
                  finalId = `${uniqueId}_${suffix}`;
                  suffix++;
                }
                
                question.id = finalId;
                usedIds.add(finalId);
                
                const categoryKey = determineCategory(question);
                questionsDatabase.categories[categoryKey].questions.push(question);
                gameQuestions.push({
                  ...question,
                  category: questionsDatabase.categories[categoryKey].name
                });
              });
            }
          });
        }
        
        console.log(`  ✅ Loaded ${file}: ${Array.isArray(fileData) ? fileData.length : 'structured'} questions`);
      } catch (fileError) {
        console.error(`  ❌ Error loading ${file}:`, fileError.message);
      }
    });
    
    // Remove empty categories
    Object.keys(questionsDatabase.categories).forEach(key => {
      if (questionsDatabase.categories[key].questions.length === 0) {
        delete questionsDatabase.categories[key];
      }
    });
    
    console.log(`🎯 Loaded ${gameQuestions.length} total questions from ${Object.keys(questionsDatabase.categories).length} categories`);
    console.log(`🔑 Generated ${usedIds.size} unique question IDs`);
    
    // Verify all IDs are unique
    const allIds = gameQuestions.map(q => q.id);
    const uniqueCheck = new Set(allIds);
    if (allIds.length === uniqueCheck.size) {
      console.log(`✅ All question IDs are unique!`);
    } else {
      console.warn(`⚠️  Found ${allIds.length - uniqueCheck.size} duplicate IDs after processing!`);
    }
    
    // Set game settings
    questionsDatabase.gameSettings = {
      showQuestionCountOnStartScreen: true,
      rounds: 5,
      questionsPerRound: 5,
      timePerQuestion: 15,
      categories: Object.keys(questionsDatabase.categories)
    };
    
    // Show category stats
    Object.entries(questionsDatabase.categories).forEach(([key, category]) => {
      console.log(`  ${category.icon} ${category.name}: ${category.questions.length} pytań`);
    });
    
  } catch (error) {
    console.error('Error loading questions from directory:', error.message);
    gameQuestions = [];
  }
}

const gameSessions = new Map();

// Global system to track used questions across sessions with persistence
const QUESTION_HISTORY_FILE = path.join(__dirname, '../.question_history.json');
const QUESTION_HISTORY_LIMIT = 200; // Remember last 200 questions
const MIN_QUESTIONS_POOL = 50; // Minimum questions left before reset

let usedQuestionsHistory = new Set();

loadQuestionsFromDirectory();
loadQuestionHistory();

// Load question history from file on startup
function loadQuestionHistory() {
  try {
    if (fs.existsSync(QUESTION_HISTORY_FILE)) {
      const historyData = JSON.parse(fs.readFileSync(QUESTION_HISTORY_FILE, 'utf8'));
      usedQuestionsHistory = new Set(historyData.usedQuestions || []);
      console.log(`📚 Loaded ${usedQuestionsHistory.size} used questions from history file`);
    }
  } catch (error) {
    console.error('Error loading question history:', error);
    usedQuestionsHistory = new Set();
  }
}

// Save question history to file
function saveQuestionHistory() {
  try {
    const historyData = {
      usedQuestions: Array.from(usedQuestionsHistory),
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(QUESTION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
  } catch (error) {
    console.error('Error saving question history:', error);
  }
}

// Smart question selection avoiding recently used questions
function selectFreshQuestions(requestedCount) {
  const availableQuestions = gameQuestions.filter(q => !usedQuestionsHistory.has(q.id));
  
  console.log(`Question pool status: ${availableQuestions.length}/${gameQuestions.length} fresh questions available`);
  
  // If we don't have enough fresh questions, reset history but keep some recent ones
  if (availableQuestions.length < Math.max(requestedCount, MIN_QUESTIONS_POOL)) {
    console.log('⚠️  Low fresh questions! Resetting history but keeping most recent 50 questions');
    
    // Convert Set to Array, keep last 50, clear and re-add them
    const recentQuestions = Array.from(usedQuestionsHistory).slice(-50);
    usedQuestionsHistory.clear();
    recentQuestions.forEach(qId => usedQuestionsHistory.add(qId));
    
    // Recalculate available questions
    const freshQuestions = gameQuestions.filter(q => !usedQuestionsHistory.has(q.id));
    console.log(`After reset: ${freshQuestions.length}/${gameQuestions.length} fresh questions available`);
    
    return shuffleArray(freshQuestions).slice(0, requestedCount);
  }
  
  return shuffleArray(availableQuestions).slice(0, requestedCount);
}

// Standalone shuffle function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Mark questions as used
function markQuestionsAsUsed(questions) {
  questions.forEach(q => {
    if (q.id) {
      usedQuestionsHistory.add(q.id);
    }
  });
  
  // Limit history size
  if (usedQuestionsHistory.size > QUESTION_HISTORY_LIMIT) {
    const questionsArray = Array.from(usedQuestionsHistory);
    const toRemove = questionsArray.slice(0, usedQuestionsHistory.size - QUESTION_HISTORY_LIMIT);
    toRemove.forEach(qId => usedQuestionsHistory.delete(qId));
  }
  
  // Save to file
  saveQuestionHistory();
  
  console.log(`📚 Marked ${questions.length} questions as used. History size: ${usedQuestionsHistory.size}`);
}

class GameSession {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.status = 'lobby';
    this.currentQuestion = null;
    this.questionStartTime = null;
    this.hostSocket = null;
    this.questionIndex = 0;
    this.timer = null;
    this.playerAnswers = new Map();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.inactivityTimer = null;

    this.gameSettings = questionsDatabase.gameSettings || {};
    this.rounds = this.gameSettings.rounds || 5;
    this.questionsPerRound = this.gameSettings.questionsPerRound || 5;
    this.totalQuestions = this.rounds * this.questionsPerRound;
    
    // Use smart question selection to avoid recently used questions
    this.shuffledQuestions = selectFreshQuestions(this.totalQuestions);
    this.startInactivityTimer();
    
    console.log(`🎮 Session ${id} created with ${this.shuffledQuestions.length} fresh questions`);
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

  startQuestion(io) {
    this.updateActivity();
    if (this.questionIndex < this.totalQuestions) {
      const question = this.shuffledQuestions[this.questionIndex];
      this.currentQuestion = question;
      this.playerAnswers.clear();
      this.questionStartTime = Date.now();
      
      io.to(this.id).emit('new-question', {
        question: {
          ...question,
          correct: undefined
        }
      });
      
      this.timer = setTimeout(() => {
        this.endQuestion(io);
      }, 15000);
    } else {
      this.status = 'finished';
      io.to(this.id).emit('game-finished');
    }
  }

  startInactivityTimer() {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      console.log(`Session ${this.id} expired due to inactivity`);
      this.cleanup();
      gameSessions.delete(this.id);
    }, 30 * 60 * 1000); // 30 minutes
  }

  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  updateActivity() {
    this.lastActivity = Date.now();
    this.startInactivityTimer();
  }

  cleanup() {
    this.clearInactivityTimer();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.players.clear();
    this.playerAnswers.clear();
  }

  endQuestion(io) {
    clearTimeout(this.timer);
    this.updateActivity();
    
    const updatedPlayers = Array.from(this.players.values()).map(player => {
      const playerAnswerData = this.playerAnswers.get(player.id);
      
      if (!playerAnswerData) {
        return { ...player, lastPoints: 0, lastCorrect: false };
      }
      
      const isCorrect = playerAnswerData.answer === this.currentQuestion.correct;
      let points = 0;
      if (isCorrect) {
        const responseTime = playerAnswerData.timestamp - this.questionStartTime;
        const timeBonus = Math.max(0, 100 - Math.floor(responseTime / 150));
        points = 100 + timeBonus;
      }
      
      return { ...player, score: player.score + points, lastPoints: points, lastCorrect: isCorrect };
    });

    updatedPlayers.forEach(player => {
      this.players.set(player.id, player);
    });

    io.to(this.id).emit('question-ended', {
      correctAnswer: this.currentQuestion.correct,
      updatedPlayers
    });

    this.questionIndex++;
    
    const isRoundEnd = this.questionIndex % this.questionsPerRound === 0;

    if (isRoundEnd && this.questionIndex < this.totalQuestions) {
      io.to(this.id).emit('round-end', { round: this.questionIndex / this.questionsPerRound });
      setTimeout(() => {
        this.startQuestion(io);
      }, 10000);
    } else if (this.questionIndex >= this.totalQuestions) {
      this.status = 'finished';
      
      // Mark all questions from this session as used
      markQuestionsAsUsed(this.shuffledQuestions);
      
      io.to(this.id).emit('game-finished');
      setTimeout(() => {
        console.log(`Cleaning up finished session ${this.id}`);
        this.cleanup();
        gameSessions.delete(this.id);
      }, 5 * 60 * 1000); // Clean up 5 minutes after game ends
    } else {
      setTimeout(() => {
        this.startQuestion(io);
      }, 3000);
    }
  }
}

// Cleanup old sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  const sessionsToDelete = [];
  
  gameSessions.forEach((session, sessionId) => {
    const age = now - session.createdAt;
    const timeSinceActivity = now - session.lastActivity;
    
    // Delete sessions older than 2 hours or inactive for 30 minutes
    if (age > 2 * 60 * 60 * 1000 || timeSinceActivity > 30 * 60 * 1000) {
      sessionsToDelete.push(sessionId);
    }
  });
  
  sessionsToDelete.forEach(sessionId => {
    const session = gameSessions.get(sessionId);
    if (session) {
      console.log(`Cleaning up expired session ${sessionId}`);
      session.cleanup();
      gameSessions.delete(sessionId);
    }
  });
  
  if (sessionsToDelete.length > 0) {
    console.log(`Cleaned up ${sessionsToDelete.length} expired sessions. Active sessions: ${gameSessions.size}`);
  }
}, 10 * 60 * 1000); // Run every 10 minutes

module.exports = { GameSession, gameQuestions, questionsDatabase, gameSessions, selectFreshQuestions, markQuestionsAsUsed, usedQuestionsHistory };