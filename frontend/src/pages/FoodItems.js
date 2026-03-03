import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, CircularProgress, Alert,
  Fade, Tooltip, Chip, MenuItem, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

const categories = ['appetizer', 'main_course', 'dessert', 'beverage', 'snack'];
const categoryLabels = { appetizer: 'Appetizer', main_course: 'Main Course', dessert: 'Dessert', beverage: 'Beverage', snack: 'Snack' };
const categoryColors = { appetizer: '#FF9800', main_course: '#4CAF50', dessert: '#E91E63', beverage: '#2196F3', snack: '#9C27B0' };
const emptyForm = { name: '', category: 'main_course', price: '', description: '', is_available: true };

export default function FoodItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/food-items').then((res) => setItems(res.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setDialogOpen(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, description: item.description || '', is_available: !!item.is_available });
    setEditId(item.id); setError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editId) {
        await api.put(`/food-items/${editId}`, payload);
      } else {
        await api.post('/food-items', payload);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try { await api.delete(`/food-items/${id}`); load(); } catch (err) { console.error(err); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Food Items</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Item</Button>
      </Box>

      <Fade in>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                  <TableCell>
                    <Chip label={categoryLabels[item.category]} size="small"
                      sx={{ bgcolor: categoryColors[item.category] + '20', color: categoryColors[item.category], fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={item.is_available ? 'Yes' : 'No'} color={item.is_available ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description || '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => openEdit(item)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(item.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No food items found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Name" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Category" select fullWidth margin="normal" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <MenuItem key={c} value={c}>{categoryLabels[c]}</MenuItem>)}
          </TextField>
          <TextField label="Price" type="number" fullWidth margin="normal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required inputProps={{ step: '0.01', min: '0' }} />
          <TextField label="Description" fullWidth margin="normal" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
          <FormControlLabel control={<Switch checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />} label="Available" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
