const express = require('express');
const router = express.Router();
const { pool } = require('../index');  // Vérifiez ce chemin

// GET /shipments - Liste toutes les expéditions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get shipments error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /shipments - Crée une nouvelle expédition
router.post('/', async (req, res) => {
  try {
    const { order_id, customer_id, shipping_address, items } = req.body;
    
    console.log(`🚚 Creating shipment for order ${order_id}, customer ${customer_id}`);
    
    // Générer un numéro de suivi unique
    const tracking_number = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Statut initial
    const status = 'processing';
    const carrier = 'DHL';
    
    const result = await pool.query(  // CORRIGÉ : pool au lieu de client
      `INSERT INTO shipments (order_id, customer_id, tracking_number, status, shipping_address, carrier) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [order_id, customer_id, tracking_number, status, shipping_address, carrier]
    );
    
    console.log(`✅ Shipment created successfully: ${tracking_number}`);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Shipment creation error:', error);
    res.status(500).json({ error: 'Shipment creation failed' });
  }
});

// GET /shipments/:id - Récupère une expédition par ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);  // CORRIGÉ
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get shipment error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /shipments/:id/status - Met à jour le statut d'une expédition
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(  // CORRIGÉ
      'UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    console.log(`📦 Shipment ${req.params.id} status updated to: ${status}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update shipment status error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

module.exports = router;