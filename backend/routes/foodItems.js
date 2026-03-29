const express = require('express');
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/food-items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM food_items';
    const params = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY category, name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get food items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/food-items/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM food_items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Food item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get food item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/food-items
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, type, price, description, is_available } = req.body;
    if (!name || !category || price == null) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO food_items (name, category, type, price, description, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, type || 'veg', price, description || null, is_available !== false]
    );
    const [newItem] = await pool.query('SELECT * FROM food_items WHERE id = ?', [result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (err) {
    console.error('Create food item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/food-items/:id
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, type, price, description, is_available } = req.body;
    if (!name || !category || price == null) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    await pool.query(
      'UPDATE food_items SET name = ?, category = ?, type = ?, price = ?, description = ?, is_available = ? WHERE id = ?',
      [name, category, type || 'veg', price, description || null, is_available !== false, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM food_items WHERE id = ?', [req.params.id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Food item not found' });
    res.json(updated[0]);
  } catch (err) {
    console.error('Update food item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/food-items/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM food_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Food item not found' });
    res.json({ message: 'Food item deleted' });
  } catch (err) {
    console.error('Delete food item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
