require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// PHASE 6: Observability
const logger = require('./src/utils/logger');
const correlationIdMiddleware = require('./src/middleware/correlationId');
const metricsMiddleware = require('./src/middleware/metricsMiddleware');
const { register, recordOrderCreated, recordOrderFailed } = require('./src/metrics');

// PHASE 5: Resilience
const paymentClient = require('./src/services/paymentClient');
const notificationClient = require('./src/services/notificationClient');
const customerClient = require('./src/services/customerClient');
const inventoryClient = require('./src/services/inventoryClient');
const { processPaymentQueue } = require('./src/fallback/paymentFallback');
const { processNotificationQueue } = require('./src/fallback/notificationFallback');

const app = express();
const PORT = process.env.PORT || 3001;

// Pool PostgreSQL pour le health check au démarrage
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PGHOST || 'order-db',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'order_db'
});

// =============================================
// MIDDLEWARE
// =============================================
app.use(helmet());
app.use(cors());
app.use(express.json());

// PHASE 6: Ajouter correlation ID en premier
app.use(correlationIdMiddleware);

// PHASE 6: Ajouter metrics middleware
app.use(metricsMiddleware);

// =============================================
// PHASE 6: ENDPOINT METRICS
// =============================================
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  const circuitStats = paymentClient.getCircuitStats();

  req.logger.debug('Health check requested');

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

// GET /orders - Liste des commandes
app.get('/orders', async (req, res) => {
  try {
    req.logger.info('Fetching orders list');

    // Votre logique existante
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    req.logger.error('Failed to fetch orders', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /orders - Créer une commande
app.post('/orders', async (req, res) => {
  const { customerId, items, totalAmount } = req.body;

  try {
    req.logger.info('Creating new order', { customerId, itemCount: items?.length, totalAmount });

    // 1. Vérifier le client
    req.logger.debug('Step 1: Validating customer', { customerId });
    const customer = await customerClient.getCustomer(customerId);
    req.logger.info('Customer validated', { customerId, customerEmail: customer.email });

    // 2. Réserver le stock
    req.logger.debug('Step 2: Reserving stock', { itemCount: items.length });
    const stockReservation = await inventoryClient.reserveStock(items);
    req.logger.info('Stock reserved successfully');

    // 3. Créer la commande
    const order = {
      id: Date.now(),
      customerId,
      items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 4. Traiter le paiement
    req.logger.debug('Step 3: Processing payment', { orderId: order.id, amount: totalAmount });
    const paymentResult = await paymentClient.processPayment({
      orderId: order.id,
      amount: totalAmount,
      customerId
    });

    if (paymentResult.fallbackActivated) {
      order.status = 'PENDING_PAYMENT';
      order.paymentId = paymentResult.payment.id;
      req.logger.warn('Payment fallback activated', { orderId: order.id, status: 'PENDING_PAYMENT' });
    } else {
      order.status = 'CONFIRMED';
      order.paymentId = paymentResult.payment.id;
      req.logger.info('Payment processed successfully', { orderId: order.id, paymentId: order.paymentId });
    }

    // 5. Envoyer notification
    req.logger.debug('Step 4: Sending notification', { orderId: order.id });
    const notificationResult = await notificationClient.sendOrderCreatedNotification(order, customer);

    if (notificationResult.fallbackActivated) {
      req.logger.warn('Notification fallback activated', { orderId: order.id });
    } else {
      req.logger.info('Notification sent successfully', { orderId: order.id });
    }

    // PHASE 6: Enregistrer la métrique de commande créée
    recordOrderCreated(totalAmount);

    req.logger.info('Order created successfully', {
      orderId: order.id,
      status: order.status,
      totalAmount
    });

    res.status(201).json({
      success: true,
      order,
      payment: paymentResult.payment,
      notification: notificationResult.notification,
      resilience: {
        paymentFallback: paymentResult.fallbackActivated || false,
        notificationFallback: notificationResult.fallbackActivated || false
      }
    });

  } catch (error) {
    req.logger.error('Order creation failed', {
      error: error.message,
      stack: error.stack,
      customerId,
      totalAmount
    });

    // PHASE 6: Enregistrer la métrique d'échec
    recordOrderFailed(error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : 'No details available',
      step: 'Order creation failed'
    });
  }
});

// GET /orders/circuit-stats - Stats du Circuit Breaker
app.get('/orders/circuit-stats', (req, res) => {
  req.logger.debug('Circuit breaker stats requested');
  res.status(200).json(paymentClient.getCircuitStats());
});

// Route 404
app.use((req, res) => {
  req.logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  req.logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// =============================================
// BACKGROUND WORKERS
// =============================================
setInterval(async () => {
  logger.debug('Processing pending queues');
  await processPaymentQueue(paymentClient);
  await processNotificationQueue(notificationClient);
}, 30000);

// =============================================
// DÉMARRER LE SERVEUR
// =============================================
// =============================================
// DÉMARRAGE AVEC ATTENTE DE LA DB
// =============================================
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      logger.info("✅ Order DB ready!");
      return;
    } catch (err) {
      logger.warn("⏳ Order DB not ready yet...", { error: err.message });
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

(async () => {
  await waitDbReady();
  app.listen(PORT, () => {
    logger.info('Order Service started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: `/health`,
        metrics: `/metrics`,
        orders: `/orders`
      }
    });
  });
})();

module.exports = app;