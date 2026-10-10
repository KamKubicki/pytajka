const fs = require('fs');
const path = require('path');

let questionsDatabase = { categories: {} };
let gameQuestions = [];

// 🗂️ Category registry: key -> { name, color, icon, prefixes }.
// Question ids are matched by prefix (longest prefix wins, so order here does not matter).
// Colors are saturated and readable on the dark navy TV background (#0b1230).
const CATEGORY_REGISTRY = {
  'historia_polski':  { name: 'Historia Polski',        color: '#E8B04B', icon: '🏛️', prefixes: ['hist_'] },
  'historia_swiata':  { name: 'Historia Świata',        color: '#E07A2E', icon: '🌎', prefixes: ['hist_world_'] },
  'geografia_polski': { name: 'Geografia Polski',       color: '#4CD964', icon: '🗺️', prefixes: ['geo_'] },
  'geografia_swiata': { name: 'Geografia Świata',       color: '#1ABC9C', icon: '🌍', prefixes: ['geo_world_', 'ne_'] },
  'kultura_polska':   { name: 'Kultura i Literatura',   color: '#B36BFF', icon: '🎭', prefixes: ['cult_', 'art_', 'lit_'] },
  'sport_polski':     { name: 'Sport',                  color: '#FF5A36', icon: '🏅', prefixes: ['sport_'] },
  'pilka_nozna':      { name: 'Piłka nożna',            color: '#9BE15D', icon: '⚽', prefixes: ['foot_'] },
  'nauka_polska':     { name: 'Nauka',                  color: '#4D8DFF', icon: '🔬', prefixes: ['sci_', 'nat_'] },
  'technologia':      { name: 'Technologia i Internet', color: '#00C8FF', icon: '💻', prefixes: ['it_', 'tech_'] },
  'motoryzacja':      { name: 'Motoryzacja',            color: '#FF2E4C', icon: '🏎️', prefixes: ['moto_'] },
  'kosmos':           { name: 'Kosmos i Astronomia',    color: '#8A6CFF', icon: '🚀', prefixes: ['space_'] },
  'zwierzeta':        { name: 'Zwierzęta i Przyroda',   color: '#2ECC71', icon: '🐾', prefixes: ['zoo_'] },
  'kuchnia':          { name: 'Kuchnia i Jedzenie',     color: '#FF9F1C', icon: '🍕', prefixes: ['food_'] },
  'zdrowie':          { name: 'Ciało i Zdrowie',        color: '#FF6B9D', icon: '🩺', prefixes: ['med_'] },
  'biznes':           { name: 'Marki i Biznes',         color: '#F5D020', icon: '🏷️', prefixes: ['biz_', 'brand_'] },
  'rozrywka_polska':  { name: 'Popkultura i Gry',       color: '#FF3EA5', icon: '🎮', prefixes: ['ent_'] },
  'film':             { name: 'Film i Seriale',         color: '#FF7F6E', icon: '🎬', prefixes: ['film_'] },
  'muzyka':           { name: 'Muzyka',                 color: '#D25BFF', icon: '🎵', prefixes: ['mus_', 'music_'] },
  'bajki':            { name: 'Bajki i Dzieciństwo',    color: '#FF9AE0', icon: '🧸', prefixes: ['kids_'] },
  'prl':              { name: 'PRL i Lata 90.',         color: '#D4B82A', icon: '📼', prefixes: ['prl_'] },
  'jezyk':            { name: 'Język Polski',           color: '#5FD3F3', icon: '🔤', prefixes: ['lang_'] },
  'mitologia':        { name: 'Mitologia i Legendy',    color: '#FFE45C', icon: '⚡', prefixes: ['myth_'] },
  'militaria':        { name: 'Lotnictwo i Militaria',  color: '#A8C256', icon: '✈️', prefixes: ['mil_'] },
  'logika':           { name: 'Matematyka i Zagadki',   color: '#36E2B4', icon: '🧮', prefixes: ['math_'] }
};

// prefix -> category key, plus prefixes sorted longest-first (hist_world_ beats hist_, geo_world_ beats geo_)
const CATEGORY_MAPPING = {};
Object.entries(CATEGORY_REGISTRY).forEach(([key, cat]) => {
  cat.prefixes.forEach(prefix => { CATEGORY_MAPPING[prefix] = key; });
});
const CATEGORY_PREFIXES = Object.keys(CATEGORY_MAPPING).sort((a, b) => b.length - a.length);

const CATEGORY_TEMPLATES = {};
Object.entries(CATEGORY_REGISTRY).forEach(([key, { name, color, icon }]) => {
  CATEGORY_TEMPLATES[key] = { name, color, icon, questions: [] };
});

