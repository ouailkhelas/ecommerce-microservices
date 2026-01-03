const {
  recordHttpRequest,
  incrementRequestsInProgress,
  decrementRequestsInProgress
} = require('../metrics');

function metricsMiddleware(req, res, next) {
  const endpoint = req.route ? req.route.path : req.path;
  const method = req.method;

  incrementRequestsInProgress(method, endpoint);

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const status = res.statusCode;

    recordHttpRequest(method, endpoint, status, duration);
    decrementRequestsInProgress(method, endpoint);
  });

  next();
}

module.exports = metricsMiddleware;