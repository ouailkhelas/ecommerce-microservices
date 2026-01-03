const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently in progress',
  labelNames: ['method', 'endpoint'],
  registers: [register]
});

function recordHttpRequest(method, endpoint, status, duration) {
  httpRequestsTotal.inc({ method, endpoint, status });
  httpRequestDuration.observe({ method, endpoint, status }, duration);
}

function incrementRequestsInProgress(method, endpoint) {
  httpRequestsInProgress.inc({ method, endpoint });
}

function decrementRequestsInProgress(method, endpoint) {
  httpRequestsInProgress.dec({ method, endpoint });
}

module.exports = {
  register,
  recordHttpRequest,
  incrementRequestsInProgress,
  decrementRequestsInProgress
};