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

const ordersCreatedTotal = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  registers: [register]
});

const ordersFailedTotal = new client.Counter({
  name: 'orders_failed_total',
  help: 'Total number of failed orders',
  labelNames: ['reason'],
  registers: [register]
});

const orderAmountTotal = new client.Counter({
  name: 'order_amount_total',
  help: 'Total amount of all orders',
  registers: [register]
});

const circuitBreakerState = new client.Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)',
  labelNames: ['service'],
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

function recordOrderCreated(amount) {
  ordersCreatedTotal.inc();
  orderAmountTotal.inc(amount);
}

function recordOrderFailed(reason) {
  ordersFailedTotal.inc({ reason });
}

function updateCircuitBreakerState(service, state) {
  const stateValue = state === 'OPEN' ? 1 : state === 'HALF_OPEN' ? 2 : 0;
  circuitBreakerState.set({ service }, stateValue);
}

module.exports = {
  register,
  recordHttpRequest,
  incrementRequestsInProgress,
  decrementRequestsInProgress,
  recordOrderCreated,
  recordOrderFailed,
  updateCircuitBreakerState
};