/**
 * Validation functions for the quiz game
 */

/**
 * Validates session ID format
 * @param {string} sessionId - The session ID to validate
 * @throws {Error} If session ID format is invalid
 */
function validateSessionId(sessionId) {
  if (!sessionId) {
    throw new Error('Nieprawidłowy format ID sesji');
  }
  
  // Convert to string if it's a number
  const sessionIdStr = String(sessionId);
  
  // Check if it's a valid format (4 digits or UUID format)
  const isNumeric = /^\d{4}$/.test(sessionIdStr);
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionIdStr);
  
  if (!isNumeric && !isUUID) {
    throw new Error('Nieprawidłowy format ID sesji');
  }
  
  return sessionIdStr;
}

/**
 * Validates and sanitizes player name
 * @param {string} playerName - The player name to validate
 * @throws {Error} If player name is invalid
 */
function validatePlayerName(playerName) {
  if (!playerName || typeof playerName !== 'string') {
    throw new Error('Nazwa gracza jest wymagana');
  }
  
  const trimmed = playerName.trim();
  
  if (trimmed.length < 1 || trimmed.length > 20) {
    throw new Error('Nazwa gracza musi mieć od 1 do 20 znaków');
  }
  
  // Allow only letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s\-_.]+$/.test(trimmed)) {
    throw new Error('Nazwa gracza zawiera niedozwolone znaki');
  }
  
  // Prevent HTML/script injection
  if (/<[^>]*>/.test(trimmed)) {
    throw new Error('Nazwa gracza nie może zawierać tagów HTML');
  }
  
  return trimmed;
}

/**
 * Validates avatar (emoji or base64 image)
 * @param {string} avatar - The avatar emoji or base64 image to validate
 * @throws {Error} If avatar is invalid
 */
function validateAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') {
    throw new Error('Avatar jest wymagany');
  }
  
  const trimmed = avatar.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Avatar jest wymagany');
  }
  
  // Check if it's a base64 image (selfie photo)
  if (trimmed.startsWith('data:image/')) {
    // Validate base64 image format
    const base64Pattern = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/;
    if (!base64Pattern.test(trimmed)) {
      throw new Error('Nieprawidłowy format zdjęcia awatara');
    }
    
    // Check image size (limit to ~1MB in base64)
    if (trimmed.length > 1400000) {
      throw new Error('Zdjęcie awatara jest za duże');
    }
    
    return trimmed;
  }
  
  // Otherwise treat as emoji
  if (trimmed.length > 8) {
    throw new Error('Nieprawidłowy format awatara');
  }
  
  // More comprehensive emoji validation - allow most unicode ranges for emoji
  const emojiRegex = /^[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F000}-\u{1F0FF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]+$/u;
  
  if (!emojiRegex.test(trimmed)) {
    throw new Error('Nieprawidłowy format awatara');
  }
  
  return trimmed;
}

/**
 * Validates answer index
 * @param {number} answer - The answer index to validate
 * @throws {Error} If answer is invalid
 */
function validateAnswer(answer) {
  if (typeof answer !== 'number' || !Number.isInteger(answer)) {
    throw new Error('Odpowiedź musi być liczbą całkowitą');
  }
  
  if (answer < 0 || answer > 3) {
    throw new Error('Indeks odpowiedzi musi być między 0 a 3');
  }
  
  return answer;
}

/**
 * Validates game settings
 * @param {object} settings - The game settings to validate
 * @throws {Error} If settings are invalid
 */
function validateGameSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return null; // Allow null/undefined settings
  }
  
  const validated = {};
  
  if (settings.rounds !== undefined) {
    if (typeof settings.rounds !== 'number' || settings.rounds < 1 || settings.rounds > 10) {
      throw new Error('Liczba rund musi być między 1 a 10');
    }
    validated.rounds = settings.rounds;
  }
  
  if (settings.questionsPerRound !== undefined) {
    if (typeof settings.questionsPerRound !== 'number' || settings.questionsPerRound < 1 || settings.questionsPerRound > 20) {
      throw new Error('Liczba pytań na rundę musi być między 1 a 20');
    }
    validated.questionsPerRound = settings.questionsPerRound;
  }
  
  return validated;
}

module.exports = {
  validateSessionId,
  validatePlayerName,
  validateAvatar,
  validateAnswer,
  validateGameSettings
};