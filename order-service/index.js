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
const orderController = require('./src/orderController');
app.use('/orders', orderController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Order Service is running',
    availableRoutes: ['GET /orders', 'POST /orders', 'GET /orders/:id']
  });
});

// ⭐ AJOUTER L'ATTENTE DE LA DB
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Order DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Order DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ⭐ ATTENDRE AVANT DE DÉMARRER
(async () => {
  await waitDbReady();
  app.listen(3001, () => console.log('✅ Order Service running on port 3001'));
})();