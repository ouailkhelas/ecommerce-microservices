const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash un mot de passe avec bcrypt
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} Hash du mot de passe
 */
async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare un mot de passe avec son hash
 * @param {string} password - Mot de passe en clair
 * @param {string} hash - Hash à comparer
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
async function comparePassword(password, hash) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Password comparison failed');
  }
}

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} { valid: boolean, message: string }
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  // Au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Au moins une lettre minuscule
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true, message: 'Password is strong' };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};