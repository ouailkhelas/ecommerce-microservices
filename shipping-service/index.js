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
const shippingController = require('./src/shippingController');
app.use('/shipments', shippingController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shipping Service is running',
    availableRoutes: ['GET /shipments', 'POST /shipments', 'GET /shipments/:id']
  });
});

// attendre que la DB soit prête avant de démarrer
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Shipping DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Shipping DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// démarrage du service
(async () => {
  await waitDbReady();
  app.listen(3005, () => console.log('✅ Shipping Service running on port 3005'));
})();