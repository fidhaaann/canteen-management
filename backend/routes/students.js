const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/students/report - Get student buying report
router.get('/report', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view reports' });
    }

    // Total spend and total orders
    const [summary] = await pool.query(`
      SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_spent 
      FROM orders 
      WHERE student_id = ? AND status != 'cancelled'
    `, [req.user.id]);

    // Itemized list of what they bought
    const [items] = await pool.query(`
      SELECT fi.name, fi.category, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_spent
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN food_items fi ON oi.food_item_id = fi.id
      WHERE o.student_id = ? AND o.status != 'cancelled'
      GROUP BY fi.id
      ORDER BY total_spent DESC
    `, [req.user.id]);

    res.json({ summary: summary[0], items });
  } catch (err) {
    console.error('Student report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
