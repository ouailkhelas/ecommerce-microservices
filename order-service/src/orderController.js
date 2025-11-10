const express = require('express');
const router = express.Router();
const { pool } = require('../index');

// GET /orders - Liste toutes les commandes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /orders - Crée une nouvelle commande
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer_id, items } = req.body;
    
    // Créer la commande
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, status, total_amount) 
       VALUES ($1, 'pending', 0) RETURNING *`,
      [customer_id]
    );
    
    const order = orderResult.rows[0];
    let totalAmount = 0;
    
    // Ajouter les articles de la commande
    for (const item of items) {
      // Récupérer le prix du produit
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      
      const unitPrice = productResult.rows[0].price;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;
      
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, unitPrice]
      );
    }
    
    // Mettre à jour le montant total
    await client.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [totalAmount, order.id]
    );
    
    await client.query('COMMIT');
    
    // Récupérer la commande complète
    const finalResult = await pool.query(`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [order.id]);
    
    res.status(201).json(finalResult.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Order creation error:', error);
    res.status(500).json({ error: 'Order creation failed: ' + error.message });
  } finally {
    client.release();
  }
});

// GET /orders/:id - Récupère une commande par ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;