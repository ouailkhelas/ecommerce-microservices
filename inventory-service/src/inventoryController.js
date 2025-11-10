const express = require('express');
const router = express.Router();
const { pool } = require('../index');

// GET /products - Liste tous les produits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /products/:id/stock - Vérifie le stock d'un produit
router.get('/:id/stock', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      product_id: result.rows[0].id,
      product_name: result.rows[0].name,
      quantity: result.rows[0].quantity,
      in_stock: result.rows[0].quantity > 0
    });
  } catch (error) {
    console.error('❌ Get stock error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /products/:id/stock - Met à jour le stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({ error: 'Stock update failed' });
  }
});

// POST /products - Crée un nouveau produit
router.post('/', async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    
    const result = await pool.query(
      `INSERT INTO products (name, description, price, quantity) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, price, quantity]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({ error: 'Product creation failed' });
  }
});

module.exports = router;