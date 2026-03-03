import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, CircularProgress, Alert,
  Fade, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/customers')
      .then((res) => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setDialogOpen(true); };
  const openEdit = (c) => { setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' }); setEditId(c.id); setError(''); setDialogOpen(true); };

  const handleSave = async () => {
    setError('');
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, form);
      } else {
        await api.post('/customers', form);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Customer</Button>
      </Box>

      <Fade in>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell>{c.email || '-'}</TableCell>
                  <TableCell>{c.phone || '-'}</TableCell>
                  <TableCell>{c.address || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => openEdit(c)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(c.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No customers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Name" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Email" fullWidth margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" fullWidth margin="normal" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Address" fullWidth margin="normal" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
