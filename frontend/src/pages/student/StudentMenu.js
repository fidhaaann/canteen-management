import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  IconButton, Badge, Drawer, Divider, CircularProgress, Alert,
  Snackbar
} from '@mui/material';
import {
  Add, Remove, ShoppingCart, LocalDining, AccessTime,
  Close, CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const formatINR = (value) => `₹${Number(value || 0).toFixed(2)}`;

export default function StudentMenu() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const categories = ['all', 'appetizer', 'main_course', 'dessert', 'beverage', 'snack'];
  const categoryLabels = { all: 'All', appetizer: 'Appetizers', main_course: 'Mains', dessert: 'Desserts', beverage: 'Beverages', snack: 'Snacks' };

  useEffect(() => {
    fetchFoodItems();
  }, [filterCategory, filterType]);

  const fetchFoodItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterType !== 'all') params.append('type', filterType);
      const url = `/food-items${params.toString() ? `?${params.toString()}` : ''}`;
      
      const res = await api.get(url);
      setFoodItems(res.data.filter((item) => item.is_available));
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (item) => cart.find(i => i.id === item.id)?.quantity || 0;

  const updateCart = (item, delta) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const nextQty = existing.quantity + delta;
        if (nextQty <= 0) return prev.filter(i => i.id !== item.id);
        return prev.map(i => i.id === item.id ? { ...i, quantity: nextQty } : i);
      } else if (delta > 0) {
        return [...prev, { ...item, quantity: delta }];
      }
      return prev;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const orderData = {
        items: cart.map(i => ({ food_item_id: i.id, quantity: i.quantity, unit_price: i.price }))
      };
      await api.post('/orders/student', orderData);
      setCart([]);
      setDrawerOpen(false);
      setSuccess(true);
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Our Menu</Typography>
        <IconButton
          color="primary"
          onClick={() => setDrawerOpen(true)}
          sx={{ bgcolor: 'background.paper', boxShadow: 1, p: 1 }}
        >
          <Badge badgeContent={totalItems} color="error">
            <ShoppingCart sx={{ fontSize: 28 }} />
          </Badge>
        </IconButton>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, pb: 1, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'primary.light', borderRadius: 3 } }}>
          {categories.map((c) => (
            <Chip
              key={c}
              label={categoryLabels[c]}
              onClick={() => setFilterCategory(c)}
              color={filterCategory === c ? 'primary' : 'default'}
              variant={filterCategory === c ? 'filled' : 'outlined'}
              sx={{ fontWeight: 'bold', cursor: 'pointer', borderRadius: 2 }}
            />
          ))}
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
          {['all', 'veg', 'non-veg'].map((t) => (
            <Button
              key={t}
              size="small"
              variant={filterType === t ? 'contained' : 'outlined'}
              color={t === 'veg' ? 'success' : t === 'non-veg' ? 'error' : 'inherit'}
              onClick={() => setFilterType(t)}
              sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1.5, minWidth: 0 }}
            >
              {t === 'all' ? 'All Types' : t === 'veg' ? 'Vegetarian' : 'Non-Veg'}
            </Button>
          ))}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {foodItems.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <CardContent sx={{ flex: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.name}</Typography>
                  <Chip
                    label={item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    color={item.type === 'veg' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, minHeight: 32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description || 'No description available'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip icon={<LocalDining sx={{ fontSize: 14 }} />} label={categoryLabels[item.category] || item.category} size="small" sx={{ height: 24, fontSize: '0.65rem' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', ml: 'auto', color: 'primary.main' }}>
                    {formatINR(item.price)}
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {getCartQuantity(item) === 0 ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<Add fontSize="small" />}
                    onClick={() => updateCart(item, 1)}
                    sx={{ py: 0.5 }}
                  >
                    Add
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton color="primary" onClick={() => updateCart(item, -1)} size="small" sx={{ border: '1px solid', p: 0.2 }}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ width: 24, textAlign: 'center', fontWeight: 'bold' }}>
                      {getCartQuantity(item)}
                    </Typography>
                    <IconButton color="primary" onClick={() => updateCart(item, 1)} size="small" sx={{ border: '1px solid', p: 0.2 }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {foodItems.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>No items are currently available.</Alert>
      )}

      {/* Cart Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 360 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Your Cart</Typography>
            <IconButton color="inherit" onClick={() => setDrawerOpen(false)} size="small"><Close /></IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <ShoppingCart sx={{ fontSize: 64, mb: 1 }} />
                <Typography variant="subtitle1">Cart is empty</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cart.map(item => (
                  <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatINR(item.price)} x {item.quantity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => updateCart(item, -1)} sx={{ p: 0.5 }}><Remove fontSize="small" /></IconButton>
                        <Typography variant="body2" sx={{ width: 16, textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateCart(item, 1)} sx={{ p: 0.5 }}><Add fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatINR(cartTotal)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={cart.length === 0 || placingOrder}
              onClick={handlePlaceOrder}
              startIcon={placingOrder ? <CircularProgress size={20} color="inherit" /> : <AccessTime />}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {placingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: '100%', alignItems: 'center', fontWeight: 'bold' }}
          icon={<CheckCircle fontSize="large" />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/student/orders')}>
              VIEW RECEIPT
            </Button>
          }
        >
          Order placed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
