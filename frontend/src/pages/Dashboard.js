import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Fade,
} from '@mui/material';
import {
  People, Restaurant, ShoppingCart, AttachMoney, Pending, Warning,
} from '@mui/icons-material';
import api from '../api';

const statCards = [
  { key: 'totalCustomers', label: 'Customers', icon: <People />, color: '#D27A2E' },
  { key: 'totalFoodItems', label: 'Food Items', icon: <Restaurant />, color: '#3B7A57' },
  { key: 'totalOrders', label: 'Orders', icon: <ShoppingCart />, color: '#C64B33' },
  { key: 'totalRevenue', label: 'Revenue', icon: <AttachMoney />, color: '#8B5A3C', prefix: '₹' },
  { key: 'pendingOrders', label: 'Pending', icon: <Pending />, color: '#B9442C' },
  { key: 'lowStockCount', label: 'Low Stock', icon: <Warning />, color: '#B57D2F' },
];

const statusColor = {
  pending: 'warning',
  preparing: 'info',
  ready: 'success',
  delivered: 'default',
  cancelled: 'error',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.key}>
            <Fade in timeout={300 + i * 100}>
              <Card sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {card.prefix || ''}{typeof data?.[card.key] === 'number'
                          ? card.key === 'totalRevenue'
                            ? Number(data[card.key]).toFixed(2)
                            : data[card.key]
                          : 0}
                      </Typography>
                    </Box>
                    <Box sx={{
                      bgcolor: card.color + '20',
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      color: card.color,
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.recentOrders?.map((order) => (
              <TableRow key={order.order_id} hover>
                <TableCell>#{order.order_id}</TableCell>
                <TableCell>{order.customer_name || 'Walk-in'}</TableCell>
                <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColor[order.status]} size="small" />
                </TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">No orders yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
