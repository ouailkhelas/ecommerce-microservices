const express = require('express');
const router = express.Router();
const { pool } = require('../index');

// GET /notifications - Liste toutes les notifications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /notifications - Crée une nouvelle notification
router.post('/', async (req, res) => {
  try {
    const { user_id, message, type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message, type, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [user_id, message, type || 'email']
    );
    
    console.log(`✅ Notification created for user ${user_id}: ${message}`);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Notification creation error:', error);
    res.status(500).json({ error: 'Notification creation failed' });
  }
});

// GET /notifications/:id - Récupère une notification par ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get notification error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /notifications/:id/status - Met à jour le statut d'une notification
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'sent', 'failed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      `UPDATE notifications SET status = $1, sent_at = $2 
       WHERE id = $3 RETURNING *`,
      [status, status === 'sent' ? new Date() : null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    console.log(`📧 Notification ${req.params.id} status updated to: ${status}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update notification status error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

// GET /notifications/user/:user_id - Récupère les notifications d'un utilisateur
router.get('/user/:user_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.user_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;