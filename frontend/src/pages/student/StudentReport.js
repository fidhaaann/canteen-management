import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper
} from '@mui/material';
import { Assessment, CurrencyRupee, TrendingUp } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api';

const formatINR = (value) => `₹${Number(value || 0).toFixed(2)}`;

export default function StudentReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/students/report');
      // Prepare data for recharts
      const chartData = res.data.items.slice(0, 5).map(item => ({
        name: item.name,
        spent: parseFloat(item.total_spent)
      }));
      setReportData({ ...res.data, chartData });
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const { summary, items, chartData } = reportData;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Assessment fontSize="large" color="primary" /> My Buying Report
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'white', borderRadius: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Spent</Typography>
                  <Typography variant="h3">{formatINR(summary.total_spent)}</Typography>
                </Box>
                <CurrencyRupee sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: 'info.light', color: 'white', borderRadius: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Orders</Typography>
                  <Typography variant="h3">{summary.total_orders}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Top Most Purchased Items</Typography>
              <Box sx={{ height: 300 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Legend />
                      <Bar dataKey="spent" name="Amount Spent (₹)" fill="#C64B33" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ mt: 10 }}>No purchase data to display.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Purchase History Details</Typography>
              {items.length > 0 ? (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Spent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell align="right">{row.total_quantity}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {formatINR(row.total_spent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ mt: 10 }}>No items bought yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
