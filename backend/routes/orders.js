const express = require('express');
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders - list all with summary
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = 'SELECT * FROM v_order_summary WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND DATE(order_date) = ?';
      params.push(date);
    }
    
    query += ' ORDER BY order_date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/my-orders - list student's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can view my-orders' });
    const [rows] = await pool.query('SELECT * FROM v_order_summary WHERE student_id = ? ORDER BY order_date DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('Get my-orders error:', err);
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

// POST /api/orders/student - create order for student
router.post('/student', authenticateToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (req.user.role !== 'student') return res.status(403).json({ error: 'Not a student' });

    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Generate random slot ticket
    const ticketStr = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const [orderResult] = await conn.query(
      'INSERT INTO orders (student_id, total_amount, status, slot_ticket) VALUES (?, 0, ?, ?)',
      [req.user.id, 'pending', ticketStr]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.food_item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    await conn.query(
      'UPDATE orders SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = ?) WHERE id = ?',
      [orderId, orderId]
    );

    await conn.commit();
    res.status(201).json({ order_id: orderId, slot_ticket: ticketStr, status: 'pending' });
  } catch (err) {
    await conn.rollback();
    console.error('Create student order error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
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
    // Check if the order exists and get its status and owner
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const order = orders[0];
    
    // Admins can delete any order. Students can only delete their own PENDING orders.
    if (req.user.role === 'admin') {
      // Allow
    } else if (req.user.role === 'student') {
      if (order.student_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
      if (order.status !== 'pending') return res.status(400).json({ error: 'Can only delete pending orders' });
    } else {
      return res.status(403).json({ error: 'Not authorized to delete' });
    }

    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
