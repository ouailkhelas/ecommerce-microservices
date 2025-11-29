const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // 1 heure
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // 7 jours

/**
 * Génère un access token JWT
 * @param {Object} payload - Données à inclure dans le token (userId, email, role)
 * @returns {string} Token JWT
 */
function generateAccessToken(payload) {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'ecommerce-auth-service',
        subject: String(payload.userId)
      }
    );
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Génère un refresh token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} Refresh token JWT
 */
function generateRefreshToken(payload) {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        type: 'refresh'
      },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'ecommerce-auth-service',
        subject: String(payload.userId)
      }
    );
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
}

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('Error verifying token:', error);
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Décode un token sans vérifier sa signature (pour debug)
 * @param {string} token - Token à décoder
 * @returns {Object} Payload décodé
 */
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token ou null
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  JWT_SECRET
};