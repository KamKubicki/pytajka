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
  'geografia_swiata': { name: 'Geografia Świata', color: '#228B22', icon: '🌍', questions: [] },
  'historia_swiata': { name: 'Historia Świata', color: '#CD853F', icon: '🌎', questions: [] }
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
        
        console.log(`  🔍 Processing ${file}: ${Array.isArray(fileData) ? 'Array' : 'Object'} with ${Array.isArray(fileData) ? fileData.length : Object.keys(fileData).length} items`);
        
        // Handle array of questions (most files)
        if (Array.isArray(fileData)) {
          fileData.forEach((question, index) => {
            try {
              // 🔧 Accept numeric-string "correct" (e.g. "2"), reject out-of-range values
              if (typeof question.correct === 'string' && /^\d+$/.test(question.correct.trim())) {
                question.correct = Number(question.correct.trim());
              }
              if (question.question && Array.isArray(question.answers) && question.correct !== undefined &&
                  !(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.answers.length)) {
                console.error(`  ❌ Skipping question ${index} in ${file}: invalid "correct" (${JSON.stringify(question.correct)}) for ${question.answers.length} answers`);
                return;
              }
              if (question.question && Array.isArray(question.answers) && question.correct !== undefined) {
                let category = determineCategory(question);
                question.source = file;
                
                // Generate truly unique ID
                let uniqueId = question.id !== undefined && question.id !== null ? String(question.id) : '';
                
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
                
                // Ensure category exists
                if (!questionsDatabase.categories[category]) {
                  console.warn(`  ⚠️  Category ${category} doesn't exist for question ${finalId}, using nauka_polska instead`);
                  category = 'nauka_polska';
                }
                
                questionsDatabase.categories[category].questions.push(question);
                gameQuestions.push({
                  ...question,
                  category: questionsDatabase.categories[category].name
                });
              }
            } catch (questionError) {
              console.error(`  ❌ Error processing question ${index} in ${file}:`, questionError.message);
              console.error(`     Question data:`, JSON.stringify(question, null, 2));
            }
          });
        } 
        // Handle structured object with categories (if any)
        else if (fileData.categories) {
          Object.entries(fileData.categories).forEach(([categoryName, category]) => {
            try {
              if (category && category.questions) {
                category.questions.forEach((question, index) => {
                  try {
                    question.source = file;
                    
                    // Generate truly unique ID for structured format too
                    let uniqueId = question.id !== undefined && question.id !== null ? String(question.id) : '';
                    
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
                    
                    let categoryKey = determineCategory(question);
                    // Ensure category exists
                    if (!questionsDatabase.categories[categoryKey]) {
                      console.warn(`  ⚠️  Category ${categoryKey} doesn't exist for question ${finalId}, using nauka_polska instead`);
                      categoryKey = 'nauka_polska';
                    }
                    
                    questionsDatabase.categories[categoryKey].questions.push(question);
                    gameQuestions.push({
                      ...question,
                      category: questionsDatabase.categories[categoryKey].name
                    });
                  } catch (questionError) {
                    console.error(`  ❌ Error processing structured question ${index} in category ${categoryName} of ${file}:`, questionError.message);
                  }
                });
              } else {
                console.error(`  ❌ Category ${categoryName} in ${file} has no questions or is undefined`);
              }
            } catch (categoryError) {
              console.error(`  ❌ Error processing category ${categoryName} in ${file}:`, categoryError.message);
            }
          });
        }
        // Handle other object formats that might not have categories
        else if (typeof fileData === 'object' && !Array.isArray(fileData)) {
          console.log(`  ⚠️  Skipping ${file}: Unknown object format (not array, no categories)`);
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

    return ensureUniqueQuestions(shuffleArray(freshQuestions).slice(0, requestedCount));
  }

  return ensureUniqueQuestions(shuffleArray(availableQuestions).slice(0, requestedCount));
}

