const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Importer les clients avec resilience patterns
const paymentClient = require('./services/paymentClient');
const notificationClient = require('./services/notificationClient');
const customerClient = require('./services/customerClient');
const inventoryClient = require('./services/inventoryClient');

// Pool PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST || 'order-db',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'order_db'
});

// =============================================
// GET /orders - Liste des commandes
// =============================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================
// GET /orders/:id - Commande par ID
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================
// POST /orders - Créer une commande AVEC RESILIENCE
// =============================================
router.post('/', async (req, res) => {
  const { customerId, items, totalAmount } = req.body;

  // Validation
  if (!customerId || !items || !totalAmount) {
    return res.status(400).json({
      success: false,
      error: 'customerId, items, and totalAmount are required'
    });
  }

  let stockReservation = null;

  try {
    console.log('[Order Service] Creating new order...');

    // ============================================
    // ÉTAPE 1 : Vérifier le client
    // Avec RETRY + CACHE FALLBACK
    // ============================================
    console.log('[Order Service] Step 1: Validating customer...');
    const customer = await customerClient.getCustomer(customerId);
    console.log(`[Order Service] ✅ Customer ${customerId} validated`);

    // ============================================
    // ÉTAPE 2 : Réserver le stock
    // Avec RETRY + TIMEOUT
    // ============================================
    console.log('[Order Service] Step 2: Reserving stock...');
    stockReservation = await inventoryClient.reserveStock(items);
    console.log('[Order Service] ✅ Stock reserved');

    // ============================================
    // ÉTAPE 3 : Créer la commande en DB
    // ============================================
    console.log('[Order Service] Step 3: Creating order in database...');
    const result = await pool.query(
      `INSERT INTO orders (customer_id, total_amount, status, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [customerId, totalAmount, 'PENDING']
    );

    const order = result.rows[0];
    console.log(`[Order Service] ✅ Order ${order.id} created in database`);

    // ============================================
    // ÉTAPE 4 : Traiter le paiement
    // Avec CIRCUIT BREAKER + FALLBACK
    // ============================================
    console.log('[Order Service] Step 4: Processing payment...');
    const paymentResult = await paymentClient.processPayment({
      orderId: order.id,
      amount: totalAmount,
      customerId
    });

    // Mettre à jour le statut selon le résultat du paiement
    let newStatus;
    if (paymentResult.fallbackActivated) {
      newStatus = 'PENDING_PAYMENT';
      console.log('[Order Service] ⚠️  Payment fallback activated - Order status: PENDING_PAYMENT');
    } else {
      newStatus = 'CONFIRMED';
      console.log('[Order Service] ✅ Payment processed - Order status: CONFIRMED');
    }

    // Update order status
    await pool.query(
      'UPDATE orders SET status = $1, payment_id = $2 WHERE id = $3',
      [newStatus, paymentResult.payment.id, order.id]
    );
    order.status = newStatus;
    order.payment_id = paymentResult.payment.id;

    // ============================================
    // ÉTAPE 5 : Envoyer notification
    // Avec RETRY + FALLBACK NON-BLOQUANT
    // ============================================
    console.log('[Order Service] Step 5: Sending notification...');
    const notificationResult = await notificationClient.sendOrderCreatedNotification(order, customer);

    if (notificationResult.fallbackActivated) {
      console.log('[Order Service] ⚠️  Notification queued (fallback) - Order still successful');
    } else {
      console.log('[Order Service] ✅ Notification sent');
    }

    // ============================================
    // SUCCÈS : Retourner la commande
    // ============================================
    console.log(`[Order Service] 🎉 Order ${order.id} created successfully`);

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customer_id,
        totalAmount: order.total_amount,
        status: order.status,
        paymentId: order.payment_id,
        createdAt: order.created_at
      },
      payment: paymentResult.payment,
      notification: notificationResult.notification,
      resilience: {
        paymentFallback: paymentResult.fallbackActivated || false,
        notificationFallback: notificationResult.fallbackActivated || false
      }
    });

  } catch (error) {
    console.error('[Order Service] ❌ Order creation failed:', error.message);

    // ============================================
    // ROLLBACK : Libérer le stock en cas d'erreur
    // ============================================
    if (stockReservation && stockReservation.reservations) {
      console.log('[Order Service] Rolling back stock reservation...');
      try {
        await inventoryClient.releaseStock(stockReservation.reservations);
        console.log('[Order Service] ✅ Stock released');
      } catch (rollbackError) {
        console.error('[Order Service] ⚠️  Failed to rollback stock:', rollbackError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : 'No details available',
      step: 'Order creation failed'
    });
  }
});

// =============================================
// PUT /orders/:id - Mettre à jour une commande
// =============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================
// DELETE /orders/:id - Supprimer une commande
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================
// GET /orders/circuit-stats - Stats Circuit Breaker
// =============================================
router.get('/circuit-stats', (req, res) => {
  try {
    const stats = paymentClient.getCircuitStats();
    res.status(200).json({
      success: true,
      circuitBreaker: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;