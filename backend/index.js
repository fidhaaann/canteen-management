// Entry point for Express backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const foodItemRoutes = require('./routes/foodItems');
const orderRoutes = require('./routes/orders');
const supplierRoutes = require('./routes/suppliers');
const stockRoutes = require('./routes/stock');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/food-items', foodItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.send('Canteen Management Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
