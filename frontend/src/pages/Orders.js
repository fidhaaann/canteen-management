import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, CircularProgress, Alert,
  Fade, Tooltip, Chip, MenuItem, Select, FormControl, InputLabel,
  Grid, Divider,
} from '@mui/material';
import { Add, Delete, Visibility, RemoveCircle, AddCircle } from '@mui/icons-material';
import api from '../api';

const statusColor = { pending: 'warning', preparing: 'info', ready: 'success', delivered: 'default', cancelled: 'error' };
const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialog, setViewDialog] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ food_item_id: '', quantity: 1 }] });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/orders'),
      api.get('/customers'),
      api.get('/food-items'),
    ]).then(([o, c, f]) => {
      setOrders(o.data);
      setCustomers(c.data);
      setFoodItems(f.data);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ customer_id: '', items: [{ food_item_id: '', quantity: 1 }] });
    setError('');
    setDialogOpen(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { food_item_id: '', quantity: 1 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleSave = async () => {
    setError('');
    const validItems = form.items.filter((i) => i.food_item_id);
    if (validItems.length === 0) { setError('Add at least one item'); return; }

    const orderItems = validItems.map((i) => {
      const fi = foodItems.find((f) => f.id === parseInt(i.food_item_id));
      return { food_item_id: parseInt(i.food_item_id), quantity: parseInt(i.quantity), unit_price: fi?.price || 0 };
    });

    try {
      await api.post('/orders', { customer_id: form.customer_id || null, items: orderItems });
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await api.delete(`/orders/${id}`); load(); } catch (err) { console.error(err); }
  };

  const viewOrder = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setViewDialog(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calcTotal = () => {
    return form.items.reduce((sum, i) => {
      const fi = foodItems.find((f) => f.id === parseInt(i.food_item_id));
      return sum + (fi?.price || 0) * (parseInt(i.quantity) || 0);
    }, 0);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>New Order</Button>
      </Box>

      <Fade in>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.order_id} hover>
                  <TableCell>#{o.order_id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{o.customer_name || 'Walk-in'}</TableCell>
                  <TableCell>₹{Number(o.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select value={o.status} onChange={(e) => updateStatus(o.order_id, e.target.value)} size="small">
                        {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{o.created_by_name}</TableCell>
                  <TableCell>{new Date(o.order_date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View"><IconButton color="primary" onClick={() => viewOrder(o.order_id)}><Visibility /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(o.order_id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* New Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Order</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Customer" select fullWidth margin="normal" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
            <MenuItem value="">Walk-in Customer</MenuItem>
            {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Order Items</Typography>
          {form.items.map((item, idx) => (
            <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <TextField label="Food Item" select fullWidth size="small" value={item.food_item_id}
                  onChange={(e) => updateItem(idx, 'food_item_id', e.target.value)}>
                  {foodItems.filter((f) => f.is_available).map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.name} — ₹{Number(f.price).toFixed(2)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField label="Qty" type="number" fullWidth size="small" value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="error" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddCircle />} onClick={addItem} sx={{ mt: 1 }}>Add Item</Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ textAlign: 'right' }}>
            Total: ₹{calcTotal().toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Place Order</Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewDialog} onClose={() => setViewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Order #{viewDialog?.order_id}</DialogTitle>
        <DialogContent>
          <Typography><strong>Customer:</strong> {viewDialog?.customer_name || 'Walk-in'}</Typography>
          <Typography><strong>Status:</strong> <Chip label={viewDialog?.status} color={statusColor[viewDialog?.status]} size="small" /></Typography>
          <Typography><strong>Created by:</strong> {viewDialog?.created_by_name}</Typography>
          <Typography><strong>Date:</strong> {viewDialog?.order_date && new Date(viewDialog.order_date).toLocaleString()}</Typography>
          <Divider sx={{ my: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {viewDialog?.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.food_item_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{Number(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(item.subtotal).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
            Total: ₹{viewDialog?.total_amount && Number(viewDialog.total_amount).toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