// Text fallback for questions whose id has no known prefix: first matching rule wins
const CATEGORY_KEYWORDS = [
  ['motoryzacja', ['samochod', 'samochód', 'silnik', 'formuł', 'rajd', 'motocykl', 'kierowc', 'skrzyni bieg']],
  ['technologia', ['komputer', 'internet', 'smartfon', 'aplikacj', 'procesor', 'google', 'microsoft', 'youtube', 'bajt', 'wi-fi']],
  ['kosmos', ['planet', 'kosmos', 'galaktyk', 'astronaut', 'orbit', 'nasa']],
  ['pilka_nozna', ['piłkarz', 'piłka nożna', 'piłce nożnej', 'mundial', 'liga mistrzów']],
  ['sport_polski', ['sport', 'olimpi', 'medal']],
  ['muzyka', ['piosenk', 'album', 'zespół muzycz', 'muzyk', 'kompozytor', 'singiel']],
  ['film', ['film', 'serial', 'reżyser', 'oscar']],
  ['kuchnia', ['potraw', 'kuchni', 'przepis']],
  ['zdrowie', ['ciała ludzk', 'ciele ludzk', 'ludzkiego ciała', 'ludzkim ciele', 'ludzkie ciało', 'organizm', 'witamin', 'lekarz', 'mięsień', 'mięśni']],
  ['zwierzeta', ['zwierz', 'ptak', 'ssak', 'owad']],
  ['mitologia', ['mitolog', 'bogini', 'legendzie', 'według legendy', 'legenda o']],
  ['militaria', ['samolot', 'czołg', 'okręt', 'lotnictw']],
  ['biznes', ['marka', 'firma', 'koncern', 'logo']],
  ['jezyk', ['przysłow', 'ortograf', 'frazeolog']],
  ['prl', ['prl', 'peerel']]
];

// Keyword must start a word ("sport" matches "sportowiec", not "transport")
function hasWordStartingWith(text, keyword) {
  let from = 0;
  let idx;
  while ((idx = text.indexOf(keyword, from)) !== -1) {
    if (idx === 0 || !/[\p{L}\p{N}]/u.test(text[idx - 1])) return true;
    from = idx + 1;
  }
  return false;
}

function determineCategory(question) {
  const qId = String(question.id || '');
  const qText = (question.question || '').toLowerCase();

  const prefix = CATEGORY_PREFIXES.find(p => qId.startsWith(p));
  if (prefix) return CATEGORY_MAPPING[prefix];

  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some(k => hasWordStartingWith(qText, k))) return category;
  }

  const isPolish = qText.includes('polsk') || qText.includes('polsce');
  if (qText.includes('histori') || qText.includes('król') || qText.includes('wojn') || qText.includes('bitw')) {
    return isPolish ? 'historia_polski' : 'historia_swiata';
  }
  if (qText.includes('rzek') || qText.includes('góra') || qText.includes('miast') || qText.includes('stolic') || qText.includes('państw')) {
    return isPolish ? 'geografia_polski' : 'geografia_swiata';
  }
  if (isPolish) return 'kultura_polska';

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
                  category: questionsDatabase.categories[category].name,
                  categoryKey: category
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
                      category: questionsDatabase.categories[categoryKey].name,
                      categoryKey
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

// ♻️ Make sure the global pool has enough fresh questions for a whole game (same reset rule as selectFreshQuestions)
function ensureFreshPool(requestedCount) {
  const freshCount = gameQuestions.filter(q => !usedQuestionsHistory.has(q.id)).length;
  if (freshCount < Math.max(requestedCount, MIN_QUESTIONS_POOL)) {
    console.log('⚠️  Low fresh questions! Resetting history but keeping most recent 50 questions');
    const recentQuestions = Array.from(usedQuestionsHistory).slice(-50);
    usedQuestionsHistory.clear();
    recentQuestions.forEach(qId => usedQuestionsHistory.add(qId));
  }
}

