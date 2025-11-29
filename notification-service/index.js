const express = require('express');
const pool = require('./src/db'); // ✅ Import correct
const listenQueue = require('./src/queueListener');

const app = express();
app.use(express.json());

// Controller HTTP
const notificationController = require('./src/notificationController');
app.use('/notifications', notificationController);

// Route test
app.get('/', (req, res) => {
  res.json({
    message: 'Notification Service is running',
    availableRoutes: [
      'GET /notifications',
      'POST /notifications',
      'GET /notifications/:id'
    ],
    asyncListeners: [
      'payment_created (RabbitMQ)',
      'shipment_created (RabbitMQ)'
    ]
  });
});

// Attendre DB avant démarrage
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Notification DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Waiting for Notification DB...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Démarrage global
(async () => {
  await waitDbReady();

  try {
    await listenQueue();
    console.log("📡 RabbitMQ listeners started!");
  } catch (err) {
    console.error("❌ Failed to start RabbitMQ listeners:", err.message);
  }

  app.listen(3006, () => console.log('🚀 Notification Service running on port 3006'));
})();