// Ensure all questions in the array are unique by ID
function ensureUniqueQuestions(questions) {
  const seen = new Set();
  const uniqueQuestions = [];

  for (const question of questions) {
    if (!seen.has(question.id)) {
      seen.add(question.id);
      uniqueQuestions.push(question);
    } else {
      console.warn(`⚠️  Duplicate question detected and removed: ${question.id}`);
    }
  }

  if (uniqueQuestions.length !== questions.length) {
    console.warn(`⚠️  Removed ${questions.length - uniqueQuestions.length} duplicate questions from selection`);
  }

  return uniqueQuestions;
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
    this.questionActive = false; // 🔒 true only while answers are accepted
    this.pendingTimers = []; // ⏱️ transition timers (results/round-end/next question)

    this.pickQuestions();

    this.startInactivityTimer();

    console.log(`🎮 Session ${id} created with ${this.shuffledQuestions.length} fresh unique questions`);
  }

  // Select questions for current settings; never plan more questions than we actually have
  pickQuestions() {
    const id = this.id;
    // Use smart question selection to avoid recently used questions
    this.shuffledQuestions = selectFreshQuestions(this.totalQuestions);

    // Fallback if not enough fresh questions - use all available questions
    if (this.shuffledQuestions.length < this.totalQuestions) {
      console.warn(`⚠️  Not enough fresh questions (${this.shuffledQuestions.length}/${this.totalQuestions}), using all available questions`);
      if (gameQuestions.length > 0) {
        // Shuffle all available questions and use as many as needed
        const shuffled = shuffleArray(gameQuestions);
        this.shuffledQuestions = ensureUniqueQuestions(shuffled.slice(0, this.totalQuestions));
      }
    }

    // Final validation - if still no questions, log error
    if (this.shuffledQuestions.length === 0) {
      console.error(`❌ Critical: No questions available for session ${id}. gameQuestions.length = ${gameQuestions.length}`);
    }

    // 🔧 Clamp so startQuestion/endQuestion never index past the selected questions
    if (this.shuffledQuestions.length < this.totalQuestions) {
      this.totalQuestions = this.shuffledQuestions.length;
    }

    // Track question IDs used in this session to ensure uniqueness
    this.usedQuestionIds = new Set(this.shuffledQuestions.map(q => q.id));

    // Verify all questions in session are unique
    if (this.shuffledQuestions.length !== this.usedQuestionIds.size) {
      console.warn(`⚠️  Session ${id}: Found duplicate questions! Expected ${this.shuffledQuestions.length}, got ${this.usedQuestionIds.size} unique`);
    }
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

  // Keep player (and score) during the game so the phone can reconnect
  markPlayerDisconnected(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.players.set(playerId, { ...player, connected: false, socketId: null });
    }
  }

  getConnectedPlayerCount() {
    return Array.from(this.players.values()).filter(p => p.connected !== false).length;
  }

  // End question early once every connected player has answered
  checkAllAnswered(io) {
    if (!this.questionActive) return;
    const connected = Array.from(this.players.values()).filter(p => p.connected !== false);
    if (connected.length > 0 && connected.every(p => this.playerAnswers.has(p.id))) {
      this.endQuestion(io);
    }
  }

  schedule(fn, delay) {
    const t = setTimeout(() => {
      this.pendingTimers = this.pendingTimers.filter(x => x !== t);
      if (gameSessions.get(this.id) !== this) return; // 🧹 session already cleaned up
      fn();
    }, delay);
    this.pendingTimers.push(t);
    return t;
  }

  getPlayersArray() {
    return Array.from(this.players.values());
  }

  // 🔧 Serializable snapshot - raw session holds Timeout objects (circular) which made
  // socket.io throw "Maximum call stack size exceeded" on 'host-joined'
  toJSON() {
    return {
      id: this.id,
      status: this.status,
      players: this.getPlayersArray(),
      hostSocket: this.hostSocket,
      questionIndex: this.questionIndex,
      rounds: this.rounds,
      questionsPerRound: this.questionsPerRound,
      totalQuestions: this.totalQuestions,
      gameSettings: this.gameSettings,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }

  startQuestion(io) {
    if (this.status !== 'playing') return; // 🔒 ignore stray transitions after game end
    this.updateActivity();
    if (this.questionIndex >= this.shuffledQuestions.length) {
      console.warn(`Session ${this.id}: No more questions available (index ${this.questionIndex}/${this.shuffledQuestions.length})`);
      this.status = 'finished';
      io.to(this.id).emit('game-finished');
      return;
    }
    
    if (this.questionIndex < this.totalQuestions) {
      const question = this.shuffledQuestions[this.questionIndex];
      this.currentQuestion = question;
      this.playerAnswers.clear();
      this.questionStartTime = Date.now();
      this.questionActive = true;
      
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
      this.timer = null;
    }
    this.questionActive = false;
    this.pendingTimers.forEach(t => clearTimeout(t));
    this.pendingTimers = [];
    this.players.clear();
    this.playerAnswers.clear();
  }

  endQuestion(io) {
    // 🔒 Guard against double end (timer + last answer race) -> double scoring / skipped questions
    if (!this.questionActive) return;
    this.questionActive = false;
    clearTimeout(this.timer);
    this.timer = null;
    this.updateActivity();

    const updatedPlayers = Array.from(this.players.values()).map(player => {
      const playerAnswerData = this.playerAnswers.get(player.id);

      if (!playerAnswerData) {
        return { ...player, lastPoints: 0, lastCorrect: false, lastAnswer: null, lastResponseTime: null, lastTimeBonus: 0 };
      }

      const isCorrect = playerAnswerData.answer === this.currentQuestion.correct;
      const responseTime = playerAnswerData.timestamp - this.questionStartTime;
      let points = 0;
      let timeBonus = 0;

      if (isCorrect) {
        timeBonus = Math.max(0, 100 - Math.floor(responseTime / 150));
        points = 100 + timeBonus;
      }

      return {
        ...player,
        score: player.score + points,
        lastPoints: points,
        lastCorrect: isCorrect,
        lastAnswer: playerAnswerData.answer,
        lastResponseTime: responseTime,
        lastTimeBonus: timeBonus
      };
    });

    updatedPlayers.forEach(player => {
      this.players.set(player.id, player);
    });

    io.to(this.id).emit('question-ended', {
      correctAnswer: this.currentQuestion.correct,
      updatedPlayers
    });

    // Show results summary screen with all details
    this.schedule(() => {
      io.to(this.id).emit('show-results-summary', {
        correctAnswer: this.currentQuestion.correct,
        updatedPlayers: updatedPlayers,
        questionData: this.currentQuestion
      });
    }, 1500); // Wait 1.5s for question-ended effects

    this.questionIndex++;

    const isRoundEnd = this.questionIndex % this.questionsPerRound === 0;

    if (isRoundEnd && this.questionIndex < this.totalQuestions) {
      // Show results for 5 seconds, then round summary for 10 seconds
      this.schedule(() => {
        io.to(this.id).emit('round-end', {
          round: this.questionIndex / this.questionsPerRound,
          players: updatedPlayers
        });
      }, 6500); // 1.5s + 5s for results

      this.schedule(() => {
        this.startQuestion(io);
      }, 16500); // 1.5s + 5s + 10s
    } else if (this.questionIndex >= this.totalQuestions) {
      this.status = 'finished';

      // Mark all questions from this session as used
      markQuestionsAsUsed(this.shuffledQuestions);

      this.schedule(() => {
        io.to(this.id).emit('game-finished');
      }, 6500); // Show results for 5 seconds before final screen

      this.schedule(() => {
        console.log(`Cleaning up finished session ${this.id}`);
        this.cleanup();
        gameSessions.delete(this.id);
      }, 5 * 60 * 1000); // Clean up 5 minutes after game ends
    } else {
      // Normal question transition - show results for 5 seconds
      this.schedule(() => {
        this.startQuestion(io);
      }, 6500); // 1.5s + 5s
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