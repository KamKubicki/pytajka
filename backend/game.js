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
    
    files.forEach(file => {
      try {
        const filePath = path.join(questionsDir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Handle array of questions (most files)
        if (Array.isArray(fileData)) {
          fileData.forEach(question => {
            if (question.question && question.answers && question.correct !== undefined) {
              const category = determineCategory(question);
              question.source = file;
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
              category.questions.forEach(question => {
                question.source = file;
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

loadQuestionsFromDirectory();

const gameSessions = new Map();

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

    this.gameSettings = questionsDatabase.gameSettings || {};
    this.rounds = this.gameSettings.rounds || 5;
    this.questionsPerRound = this.gameSettings.questionsPerRound || 5;
    this.totalQuestions = this.rounds * this.questionsPerRound;
    
    this.shuffledQuestions = this.shuffleArray(gameQuestions).slice(0, this.totalQuestions);
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

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startQuestion(io) {
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

  endQuestion(io) {
    clearTimeout(this.timer);
    
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
    } else {
      setTimeout(() => {
        this.startQuestion(io);
      }, 3000);
    }
  }
}

module.exports = { GameSession, gameQuestions, questionsDatabase, gameSessions };