const winston = require('winston');

const SERVICE_NAME = 'auth-service';  // ← Changé ici

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: false }),
        winston.format.json()
      )
    })
  ]
});

class Logger {
  constructor(correlationId = null) {
    this.correlationId = correlationId;
  }

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

  child(correlationId) {
    return new Logger(correlationId);
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;