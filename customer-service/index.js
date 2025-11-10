const express = require('express');
const { Pool } = require('pg');  // ⭐ AJOUTER pg

const app = express();
app.use(express.json());

// ⭐ AJOUTER LE POOL DE CONNEXION
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

// ⭐ EXPORTER LE POOL D'ABORD
module.exports = { pool };

// ⭐ IMPORTER LE CONTROLLER APRÈS L'EXPORT
const customerController = require('./src/customerController');
app.use('/customers', customerController);

// endpoint test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Customer Service is running',
    availableRoutes: ['GET /customers', 'POST /customers', 'GET /customers/:id']
  });
});

// ⭐ AJOUTER LA FONCTION D'ATTENTE DE LA DB
async function waitDbReady() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Customer DB ready!");
      return;
    } catch (err) {
      console.log("⏳ Customer DB not ready yet...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ⭐ MODIFIER LE DÉMARRAGE POUR ATTENDRE LA DB
(async () => {
  await waitDbReady();   // ⭐ ATTENDRE QUE LA DB SOIT PRÊTE
  app.listen(3003, () => {
    console.log('Customer Service running on port 3003');
  });
})();