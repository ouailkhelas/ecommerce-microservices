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

// ⚠️ D'ABORD exporter le pool
module.exports = { pool };

// ⚠️ ENSUITE importer le controller (après l'export)
const paymentController = require('./src/paymentController');
app.use('/payments', paymentController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Payment Service is running',
    availableRoutes: ['GET /payments', 'POST /payments', 'GET /payments/:id']
  });
});

// attendre que la DB soit prête avant de démarrer
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Payment DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Payment DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// démarrage du service
(async () => {
  await waitDbReady();
  app.listen(3004, () => console.log('✅ Payment Service running on port 3004'));
})();