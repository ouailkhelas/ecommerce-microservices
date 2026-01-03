const { v4: uuidv4 } = require('uuid');
const { Logger } = require('../utils/logger');

function correlationIdMiddleware(req, res, next) {
  const correlationId = 
    req.headers['x-correlation-id'] || 
    req.headers['x-request-id'] || 
    uuidv4();

  req.correlationId = correlationId;
  req.logger = new Logger(correlationId);
  res.setHeader('X-Correlation-ID', correlationId);

  req.logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  });

  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    req.logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
}

module.exports = correlationIdMiddleware;