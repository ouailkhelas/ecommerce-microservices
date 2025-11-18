const express = require('express');
const router = express.Router();
const axios = require('axios');           // 🔵 Pour communication microservices
const { pool } = require('../index');

// =====================================================================================
// GET /orders - Liste toutes les commandes
// =====================================================================================
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

// =====================================================================================
// POST /orders - Crée une nouvelle commande
// =====================================================================================
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { customer_id, items } = req.body;

    // -----------------------------------------------------------------------------
    // 1️⃣ Vérifier que le client existe (Customer Service)
    // -----------------------------------------------------------------------------
    console.log("🔵 Vérification du client...");
    const customer = await axios.get(`http://customer-service:3003/customers/${customer_id}`);
    console.log("✔️ Client validé :", customer.data);

    // -----------------------------------------------------------------------------
    // 2️⃣ Vérifier inventory et calculer le montant total
    // -----------------------------------------------------------------------------
    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
      console.log(`🟠 Vérification stock produit ${item.product_id}`);

      const inventoryResponse = await axios.get(`http://inventory-service:3002/inventory/${item.product_id}`);
      const inventory = inventoryResponse.data;

      if (!inventory) {
        throw new Error(`Produit ${item.product_id} introuvable dans l'inventaire`);
      }

      if (inventory.quantity < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit ${item.product_id}`);
      }

      const itemTotal = Number(inventory.price) * item.quantity;
      totalAmount += itemTotal;

      itemDetails.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(inventory.price)
      });
    }

    // -----------------------------------------------------------------------------
    // 3️⃣ Insérer la commande dans BD interne (orders + order_items)
    // -----------------------------------------------------------------------------
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, status, total_amount) 
       VALUES ($1, 'confirmed', $2) RETURNING *`,
      [customer_id, totalAmount]
    );

    const order = orderResult.rows[0];

    for (const item of itemDetails) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    // -----------------------------------------------------------------------------
    // 4️⃣ Déclencher paiement (Payment Service)
    // -----------------------------------------------------------------------------
    console.log("💳 Déclenchement du paiement...");

    let payment;
    try {
      payment = await axios.post(`http://payment-service:3004/payments`, {
        order_id: order.id,     
        customer_id,
        amount: totalAmount,
        payment_method: "card"
      });
      console.log("✔️ Paiement réussi", payment.data.transaction_id);
    } catch (payError) {
      console.error('❌ Payment service error:', payError.response?.data || payError.message);
      throw new Error(`Payment creation failed: ${payError.response?.data?.error || payError.message}`);
    }

    await client.query('COMMIT');

    // -----------------------------------------------------------------------------
    // 5️⃣ Retourner la commande finale
    // -----------------------------------------------------------------------------
    res.status(201).json({
      order_id: order.id,
      total_amount: totalAmount,
      status: "confirmed",
      items: itemDetails,
      payment: payment.data
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Order creation error:', error);

    const errorMessage = error.response?.data?.error || error.message;

    res.status(500).json({
      error: 'Order creation failed',
      details: errorMessage
    });
  } finally {
    client.release();
  }
});

// =====================================================================================
// GET /orders/:id - Récupère une commande
// =====================================================================================
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
