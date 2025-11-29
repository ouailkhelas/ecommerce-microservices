const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../index');
const sendPaymentCreatedEvent = require('./events/sendPaymentCreatedEvent'); // 🔵 Asynchrone

// ------------------------------------
// GET /payments - Liste des paiements
// ------------------------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get payments error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --------------------------------------------------
// POST /payments - Traite un nouveau paiement
// --------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { order_id, customer_id, amount, payment_method } = req.body;

    console.log(`💳 Processing payment for order ${order_id}, amount: ${amount}`);

    // Générer un transaction_id unique
    const transaction_id = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Paiement initialisé
    const status = 'pending';

    // Enregistrer le paiement dans la DB
    const result = await pool.query(
      `INSERT INTO payments (order_id, customer_id, amount, payment_method, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [order_id, customer_id, amount, payment_method, status, transaction_id]
    );

    const payment = result.rows[0];

    console.log(`✅ Payment created: ${transaction_id}`);

    // -------------------------------
    // 🔵 1. Déclencher Shipping Service (synchrone)
    // -------------------------------
    try {
      console.log("🚚 Triggering Shipping Service...");

      await axios.post("http://shipping-service:3005/shipments", {
        order_id,
        customer_id,
        shipping_address: "Default address",
        items: [] // envoyer les produits si nécessaire
      });

      console.log("📦 Shipping successfully triggered!");

    } catch (shipErr) {
      console.error("❌ Shipping service error:", shipErr.message);
    }

    // -------------------------------
    // 🔵 2. Notifier le client (Notification Service, synchrone)
    // -------------------------------
    try {
      console.log("📨 Sending payment confirmation notification...");

      await axios.post("http://notification-service:3006/notifications", {
        user_id: customer_id, // obligatoire pour ne pas violer la contrainte NOT NULL
        message: `Votre paiement ${transaction_id} de ${amount} a été reçu.`,
        type: "email",
        status: "pending"
      });

      console.log("📢 Payment notification sent!");
    } catch (notifyErr) {
      console.error("❌ Notification service error:", notifyErr.message);
    }

    // -------------------------------
    // 🔵 3. Envoyer événement asynchrone payment_created
    // -------------------------------
    try {
      await sendPaymentCreatedEvent(payment);
    } catch (eventErr) {
      console.error("❌ Failed to send payment_created event:", eventErr.message);
    }

    // Renvoyer le paiement
    res.status(201).json(payment);

  } catch (error) {
    console.error('❌ Payment creation error:', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// ----------------------------------------------------------
// GET /payments/:id - Récupération d'un paiement par ID
// ----------------------------------------------------------
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

// ----------------------------------------------------------------
// PUT /payments/:id/status - Mise à jour du statut d’un paiement
// ----------------------------------------------------------------
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

    console.log(`💰 Payment ${req.params.id} updated to: ${status}`);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

module.exports = router;
