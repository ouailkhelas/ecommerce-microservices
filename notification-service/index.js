const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// pool postgres
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

// ⭐ EXPORTER D'ABORD
module.exports = { pool };

// ⭐ IMPORTER ENSUITE
const notificationController = require('./src/notificationController');
app.use('/notifications', notificationController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notification Service is running',
    availableRoutes: ['GET /notifications', 'POST /notifications', 'GET /notifications/:id']
  });
});

// ⭐ AJOUTER L'ATTENTE DE LA DB
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Notification DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Notification DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ⭐ ATTENDRE AVANT DE DÉMARRER
(async () => {
  await waitDbReady();
  app.listen(3006, () => console.log('✅ Notification Service running on port 3006'));
})();