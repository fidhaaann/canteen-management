const express = require('express');
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/dashboard - dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customers');
    const [[{ totalFoodItems }]] = await pool.query('SELECT COUNT(*) AS totalFoodItems FROM food_items');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status != 'cancelled'"
    );
    const [[{ pendingOrders }]] = await pool.query(
      "SELECT COUNT(*) AS pendingOrders FROM orders WHERE status IN ('pending', 'preparing')"
    );
    const [[{ lowStockCount }]] = await pool.query('SELECT COUNT(*) AS lowStockCount FROM v_low_stock');

    const [recentOrders] = await pool.query('SELECT * FROM v_order_summary ORDER BY order_date DESC LIMIT 5');

    res.json({
      totalCustomers,
      totalFoodItems,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockCount,
      recentOrders,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/daily-sales - admin only
router.get('/daily-sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_daily_sales LIMIT 30');
    res.json(rows);
  } catch (err) {
    console.error('Daily sales error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/category-sales - admin only
router.get('/category-sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_category_sales');
    res.json(rows);
  } catch (err) {
    console.error('Category sales error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/top-items - admin only
router.get('/top-items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fi.name, fi.category, COUNT(oi.id) AS times_ordered, SUM(oi.subtotal) AS revenue
       FROM order_items oi
       JOIN food_items fi ON oi.food_item_id = fi.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY fi.id, fi.name, fi.category
       ORDER BY times_ordered DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Top items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/top-customers - admin only
router.get('/top-customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.name, c.email, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_spent
       FROM customers c
       JOIN orders o ON c.id = o.customer_id
       WHERE o.status != 'cancelled'
       GROUP BY c.id, c.name, c.email
       ORDER BY total_spent DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Top customers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
