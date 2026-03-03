# Canteen Management System

A full-stack web application for managing canteen operations, including customers, food items, orders, suppliers, stock, and reporting. Built with React, Node.js/Express, and MySQL.

## Features

- **User Authentication** — JWT-based login with Admin and Staff roles
- **Dashboard** — Animated stat cards, recent orders overview
- **Customers** — Full CRUD management
- **Food Items** — Manage menu items by category with pricing and availability
- **Orders** — Create orders with multiple items, update status, view details
- **Suppliers** — Track supplier contacts and details
- **Stock Management** — Monitor stock levels with low-stock alerts, restock items
- **Reports** — Daily sales charts, category breakdown, top items/customers (admin only)
- **Light/Dark Theme** — Toggle between themes, preference persisted
- **Role-Based Access** — Staff cannot access Reports section
- **Responsive UI** — Works on desktop and mobile with Material UI

## Tech Stack

- **Frontend:** React 18, Material UI 5, Recharts, React Router 6, Axios
- **Backend:** Node.js, Express 4, JWT, bcryptjs
- **Database:** MySQL with triggers, views, and stored procedures

## Project Structure

```
canteen-management/
├── backend/
│   ├── index.js              # Express server entry point
│   ├── db.js                 # MySQL connection pool
│   ├── seed.js               # Database seeder (creates user passwords)
│   ├── .env.example          # Environment variables template
│   ├── middleware/auth.js     # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Login, register, current user
│       ├── customers.js      # Customer CRUD
│       ├── foodItems.js      # Food item CRUD
│       ├── orders.js         # Order CRUD with items
│       ├── suppliers.js      # Supplier CRUD
│       ├── stock.js          # Stock management
│       └── reports.js        # Dashboard stats & report data
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js            # Routing configuration
│       ├── api.js            # Axios instance with JWT
│       ├── theme.js          # MUI theme (light/dark)
│       ├── index.js          # React entry point
│       ├── index.css         # Global styles
│       ├── context/
│       │   ├── AuthContext.js # Authentication state
│       │   └── ThemeContext.js# Theme toggle state
│       ├── components/
│       │   └── Layout.js     # App shell with sidebar & navbar
│       └── pages/
│           ├── Login.js
│           ├── Dashboard.js
│           ├── Customers.js
│           ├── FoodItems.js
│           ├── Orders.js
│           ├── Suppliers.js
│           ├── Stock.js
│           └── Reports.js
└── database/
    └── schema.sql            # Full schema, triggers, views, sample data
```

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run seed   # Seeds admin/staff user passwords
npm run dev    # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start      # Starts on http://localhost:3000
```

### Default Login Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| Staff | staff1   | staff123  |

## API Endpoints

| Method | Endpoint                    | Auth  | Description            |
|--------|-----------------------------|-------|------------------------|
| POST   | /api/auth/login             | No    | Login                  |
| GET    | /api/auth/me                | Yes   | Current user           |
| POST   | /api/auth/register          | Admin | Register user          |
| GET    | /api/customers              | Yes   | List customers         |
| POST   | /api/customers              | Yes   | Create customer        |
| PUT    | /api/customers/:id          | Yes   | Update customer        |
| DELETE | /api/customers/:id          | Yes   | Delete customer        |
| GET    | /api/food-items             | Yes   | List food items        |
| POST   | /api/food-items             | Yes   | Create food item       |
| PUT    | /api/food-items/:id         | Yes   | Update food item       |
| DELETE | /api/food-items/:id         | Yes   | Delete food item       |
| GET    | /api/orders                 | Yes   | List orders            |
| POST   | /api/orders                 | Yes   | Create order           |
| PUT    | /api/orders/:id/status      | Yes   | Update order status    |
| DELETE | /api/orders/:id             | Yes   | Delete order           |
| GET    | /api/suppliers              | Yes   | List suppliers         |
| POST   | /api/suppliers              | Yes   | Create supplier        |
| PUT    | /api/suppliers/:id          | Yes   | Update supplier        |
| DELETE | /api/suppliers/:id          | Yes   | Delete supplier        |
| GET    | /api/stock                  | Yes   | List stock             |
| POST   | /api/stock                  | Yes   | Add stock entry        |
| PUT    | /api/stock/:id              | Yes   | Update/restock         |
| DELETE | /api/stock/:id              | Yes   | Delete stock entry     |
| GET    | /api/reports/dashboard      | Yes   | Dashboard stats        |
| GET    | /api/reports/daily-sales    | Admin | Daily sales data       |
| GET    | /api/reports/category-sales | Admin | Sales by category      |
| GET    | /api/reports/top-items      | Admin | Top selling items      |
| GET    | /api/reports/top-customers  | Admin | Top customers          |

## License

MIT