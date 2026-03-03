const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders - list all with summary
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_order_summary ORDER BY order_date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id - single order with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [orderRows] = await pool.query('SELECT * FROM v_order_summary WHERE order_id = ?', [req.params.id]);
    if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, fi.name AS food_item_name, fi.category
       FROM order_items oi
       JOIN food_items fi ON oi.food_item_id = fi.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...orderRows[0], items });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders - create order with items
router.post('/', authenticateToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { customer_id, items, status } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Create order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, total_amount, status, created_by) VALUES (?, 0, ?, ?)',
      [customer_id || null, status || 'pending', req.user.id]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.food_item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    // Recalculate total
    await conn.query(
      'UPDATE orders SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = ?) WHERE id = ?',
      [orderId, orderId]
    );

    await conn.commit();

    // Return the created order
    const [newOrder] = await pool.query('SELECT * FROM v_order_summary WHERE order_id = ?', [orderId]);
    const [orderItems] = await pool.query(
      `SELECT oi.*, fi.name AS food_item_name FROM order_items oi
       JOIN food_items fi ON oi.food_item_id = fi.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(201).json({ ...newOrder[0], items: orderItems });
  } catch (err) {
    await conn.rollback();
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// PUT /api/orders/:id/status - update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM v_order_summary WHERE order_id = ?', [req.params.id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(updated[0]);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
