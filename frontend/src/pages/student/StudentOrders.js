import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { ConfirmationNumber, LocalShipping, CheckCircle, SearchOff } from '@mui/icons-material';
import api from '../../api';

export default function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(id);
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter(o => o.order_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const viewDetails = async (order) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/orders/${order.order_id}`);
      setOrderDetails(res.data.items);
    } catch (err) {
      alert('Failed to load order details');
      setSelectedOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      delivered: 'default',
      cancelled: 'error'
    };
    return map[status] || 'default';
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>My Orders</Typography>

      {orders.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
          <SearchOff sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="subtitle1" color="text.secondary">You haven't placed any orders yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {orders.map(order => (
            <Grid item xs={12} sm={6} md={4} key={order.order_id}>
              <Card sx={{ borderRadius: 2, borderTop: '4px solid', borderColor: `${getStatusColor(order.status)}.main` }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip size="small" label={order.status.toUpperCase()} color={getStatusColor(order.status)} sx={{ fontWeight: 'bold' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.order_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                    <ConfirmationNumber sx={{ color: 'primary.main', mb: 0.5, fontSize: 20 }} />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>TICKET NO.</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                      {order.slot_ticket || 'N/A'}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    Total: ${parseFloat(order.total_amount).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" fullWidth onClick={() => viewDetails(order)}>
                      Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        disabled={cancelling === order.order_id}
                        onClick={() => cancelOrder(order.order_id)}
                      >
                        {cancelling === order.order_id ? 'Canceling...' : 'Cancel'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>Order Details</span>
          <Chip label={selectedOrder?.status.toUpperCase()} color={getStatusColor(selectedOrder?.status)} size="small" />
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption">YOUR SLOT TICKET</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                  {selectedOrder?.slot_ticket || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>ITEMS</Typography>
              <List disablePadding>
                {orderDetails?.map(item => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={<span style={{ fontWeight: 600 }}>{item.quantity}x {item.food_item_name}</span>}
                      secondary={item.category}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Bill</Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  ${parseFloat(selectedOrder?.total_amount || 0).toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
