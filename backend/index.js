// Entry point for Express backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// TODO: Add routes for auth, customers, food items, orders, suppliers, stock, reports

app.get('/', (req, res) => res.send('Canteen Management Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
