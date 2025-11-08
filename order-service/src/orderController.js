const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// pool PostgreSQL avec variables d’environnement (docker-compose)
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

// GET : récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "DB error"});
  }
});

// POST : ajouter une commande
router.post('/', async (req, res) => {
  try {
    const { id, product, qty } = req.body;
    await pool.query("INSERT INTO orders (id, product, qty) VALUES ($1,$2,$3)", [id, product, qty]);
    res.status(201).json({ message: "order created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "DB error"});
  }
});

// DELETE : supprimer
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM orders WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "DB error"});
  }
});

module.exports = router;
