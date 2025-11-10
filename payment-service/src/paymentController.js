// src/paymentController.js
const express = require('express');
const router = express.Router();
const { pool } = require('../index');

// GET /payments - Liste tous les paiements
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get payments error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /payments - Crée un nouveau paiement
router.post('/', async (req, res) => {
  try {
    const { order_id, customer_id, amount, payment_method } = req.body;
    
    console.log(`💳 Processing payment for order ${order_id}, amount: ${amount}`);
    
    // Générer une référence de paiement unique
    const payment_reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Statut initial
    const status = 'pending';
    
    const result = await pool.query(
      `INSERT INTO payments (order_id, customer_id, amount, payment_method, payment_reference, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [order_id, customer_id, amount, payment_method, payment_reference, status]
    );
    
    console.log(`✅ Payment created successfully: ${payment_reference}`);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// GET /payments/:id - Récupère un paiement par ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get payment error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /payments/:id/status - Met à jour le statut d'un paiement
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    console.log(`💰 Payment ${req.params.id} status updated to: ${status}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

module.exports = router;