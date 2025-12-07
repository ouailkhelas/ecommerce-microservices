const express = require('express');
const router = express.Router();
const { pool } = require('../index');

// GET /products - Liste tous les produits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY id');
    
    // Transformer quantity en stock pour la réponse
    const products = result.rows.map(row => ({
      ...row,
      stock: row.quantity,
      data: row  // Format attendu par order-service
    }));
    
    res.json(products);
  } catch (error) {
    console.error('❌ Get inventory error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /products/:id - Récupère un produit par son id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transformer quantity en stock
    const product = {
      ...result.rows[0],
      stock: result.rows[0].quantity
    };

    res.json({ data: product });  // Format attendu par order-service
  } catch (error) {
    console.error('❌ Get product by id error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /products/:id/stock - Vérifie le stock d'un produit
router.get('/:id/stock', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ 
      product_id: result.rows[0].id,
      product_name: result.rows[0].name,
      stock: result.rows[0].quantity,  // Renommé
      quantity: result.rows[0].quantity,  // Garder pour compatibilité
      in_stock: result.rows[0].quantity > 0
    });
  } catch (error) {
    console.error('❌ Get stock error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /products/:id - Met à jour le stock
router.put('/:id', async (req, res) => {
  try {
    const { stock, quantity } = req.body;
    const newStock = stock || quantity;  // Accepter les deux noms
    
    const result = await pool.query(
      'UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *',
      [newStock, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transformer quantity en stock dans la réponse
    const product = {
      ...result.rows[0],
      stock: result.rows[0].quantity
    };

    res.json(product);
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({ error: 'Stock update failed' });
  }
});

// PUT /products/:id/stock - Met à jour le stock (route alternative)
router.put('/:id/stock', async (req, res) => {
  try {
    const { stock, quantity } = req.body;
    const newStock = stock || quantity;
    
    const result = await pool.query(
      'UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *',
      [newStock, req.params.id]
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
    const { name, description, price, stock, quantity } = req.body;
    const productStock = stock || quantity || 0;  // Accepter les deux noms
    
    const result = await pool.query(
      `INSERT INTO inventory (name, description, price, quantity) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, price, productStock]
    );

    // Transformer quantity en stock dans la réponse
    const product = {
      ...result.rows[0],
      stock: result.rows[0].quantity
    };

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({ error: 'Product creation failed' });
  }
});

module.exports = router;