// Smart question selection avoiding recently used questions
function selectFreshQuestions(requestedCount) {
  ensureFreshPool(requestedCount);
  const availableQuestions = gameQuestions.filter(q => !usedQuestionsHistory.has(q.id));
  console.log(`Question pool status: ${availableQuestions.length}/${gameQuestions.length} fresh questions available`);
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
    this.vote = null; // 🗳️ active category vote state
    this.voteTimer = null;
    this.roundCategory = null;

    this.pickQuestions();

    this.startInactivityTimer();

    console.log(`🎮 Session ${id} created (${gameQuestions.length} questions in pool)`);
  }

  // Reset per-game question state; questions are picked per round after the category vote
  pickQuestions() {
    ensureFreshPool(this.rounds * this.questionsPerRound);
    this.totalQuestions = Math.min(this.rounds * this.questionsPerRound, gameQuestions.length);
    if (this.totalQuestions === 0) {
      console.error(`❌ Critical: No questions available for session ${this.id}. gameQuestions.length = ${gameQuestions.length}`);
    }
    this.shuffledQuestions = []; // questions actually played, in order
    this.usedQuestionIds = new Set(); // 🔒 no repeats within a game
    this.questionIndex = 0;
    this.roundCategory = null;
    this.lastVotedCategoryKey = null;
    this.vote = null;
  }

  getTotalRounds() {
    return Math.max(1, Math.ceil(this.totalQuestions / this.questionsPerRound));
  }

  getCurrentRound() {
    return Math.floor(this.questionIndex / this.questionsPerRound) + 1;
  }

  // Fresh = not in global history and not yet used in this game
  getFreshQuestions(categoryKey) {
    return gameQuestions.filter(q =>
      (!categoryKey || q.categoryKey === categoryKey) &&
      !usedQuestionsHistory.has(q.id) &&
      !this.usedQuestionIds.has(q.id));
  }

  buildVoteOptions() {
    const freshCounts = {};
    const unusedCounts = {}; // not used in this game (ignores global history)
    gameQuestions.forEach(q => {
      if (this.usedQuestionIds.has(q.id)) return;
      unusedCounts[q.categoryKey] = (unusedCounts[q.categoryKey] || 0) + 1;
      if (!usedQuestionsHistory.has(q.id)) freshCounts[q.categoryKey] = (freshCounts[q.categoryKey] || 0) + 1;
    });
    const stats = Object.entries(questionsDatabase.categories).map(([key, cat]) => ({
      key,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      available: freshCounts[key] || 0
    }));
    const needed = this.questionsPerRound;
    let eligible = shuffleArray(stats.filter(c => c.available >= needed));
    // 🔁 Don't offer the previous round's category again if there are enough other qualifying ones
    const lastKey = this.lastVotedCategoryKey;
    if (lastKey && eligible.filter(c => c.key !== lastKey).length >= 3) {
      eligible = eligible.filter(c => c.key !== lastKey);
    }
    // Fewer than 3 categories with enough fresh questions -> fill with whatever is still available
    const rest = shuffleArray(stats.filter(c => c.available < needed && c.available > 0))
      .sort((a, b) => b.available - a.available);
    let options = [...eligible, ...rest].slice(0, 3);
    if (options.length === 0) {
      // Everything used up - still offer categories, questions will be filled from the whole pool
      options = shuffleArray(stats.filter(c => unusedCounts[c.key] > 0)).slice(0, 3);
    }
    return options;
  }

  startCategoryVote(io) {
    if (this.status !== 'playing') return;
    if (this.questionIndex >= this.totalQuestions) {
      this.finishGame(io);
      return;
    }
    this.updateActivity();
    const duration = 10;
    const options = this.buildVoteOptions();
    this.vote = {
      round: this.getCurrentRound(),
      totalRounds: this.getTotalRounds(),
      options,
      votes: new Map(), // playerId -> categoryKey
      endsAt: Date.now() + duration * 1000,
      active: true
    };
    console.log(`🗳️ Session ${this.id}: category vote for round ${this.vote.round}: ${options.map(o => o.key).join(', ')}`);
    io.to(this.id).emit('category-vote-start', this.getVoteStartPayload());
    this.voteTimer = this.schedule(() => {
      this.voteTimer = null;
      this.finishCategoryVote(io);
    }, duration * 1000);
  }

  getVoteStartPayload() {
    if (!this.vote) return null;
    return {
      round: this.vote.round,
      totalRounds: this.vote.totalRounds,
      duration: Math.max(0, Math.ceil((this.vote.endsAt - Date.now()) / 1000)),
      options: this.vote.options
    };
  }

  getVoteUpdatePayload() {
    const votes = {};
    this.vote.options.forEach(o => { votes[o.key] = 0; });
    this.vote.votes.forEach(key => { votes[key] = (votes[key] || 0) + 1; });
    return {
      votes,
      totalVotes: this.vote.votes.size,
      totalPlayers: this.getConnectedPlayerCount(),
      votedPlayerIds: Array.from(this.vote.votes.keys())
    };
  }

  // Returns error message or null on success
  castVote(io, playerId, categoryKey) {
    if (!this.vote || !this.vote.active) return 'Głosowanie nie trwa';
    if (!this.players.has(playerId)) return 'Player not found in session';
    if (!this.vote.options.some(o => o.key === categoryKey)) return 'Nieznana kategoria';
    this.updateActivity();
    this.vote.votes.set(playerId, categoryKey);
    io.to(this.id).emit('category-vote-update', this.getVoteUpdatePayload());
    this.checkAllVoted(io);
    return null;
  }

  // End vote early once every connected player has voted
  checkAllVoted(io) {
    if (!this.vote || !this.vote.active) return;
    const connected = Array.from(this.players.values()).filter(p => p.connected !== false);
    if (connected.length > 0 && connected.every(p => this.vote.votes.has(p.id))) {
      this.finishCategoryVote(io);
    }
  }

  finishCategoryVote(io) {
    if (!this.vote || !this.vote.active) return;
    this.vote.active = false;
    if (this.voteTimer) {
      clearTimeout(this.voteTimer);
      this.pendingTimers = this.pendingTimers.filter(x => x !== this.voteTimer);
      this.voteTimer = null;
    }

    const { votes } = this.getVoteUpdatePayload();
    const max = Math.max(...Object.values(votes));
    const leaders = max > 0 ? this.vote.options.filter(o => votes[o.key] === max) : this.vote.options;
    const winner = leaders[Math.floor(Math.random() * leaders.length)];
    this.roundCategory = { key: winner.key, name: winner.name, icon: winner.icon, color: winner.color };
    this.lastVotedCategoryKey = winner.key;

    this.pickRoundQuestions(winner.key);
    console.log(`🏆 Session ${this.id}: round ${this.vote.round} category ${winner.key} (${max} votes)`);

    io.to(this.id).emit('category-vote-result', {
      round: this.vote.round,
      categoryKey: winner.key,
      name: winner.name,
      icon: winner.icon,
      color: winner.color,
      votes
    });

    this.schedule(() => this.startQuestion(io), 3000);
  }

  // Append questions for the current round: category fresh -> whole pool fresh -> anything not used in this game
  pickRoundQuestions(categoryKey) {
    const needed = Math.min(this.questionsPerRound, this.totalQuestions - this.questionIndex);
    let picked = shuffleArray(this.getFreshQuestions(categoryKey)).slice(0, needed);
    const take = (pool) => {
      if (picked.length >= needed) return;
      const ids = new Set(picked.map(q => q.id));
      const extra = shuffleArray(pool.filter(q => !ids.has(q.id) && !this.usedQuestionIds.has(q.id)));
      picked = picked.concat(extra.slice(0, needed - picked.length));
    };
    if (picked.length < needed) {
      console.warn(`⚠️  Category ${categoryKey}: only ${picked.length}/${needed} fresh questions, filling from whole pool`);
      take(this.getFreshQuestions());
      take(gameQuestions);
    }
    picked.forEach(q => this.usedQuestionIds.add(q.id));
    this.shuffledQuestions.push(...picked);
    // 🔧 Pool exhausted -> end the game after these questions
    if (picked.length < needed) {
      this.totalQuestions = this.questionIndex + picked.length;
    }
  }

  finishGame(io) {
    if (this.status === 'finished') return; // 🔒 idempotent
    this.status = 'finished';
    this.vote = null;
    markQuestionsAsUsed(this.shuffledQuestions);
    io.to(this.id).emit('game-finished');
    this.schedule(() => {
      console.log(`Cleaning up finished session ${this.id}`);
      this.cleanup();
      gameSessions.delete(this.id);
    }, 5 * 60 * 1000);
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
      roundCategory: this.roundCategory,
      gameSettings: this.gameSettings,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }

  startQuestion(io) {
    if (this.status !== 'playing') return; // 🔒 ignore stray transitions after game end
    this.updateActivity();
    if (this.questionIndex >= this.shuffledQuestions.length || this.questionIndex >= this.totalQuestions) {
      console.warn(`Session ${this.id}: No more questions available (index ${this.questionIndex}/${this.shuffledQuestions.length})`);
      this.finishGame(io);
      return;
    }

    const question = this.shuffledQuestions[this.questionIndex];
    this.currentQuestion = question;
    this.playerAnswers.clear();
    this.questionStartTime = Date.now();
    this.questionActive = true;

    const { correct, categoryKey, ...publicQuestion } = question; // 🔒 never send the correct answer
    io.to(this.id).emit('new-question', {
      question: publicQuestion,
      round: this.getCurrentRound(),
      totalRounds: this.getTotalRounds(),
      questionNumber: this.questionIndex + 1,
      totalQuestions: this.totalQuestions,
      questionInRound: (this.questionIndex % this.questionsPerRound) + 1,
      questionsPerRound: this.questionsPerRound,
      timeLimit: 15,
      roundCategory: this.roundCategory
    });

    this.timer = setTimeout(() => {
      this.endQuestion(io);
    }, 15000);
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
    this.voteTimer = null;
    this.vote = null;
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
        this.startCategoryVote(io); // 🗳️ next round starts with a category vote
      }, 16500); // 1.5s + 5s + 10s
    } else if (this.questionIndex >= this.totalQuestions) {
      this.schedule(() => {
        this.finishGame(io);
      }, 6500); // Show results for 5 seconds before final screen
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