const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/stock - list all stock with food item and supplier names
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, fi.name AS food_item_name, fi.category, sup.name AS supplier_name
       FROM stock s
       JOIN food_items fi ON s.food_item_id = fi.id
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       ORDER BY fi.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get stock error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stock/low - get low stock items
router.get('/low', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_low_stock');
    res.json(rows);
  } catch (err) {
    console.error('Get low stock error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stock/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, fi.name AS food_item_name, sup.name AS supplier_name
       FROM stock s
       JOIN food_items fi ON s.food_item_id = fi.id
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Stock entry not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get stock entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stock
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { food_item_id, supplier_id, quantity, unit, reorder_level } = req.body;
    if (!food_item_id || quantity == null) {
      return res.status(400).json({ error: 'Food item and quantity are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO stock (food_item_id, supplier_id, quantity, unit, reorder_level, last_restocked) VALUES (?, ?, ?, ?, ?, NOW())',
      [food_item_id, supplier_id || null, quantity, unit || 'units', reorder_level || 10]
    );

    // Update food item availability
    await pool.query('UPDATE food_items SET is_available = TRUE WHERE id = ?', [food_item_id]);

    const [newStock] = await pool.query(
      `SELECT s.*, fi.name AS food_item_name, sup.name AS supplier_name
       FROM stock s
       JOIN food_items fi ON s.food_item_id = fi.id
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       WHERE s.id = ?`,
      [result.insertId]
    );
    res.status(201).json(newStock[0]);
  } catch (err) {
    console.error('Create stock error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/stock/:id - update/restock
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity, supplier_id, unit, reorder_level } = req.body;
    if (quantity == null) return res.status(400).json({ error: 'Quantity is required' });

    await pool.query(
      'UPDATE stock SET quantity = ?, supplier_id = ?, unit = ?, reorder_level = ?, last_restocked = NOW() WHERE id = ?',
      [quantity, supplier_id || null, unit || 'units', reorder_level || 10, req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT s.*, fi.name AS food_item_name, sup.name AS supplier_name
       FROM stock s
       JOIN food_items fi ON s.food_item_id = fi.id
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (updated.length === 0) return res.status(404).json({ error: 'Stock entry not found' });

    // Update food item availability
    await pool.query(
      'UPDATE food_items SET is_available = ? WHERE id = ?',
      [updated[0].quantity > 0, updated[0].food_item_id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/stock/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM stock WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Stock entry not found' });
    res.json({ message: 'Stock entry deleted' });
  } catch (err) {
    console.error('Delete stock error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
