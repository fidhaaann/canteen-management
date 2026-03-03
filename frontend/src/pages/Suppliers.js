import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, CircularProgress, Alert,
  Fade, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

const emptyForm = { name: '', contact_person: '', email: '', phone: '', address: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/suppliers').then((res) => setSuppliers(res.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setDialogOpen(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, contact_person: s.contact_person || '', email: s.email || '', phone: s.phone || '', address: s.address || '' });
    setEditId(s.id); setError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      if (editId) await api.put(`/suppliers/${editId}`, form);
      else await api.post('/suppliers', form);
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); load(); } catch (err) { console.error(err); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Suppliers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Supplier</Button>
      </Box>

      <Fade in>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                  <TableCell>{s.contact_person || '-'}</TableCell>
                  <TableCell>{s.email || '-'}</TableCell>
                  <TableCell>{s.phone || '-'}</TableCell>
                  <TableCell>{s.address || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => openEdit(s)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(s.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No suppliers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Company Name" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Contact Person" fullWidth margin="normal" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
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
