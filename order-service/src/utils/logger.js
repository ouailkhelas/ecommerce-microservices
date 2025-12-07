const winston = require('winston');

// Nom du service (à changer pour chaque service)
const SERVICE_NAME = 'order-service';

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Créer le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console output (pour Docker logs)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: false }), // Pas de couleurs pour JSON
        winston.format.json()
      )
    })
  ]
});

/**
 * Wrapper pour ajouter le correlation ID aux logs
 */
class Logger {
  constructor(correlationId = null) {
    this.correlationId = correlationId;
  }

  // Ajouter correlation ID au metadata
  _addMeta(meta = {}) {
    return {
      ...meta,
      correlationId: this.correlationId || 'no-correlation-id'
    };
  }

  info(message, meta = {}) {
    logger.info(message, this._addMeta(meta));
  }

  error(message, meta = {}) {
    logger.error(message, this._addMeta(meta));
  }

  warn(message, meta = {}) {
    logger.warn(message, this._addMeta(meta));
  }

  debug(message, meta = {}) {
    logger.debug(message, this._addMeta(meta));
  }

  // Créer un logger child avec correlation ID
  child(correlationId) {
    return new Logger(correlationId);
  }
}

// Export logger par défaut
module.exports = new Logger();
module.exports.Logger = Logger;