import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, CircularProgress, Alert,
  Fade, Tooltip, Chip, MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Warning } from '@mui/icons-material';
import api from '../api';

const emptyForm = { food_item_id: '', supplier_id: '', quantity: '', unit: 'servings', reorder_level: '10' };

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/stock'),
      api.get('/food-items'),
      api.get('/suppliers'),
    ]).then(([s, f, sup]) => {
      setStock(s.data);
      setFoodItems(f.data);
      setSuppliers(sup.data);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setDialogOpen(true); };
  const openEdit = (s) => {
    setForm({
      food_item_id: s.food_item_id,
      supplier_id: s.supplier_id || '',
      quantity: s.quantity,
      unit: s.unit || 'servings',
      reorder_level: s.reorder_level || 10,
    });
    setEditId(s.id); setError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      const payload = { ...form, quantity: parseFloat(form.quantity), reorder_level: parseFloat(form.reorder_level) };
      if (editId) await api.put(`/stock/${editId}`, payload);
      else await api.post('/stock', payload);
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stock entry?')) return;
    try { await api.delete(`/stock/${id}`); load(); } catch (err) { console.error(err); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Stock Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            size="small"
            label="Filter Level"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            sx={{ width: 150 }}
            SelectProps={{ native: true }}
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock Only</option>
          </TextField>
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Stock</Button>
        </Box>
      </Box>

      <Fade in>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Food Item</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Reorder Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Restocked</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.filter(s => filterLevel === 'all' || parseFloat(s.quantity) <= parseFloat(s.reorder_level)).map((s) => {
                const isLow = parseFloat(s.quantity) <= parseFloat(s.reorder_level);
                return (
                  <TableRow key={s.id} hover sx={isLow ? { bgcolor: 'error.main', '& td': { color: '#fff' } } : {}}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.food_item_name}</TableCell>
                    <TableCell>{s.supplier_name || '-'}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>{s.unit}</TableCell>
                    <TableCell>{s.reorder_level}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Chip icon={<Warning />} label="Low Stock" color="error" size="small" />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{s.last_restocked ? new Date(s.last_restocked).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit/Restock"><IconButton color={isLow ? 'inherit' : 'primary'} onClick={() => openEdit(s)}><Edit /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton color={isLow ? 'inherit' : 'error'} onClick={() => handleDelete(s.id)}><Delete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {stock.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center">No stock entries found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit / Restock' : 'Add Stock Entry'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!editId && (
            <TextField label="Food Item" select fullWidth margin="normal" value={form.food_item_id}
              onChange={(e) => setForm({ ...form, food_item_id: e.target.value })} required>
              {foodItems.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
            </TextField>
          )}
          <TextField label="Supplier" select fullWidth margin="normal" value={form.supplier_id}
            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
            <MenuItem value="">None</MenuItem>
            {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Quantity" type="number" fullWidth margin="normal" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} required inputProps={{ min: 0, step: '0.01' }} />
          <TextField label="Unit" fullWidth margin="normal" value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <TextField label="Reorder Level" type="number" fullWidth margin="normal" value={form.reorder_level}
            onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} inputProps={{ min: 0 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
