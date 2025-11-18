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
const inventoryController = require('./src/inventoryController');
app.use('/inventory', inventoryController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Service is running',
    availableRoutes: ['GET /inventory', 'GET /inventory/:id/stock', 'PUT /inventory/:id/stock']
  });
});

// ⭐ AJOUTER L'ATTENTE DE LA DB
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Inventory DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Inventory DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ⭐ ATTENDRE AVANT DE DÉMARRER
(async () => {
  await waitDbReady();
  app.listen(3002, () => console.log('✅ Inventory Service running on port 3002'));
})();