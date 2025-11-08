const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

router.get('/', async (req, res) => {
  const result = await pool.query("SELECT * FROM inventory;");
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { id, product, qty } = req.body;
  await pool.query("INSERT INTO inventory (id, product, qty) VALUES ($1,$2,$3)", [id, product, qty]);
  res.status(201).json({ message: "product added" });
});

module.exports = router;
