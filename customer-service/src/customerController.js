const express = require('express');
const router = express.Router();
const { pool } = require('../index');  // ⭐ IMPORTER LE POOL

// GET /customers - Liste tous les clients depuis la DB
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id');
    res.json(result.rows);  // ⭐ Renvoie les données de la DB
  } catch (error) {
    console.error('❌ Get customers error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /customers - Crée un nouveau client dans la DB
router.post('/', async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;

    const result = await pool.query(
      `INSERT INTO customers (name, email, address, phone) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, address, phone]
    );

    res.status(201).json(result.rows[0]);  // ⭐ Renvoie le client créé
  } catch (error) {
    console.error('❌ Customer creation error:', error);
    res.status(500).json({ error: 'Customer creation failed' });
  }
});

// GET /customers/:id - Récupère un client par ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get customer error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;