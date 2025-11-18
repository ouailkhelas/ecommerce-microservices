const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../index');  // Connexion DB (pool)

// ------------------------------
// GET /shipments - Liste expéditions
// ------------------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get shipments error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ------------------------------
// POST /shipments - Créer expédition
// ------------------------------
router.post('/', async (req, res) => {
  try {
    const { order_id, customer_id, shipping_address, items } = req.body;

    console.log(`🚚 Creating shipment for order ${order_id}, customer ${customer_id}`);

    // Générer numéro de suivi
    const tracking_number = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Informations initiales
    const status = 'processing';
    const carrier = 'DHL';

    // INSERT into DB
    const result = await pool.query(
      `INSERT INTO shipments (order_id, customer_id, tracking_number, status, shipping_address, carrier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [order_id, customer_id, tracking_number, status, shipping_address, carrier]
    );

    const shipment = result.rows[0];

    console.log(`✅ Shipment created successfully: ${tracking_number}`);

    // ---------------------------------------
    // 🔵 Communication synchrone → Notification
    // ---------------------------------------
    try {
      console.log("📨 Sending shipment notification...");

      await axios.post("http://notification-service:3006/notify/shipment", {
        order_id,
        customer_id,
        tracking_number,
        status
      });

      console.log("📢 Notification sent successfully.");
    } catch (notifyErr) {
      console.error("❌ Failed to send shipment notification:", notifyErr.message);
      // le TP accepte qu’une notification échoue, on continue
    }

    res.status(201).json(shipment);

  } catch (error) {
    console.error('❌ Shipment creation error:', error);
    res.status(500).json({ error: 'Shipment creation failed' });
  }
});

// ------------------------------
// GET /shipments/:id - Détails expédition
// ------------------------------
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Get shipment error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ------------------------------
// PUT /shipments/:id/status - Update statut
// ------------------------------
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    console.log(`📦 Shipment ${req.params.id} updated to: ${status}`);

    // 🔵 Notifier le changement de statut
    try {
      await axios.post("http://notification-service:3006/notify/shipment-status", {
        shipment_id: req.params.id,
        status
      });
      console.log("📢 Shipment status notification sent.");
    } catch (notifyErr) {
      console.error("❌ Failed to send status notification:", notifyErr.message);
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Update shipment status error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

module.exports = router;
