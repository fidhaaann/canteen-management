import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Grid, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Fade,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api';

const PIE_COLORS = ['#FF9800', '#4CAF50', '#E91E63', '#2196F3', '#9C27B0'];
const categoryLabels = { appetizer: 'Appetizer', main_course: 'Main Course', dessert: 'Dessert', beverage: 'Beverage', snack: 'Snack' };

export default function Reports() {
  const [dailySales, setDailySales] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/daily-sales'),
      api.get('/reports/category-sales'),
      api.get('/reports/top-items'),
      api.get('/reports/top-customers'),
    ]).then(([ds, cs, ti, tc]) => {
      setDailySales(ds.data.reverse());
      setCategorySales(cs.data.map((c) => ({
        ...c,
        name: categoryLabels[c.category] || c.category,
        revenue: Number(c.revenue),
      })));
      setTopItems(ti.data);
      setTopCustomers(tc.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Reports</Typography>

      <Grid container spacing={3}>
        {/* Daily Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={400}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Daily Sales (Last 30 Days)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sale_date" tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <ReTooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
                    <Bar dataKey="total_revenue" fill="#4CAF50" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Category Sales Pie */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={600}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Sales by Category</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categorySales} dataKey="revenue" nameKey="name" cx="50%" cy="50%"
                      outerRadius={100} label={(e) => `$${e.revenue.toFixed(0)}`}>
                      {categorySales.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <ReTooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Top Selling Items */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={800}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Selling Items</Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Ordered</TableCell>
                        <TableCell>Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topItems.map((item, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                          <TableCell>{categoryLabels[item.category] || item.category}</TableCell>
                          <TableCell>{item.times_ordered}x</TableCell>
                          <TableCell>${Number(item.revenue).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {topItems.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center">No data</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Customers</Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Orders</TableCell>
                        <TableCell>Total Spent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topCustomers.map((c, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                          <TableCell>{c.email || '-'}</TableCell>
                          <TableCell>{c.total_orders}</TableCell>
                          <TableCell>${Number(c.total_spent).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {topCustomers.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center">No data</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}
