const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/suppliers/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get supplier error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/suppliers
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person || null, email || null, phone || null, address || null]
    );
    const [newSupplier] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json(newSupplier[0]);
  } catch (err) {
    console.error('Create supplier error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    await pool.query(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, contact_person || null, email || null, phone || null, address || null, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated[0]);
  } catch (err) {
    console.error('Update supplier error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
