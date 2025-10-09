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

module.exports = {
  validateSessionId
};