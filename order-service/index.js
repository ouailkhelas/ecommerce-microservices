require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importer le controller
const orderController = require('./src/orderController');

// Importer les fallback workers
const { processPaymentQueue } = require('./src/fallback/paymentFallback');
const { processNotificationQueue } = require('./src/fallback/notificationFallback');
const paymentClient = require('./src/services/paymentClient');
const notificationClient = require('./src/services/notificationClient');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================
// MIDDLEWARE
// =============================================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Middleware pour logger les headers du gateway
app.use((req, res, next) => {
  console.log('[Gateway Info]', {
    requestId: req.headers['x-request-id'],
    realIp: req.headers['x-real-ip'],
    gateway: req.headers['x-gateway-name']
  });
  next();
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  const circuitStats = paymentClient.getCircuitStats();
  
  res.status(200).json({
    status: 'UP',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    circuitBreaker: circuitStats
  });
});

// =============================================
// ROUTES
// =============================================
app.use('/orders', orderController);

// Route 404
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// =============================================
// ERROR HANDLER
// =============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// =============================================
// BACKGROUND WORKERS
// Worker pour retraiter les queues en attente
// S'exécute toutes les 30 secondes
// =============================================
setInterval(async () => {
  console.log('[Background Worker] Processing pending queues...');
  await processPaymentQueue(paymentClient);
  await processNotificationQueue(notificationClient);
}, 30000);

// =============================================
// DÉMARRER LE SERVEUR
// =============================================
app.listen(PORT, () => {
  console.log(`🛒 Order Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Circuit stats: http://localhost:${PORT}/orders/circuit-stats`);
  console.log(`🔄 Background workers started (30s interval)`);
});

module.exports = app;