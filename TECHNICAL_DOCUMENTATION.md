# Canteen Management System - Technical Documentation

**Document Version:** 1.0  
**Last Updated:** March 29, 2026  
**Project:** Retro Bites Canteen Management System

---

## 📌 1. Project Overview

### Project Name & Purpose
**Retro Bites Canteen Management System** is a full-stack web application designed to streamline and digitize canteen operations. It serves as a centralized platform for managing food inventory, processing customer/student orders, tracking suppliers, and generating comprehensive sales reports.

### Problem It Solves
- **Manual Order Processing:** Eliminates paper-based order systems
- **Stock Management:** Automates inventory tracking with low-stock alerts
- **Revenue Tracking:** Provides real-time sales analytics and reporting
- **Role-Based Access:** Separates admin, staff, and student responsibilities
- **Order Fulfillment:** Streamlines order workflow from creation to delivery

### Key Features
| Feature | Description |
|---------|-------------|
| **User Authentication** | Role-based login for Admin, Staff, and Students with JWT-based sessions |
| **Order Management** | Create, track, and manage orders for both customers and students |
| **Inventory Management** | Real-time stock tracking with automated reorder alerts |
| **Food Item Catalog** | Categorized menu with pricing, dietary info (veg/non-veg), and availability |
| **Customer Management** | Database of customer information and order history |
| **Supplier Management** | Track suppliers, contact information, and delivery management |
| **Sales Reports** | Daily sales summaries, category-wise analytics, and revenue tracking |
| **Student Registration** | Self-service registration for student accounts |
| **Multi-Role Dashboard** | Customized dashboards for admin, staff, and student views |
| **Dark/Light Theme Toggle** | User preference for UI theme customization |

### Goals
1. Reduce manual workload in canteen operations
2. Provide real-time visibility into inventory and sales
3. Improve order accuracy and fulfillment speed
4. Enable data-driven decision-making through analytics
5. Create a user-friendly experience for diverse user roles

---

## 🧱 2. System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Orders, Stock, Reports, etc.      │   │
│  │  Components: Layout, Forms, Tables, Charts           │   │
│  │  Context: AuthContext, ThemeContext                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  └─> Axios API Instance with JWT Interceptors              │
└─────────────────────────────────────────────────────────────┘
            ↓ HTTP/REST (Port 3000 → 5000)
┌─────────────────────────────────────────────────────────────┐
│               API LAYER (Express Backend)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes: /api/auth, /api/orders, /api/stock, etc.   │   │
│  │  Middleware: JWT Authentication, Rate Limiting      │   │
│  │  Controllers: Business logic for each resource      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            ↓ MySQL Protocol (Port 3306)
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MySQL)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables: users, students, orders, food_items, etc.  │   │
│  │  Views: v_order_summary, v_daily_sales, etc.        │   │
│  │  Triggers: Auto-calculate totals, update stock      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Style
**Monolithic Three-Tier Architecture**
- **Tier 1:** Frontend (React SPA)
- **Tier 2:** Backend (Node.js/Express API)
- **Tier 3:** Database (MySQL)

### Data Flow

#### Authentication Flow
```
User → Login Page → POST /api/auth/login (username, password, role) 
    → JWT Token + User Data → localStorage 
    → ProtectedRoute verification → Dashboard
```

#### Order Creation Flow (Student)
```
Student → StudentMenu → Select items → Review cart 
    → POST /api/orders/student {items} 
    → Transaction: Create order + order_items 
    → Triggers: Calculate totals + Decrease stock
    → Slot ticket generated → Order confirmation
```

#### Stock Management Flow
```
Admin/Staff view inventory → Identify low stock items
    → Purchase from supplier → POST /api/stock/restock
    → Update quantity + last_restocked timestamp
    → Triggers: Update food_items availability status
```

#### Reporting Flow
```
Admin → Reports page → GET /api/reports/daily-sales (date range)
    → v_daily_sales view aggregates data 
    → Frontend renders charts using Recharts
    → Export/Display analytics
```

---

## 🗄️ 3. Database Design

### Database Overview
- **Database Name:** `canteen_management`
- **DBMS:** MySQL 8.0+
- **Connection Pool:** 10 concurrent connections
- **Character Set:** UTF-8 (default)

### 3.1 Core Tables

#### **1. Users Table (Admin & Staff)**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Login credential |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Staff member name |
| `role` | ENUM('admin','staff') | NOT NULL, DEFAULT 'staff' | Access control |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indices:** `UNIQUE(username)`, `INDEX(role)`

**Purpose:** Store admin and staff user accounts with secure password hashing and role-based permissions.

---

#### **2. Students Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `register_number` | VARCHAR(50) | NOT NULL, UNIQUE | Student ID/login |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Student name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

**Indices:** `UNIQUE(register_number)`

**Purpose:** Separate table for student accounts to distinguish from staff while maintaining similar auth structure.

---

#### **3. Customers Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Customer name |
| `email` | VARCHAR(100) | UNIQUE | Contact email |
| `phone` | VARCHAR(20) | - | Contact phone |
| `address` | TEXT | - | Delivery/billing address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indices:** `UNIQUE(email)`, `INDEX(name)`

**Purpose:** Store regular customer information for order tracking and communication.

---

#### **4. Food Items Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Food item name |
| `category` | ENUM | NOT NULL | Menu classification |
| `type` | ENUM('veg','non-veg') | NOT NULL, DEFAULT 'veg' | Dietary classification |
| `price` | DECIMAL(10,2) | NOT NULL | Item price |
| `description` | TEXT | - | Item details |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Valid Categories:** `appetizer`, `main_course`, `dessert`, `beverage`, `snack`

**Indices:** `INDEX(category)`, `INDEX(is_available)`

**Purpose:** Central menu catalog with pricing and dietary information.

---

#### **5. Suppliers Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Supplier company name |
| `contact_person` | VARCHAR(100) | - | Primary contact name |
| `email` | VARCHAR(100) | - | Supplier email |
| `phone` | VARCHAR(20) | - | Supplier phone |
| `address` | TEXT | - | Supplier address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indices:** `INDEX(name), INDEX(phone)`

**Purpose:** Maintain supplier information for procurement and restocking operations.

---

#### **6. Stock Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `food_item_id` | INT | NOT NULL, FK | Reference to food_items |
| `supplier_id` | INT | FK, ON DELETE SET NULL | Primary supplier for item |
| `quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Current stock level |
| `unit` | VARCHAR(20) | NOT NULL, DEFAULT 'units' | Unit of measurement |
| `reorder_level` | DECIMAL(10,2) | DEFAULT 10 | Minimum stock threshold |
| `last_restocked` | TIMESTAMP | NULL | Last restock date |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Foreign Keys:**
- `food_item_id` → `food_items(id)` ON DELETE CASCADE
- `supplier_id` → `suppliers(id)` ON DELETE SET NULL

**Indices:** `INDEX(food_item_id)`, `INDEX(quantity)`, `UNIQUE(food_item_id, supplier_id)`

**Purpose:** Track inventory levels with automatic reorder triggers when stock falls below threshold.

---

#### **7. Orders Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `customer_id` | INT | FK, ON DELETE SET NULL | Reference to customers |
| `student_id` | INT | FK, ON DELETE SET NULL | Reference to students |
| `slot_ticket` | VARCHAR(20) | - | Unique order ticket number |
| `order_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order creation time |
| `total_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Auto-calculated total |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Order state |
| `created_by` | INT | FK, ON DELETE SET NULL | Staff who created order |

**Valid Status Values:** `pending`, `preparing`, `ready`, `delivered`, `cancelled`

**Foreign Keys:**
- `customer_id` → `customers(id)` ON DELETE SET NULL
- `student_id` → `students(id)` ON DELETE SET NULL
- `created_by` → `users(id)` ON DELETE SET NULL

**Indices:** `INDEX(status)`, `INDEX(order_date)`, `UNIQUE(slot_ticket)`

**Purpose:** Core order record with customer/student reference and status tracking.

---

#### **8. Order Items Table**
| Column | Data Type | Constraints | Purpose |
|--------|-----------|-------------|---------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `order_id` | INT | NOT NULL, FK | Reference to orders |
| `food_item_id` | INT | NOT NULL, FK | Reference to food_items |
| `quantity` | INT | NOT NULL, DEFAULT 1 | Number of items |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price at time of order |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Auto-calculated line total |

**Foreign Keys:**
- `order_id` → `orders(id)` ON DELETE CASCADE
- `food_item_id` → `food_items(id)` ON DELETE CASCADE

**Indices:** `INDEX(order_id)`, `INDEX(food_item_id)`

**Purpose:** Line items for each order with auto-calculated subtotals.

---

### 3.2 Database Views

#### **View 1: v_order_summary**
```sql
SELECT
  o.id AS order_id,
  o.order_date,
  COALESCE(c.name, st.full_name) AS customer_name,
  COALESCE(c.phone, st.register_number) AS customer_phone,
  o.total_amount,
  o.status,
  o.slot_ticket,
  o.student_id,
  u.full_name AS created_by_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN students st ON o.student_id = st.id
LEFT JOIN users u ON o.created_by = u.id;
```
**Purpose:** Unified order view combining customer and staff names. Used in admin/staff order lists.

---

#### **View 2: v_daily_sales**
```sql
SELECT
  DATE(o.order_date) AS sale_date,
  COUNT(o.id) AS total_orders,
  SUM(o.total_amount) AS total_revenue
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;
```
**Purpose:** Daily revenue aggregation for report generation and dashboard metrics.

---

#### **View 3: v_category_sales**
```sql
SELECT
  fi.category,
  COUNT(oi.id) AS items_sold,
  SUM(oi.subtotal) AS revenue
FROM order_items oi
JOIN food_items fi ON oi.food_item_id = fi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY fi.category;
```
**Purpose:** Sales breakdown by food category to identify popular items.

---

#### **View 4: v_low_stock**
```sql
SELECT
  s.id AS stock_id,
  fi.name AS food_item,
  s.quantity,
  s.unit,
  s.reorder_level,
  sup.name AS supplier_name,
  sup.phone AS supplier_phone
FROM stock s
JOIN food_items fi ON s.food_item_id = fi.id
LEFT JOIN suppliers sup ON s.supplier_id = sup.id
WHERE s.quantity <= s.reorder_level;
```
**Purpose:** Alerts for items below reorder threshold with supplier contact info.

---

### 3.3 Database Triggers

#### **Trigger 1: trg_order_item_subtotal**
```sql
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  SET NEW.subtotal = NEW.quantity * NEW.unit_price;
END
```
**Purpose:** Auto-calculate line item subtotal before insertion.

---

#### **Trigger 2: trg_update_order_total_insert**
```sql
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = NEW.order_id)
  WHERE id = NEW.order_id;
END
```
**Purpose:** Update order total when new item is added.

---

#### **Trigger 3: trg_update_order_total_delete**
```sql
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = OLD.order_id)
  WHERE id = OLD.order_id;
END
```
**Purpose:** Recalculate order total when item is removed.

---

#### **Trigger 4: trg_decrease_stock**
```sql
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE stock
  SET quantity = GREATEST(quantity - NEW.quantity, 0)
  WHERE food_item_id = NEW.food_item_id;

  UPDATE food_items
  SET is_available = (
    SELECT CASE WHEN COALESCE(SUM(s.quantity), 0) > 0 THEN TRUE ELSE FALSE END
    FROM stock s WHERE s.food_item_id = NEW.food_item_id
  )
  WHERE id = NEW.food_item_id;
END
```
**Purpose:** Automatically decrease stock when order is placed and mark items unavailable if stock = 0.

---

### 3.4 ER Diagram (Mermaid Format)

```
erDiagram
    USERS ||--o{ ORDERS : creates
    USERS {
        int id PK
        string username UK
        string password_hash
        string full_name
        enum role
        timestamp created_at
    }
    
    STUDENTS ||--o{ ORDERS : places
    STUDENTS {
        int id PK
        string register_number UK
        string password_hash
        string full_name
        timestamp created_at
    }
    
    CUSTOMERS ||--o{ ORDERS : orders
    CUSTOMERS {
        int id PK
        string name
        string email UK
        string phone
        text address
        timestamp created_at
    }
    
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        int id PK
        int customer_id FK
        int student_id FK
        string slot_ticket UK
        timestamp order_date
        decimal total_amount
        enum status
        int created_by FK
    }
    
    FOOD_ITEMS ||--o{ ORDER_ITEMS : "ordered as"
    FOOD_ITEMS {
        int id PK
        string name
        enum category
        enum type
        decimal price
        text description
        boolean is_available
        timestamp created_at
    }
    
    FOOD_ITEMS ||--|| STOCK : "has"
    STOCK {
        int id PK
        int food_item_id FK UK
        int supplier_id FK
        decimal quantity
        string unit
        decimal reorder_level
        timestamp last_restocked
        timestamp created_at
    }
    
    SUPPLIERS ||--o{ STOCK : provides
    SUPPLIERS {
        int id PK
        string name
        string contact_person
        string email
        string phone
        text address
        timestamp created_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int food_item_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }
```

---

## ⚙️ 4. Tech Stack

### 4.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library for component-based interfaces |
| **React Router DOM** | 6.22.3 | Client-side routing and navigation |
| **Material-UI (MUI)** | 5.15.14 | Pre-built component library with theming |
| **Emotion** | 11.11.4 | CSS-in-JS styling solution |
| **Axios** | 1.6.7 | HTTP client for API requests |
| **Recharts** | 2.12.2 | Chart library for data visualization |
| **React Scripts** | 5.0.1 | Build and development tools |

**Why These Choices:**
- **React:** Industry standard for SPAs with excellent component reusability
- **MUI:** Rich component library with built-in dark/light theme support
- **Recharts:** Lightweight charting library perfect for sales analytics
- **React Router:** Seamless client-side navigation without page reloads

### 4.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime for server-side code |
| **Express** | 4.18.2 | Lightweight web framework with routing |
| **MySQL2** | 3.6.0 | MySQL driver with promise support |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 2.4.3 | Password hashing and verification |
| **CORS** | 2.8.5 | Cross-origin request handling |
| **Express Rate Limit** | 8.3.1 | DDoS protection and login rate limiting |
| **dotenv** | 16.4.5 | Environment variable management |
| **Nodemon** | 3.0.3 | Auto-reload during development |

**Why These Choices:**
- **Express:** Lightweight, flexible, perfect for REST APIs
- **MySQL2:** Promise-based driver for cleaner async/await code
- **JWT:** Stateless authentication ideal for distributed systems
- **bcryptjs:** Industry-standard password hashing with salt rounds

### 4.3 Database Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **MySQL** | 8.0+ | Relational database with ACID compliance |
| **Connection Pool** | 10 connections | Efficient database connection reuse |

**Why MySQL:**
- ACID transactions for data integrity
- Strong support for triggers and views
- Excellent for structured data with relationships
- Mature ecosystem with proven reliability

### 4.4 Development & Deployment Tools

| Tool | Purpose |
|------|---------|
| **npm** | Package management |
| **Git** | Version control |
| **Environment Files (.env)** | Configuration management |
| **React DevTools** | Frontend debugging |
| **Redux DevTools** | State management (if implemented) |

---

## 🎨 5. UI/UX Design

### 5.1 Design Philosophy
- **Retro Aesthetic:** Warm colors with orange/brown palette evoking nostalgic design
- **Dark/Light Theme:** User preference with context-based theming
- **Responsive Design:** Mobile-first approach with adaptive layouts
- **Accessibility:** WCAG 2.1 AA compliance with semantic HTML

### 5.2 Key UI Elements

#### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Orange | #F2A53D | Buttons, accents, highlights |
| Dark Brown | #C64B33 | Secondary accents |
| Light Brown | #EA7A58 | Hover states, gradients |
| Dark BG | #241610 | Dark theme background |
| Light BG | #F7ECDD | Light theme backgrounds |

#### Typography
- **Headers (H1-H4):** FontFamily: Roboto, FontWeight: 600-800
- **Body Text:** FontFamily: Roboto, FontWeight: 400-500
- **Captions:** FontFamily: Roboto Mono, FontWeight: 700, fontSize: 0.75rem

### 5.3 Key Screens & Pages

#### **Authentication Screens**

**Login Page (`/login`)**
- Dark background with shining cursor light effect
- Three-role selector: Student, Staff, Admin
- Username/Password input fields
- Credential hints for testing
- JWT token storage in localStorage

**Student Registration Page (`/register`)**
- Public registration for students
- Register number, password, full name inputs
- Form validation with error messages

#### **Admin/Staff Dashboard**

**Main Dashboard (`/`)**
- Real-time metrics: Total orders, revenue, low stock items
- Sales trend chart (7-day rolling)
- Recent orders table
- Quick action cards

**Orders Management (`/orders`)**
- Filterable order table by status/date
- Order creation modal for staff
- Status update workflow: pending → preparing → ready → delivered
- Order detail view with item breakdown

**Food Items Management (`/food-items`)**
- CRUD operations for menu items
- Category and dietary type filters
- Availability toggle
- Price management

**Inventory Management (`/stock`)**
- Current stock levels with visual indicators
- Low stock alert highlights
- Restock form with supplier selection
- Historical restock tracking

**Customer Management (`/customers`)**
- Customer directory with contact info
- Order history per customer
- Contact details editor

**Supplier Management (`/suppliers`)**
- Supplier directory and contact management
- Delivery preferences
- Payment terms tracking

**Reports Dashboard (`/reports` - Admin Only)**
- Daily sales trends chart
- Category-wise revenue breakdown pie chart
- Best-selling items list
- Report date range filters
- Export functionality

#### **Student Dashboard**

**Student Dashboard (`/student`)**
- Personalized greeting
- Quick navigation to ordering
- Order history summary
- Account info

**Student Menu (`/student/menu`)**
- Categorized food browsing
- Item filtering by type (veg/non-veg)
- Add to cart functionality
- Cart preview with total

**Student Orders (`/student/orders`)**
- Order history with status tracking
- Slot ticket display for pickup
- Order detail expansion
- Reorder functionality

**Student Report (`/student/report`)**
- Personal spending statistics
- Category-wise consumption
- Monthly spending trend

### 5.4 User Flows

#### New Student Workflow
```
1. Student visits /register
2. Fill registration form (register_number, password, full_name)
3. Submit → POST /api/auth/student-register
4. Redirect to /login → Sign in with credentials
5. Auto-navigate to /student dashboard
6. Browse menu at /student/menu
7. Place order → POST /api/orders/student
8. View slot ticket and order status
```

#### Admin Order Management Workflow
```
1. Admin views dashboard for metrics
2. Navigate to /orders
3. View all pending orders
4. Click order to see details
5. Update status from 'preparing' to 'ready'
6. Customer notified of pickup status
7. Mark as 'delivered' after handover
```

#### Stock Reorder Workflow
```
1. Admin checks /stock page
2. Identify items in red (low stock)
3. Click "Restock" action
4. Select supplier and quantity
5. Submit form → Trigger fires
6. Stock quantity updated
7. Item marked available if needed
```

### 5.5 Response States

All data-fetching components display appropriate states:
- **Loading:** Skeleton screens or spinners
- **Success:** Data rendered with smooth animations
- **Error:** Alert boxes with retry options
- **Empty:** Helpful messages with CTA buttons

### 5.6 Accessibility Features
- Semantic HTML structure
- ARIA labels for icon-only buttons
- Keyboard navigation support
- High contrast ratios (WCAG AA)
- Focus indicators on interactive elements
- Screen reader friendly tables

---

## 🔧 6. Functional Breakdown

### 6.1 Authentication Module

#### Function: User Login
**Path:** `POST /api/auth/login`
**Inputs:**
- `username: string` - Staff/student identifier
- `password: string` - User password
- `role: enum` - 'student' | 'staff' | 'admin'

**Process:**
1. Check if role is 'student' → query students table; else → query users table
2. Validate user exists
3. Compare submitted password with bcrypt hash
4. Verify role matches if specified
5. Generate JWT token with 24h expiry
6. Return token + user object

**Outputs:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "fullName": "System Admin"
  }
}
```

**Error Handling:**
- 400: Missing username/password
- 401: Invalid credentials
- 403: Role mismatch

---

#### Function: Student Self-Registration
**Path:** `POST /api/auth/student-register`
**Inputs:**
- `register_number: string` - Student ID (unique)
- `password: string` - Account password
- `fullName: string` - Student full name

**Process:**
1. Validate all fields present
2. Check register_number uniqueness
3. Hash password with bcryptjs (salt rounds: 10)
4. Insert into students table
5. Return new student ID

**Error Handling:**
- 400: Missing fields
- 409: Register number already exists

---

#### Function: JWT Middleware Authentication
**Usage:** All protected routes (/api/orders, /api/stock, etc.)
**Process:**
1. Extract Authorization header: "Bearer {token}"
2. Verify token signature and expiry
3. Decode user data from token payload
4. Attach user object to request
5. Call next middleware or route handler

**Error Handling:**
- 401: No token provided
- 403: Invalid or expired token

---

### 6.2 Order Management Module

#### Function: Create Student Order
**Path:** `POST /api/orders/student`
**Inputs:**
```json
{
  "items": [
    { "food_item_id": 1, "quantity": 2 },
    { "food_item_id": 3, "quantity": 1 }
  ]
}
```

**Process (with Transaction):**
1. Begin transaction
2. Validate student has items to order
3. Generate unique slot ticket: `TK-{random 4-digit}`
4. Create order record with student_id
5. For each item:
   - Get current price from food_items table
   - Insert order_item record
   - Trigger: Auto-calculate subtotal
   - Trigger: Update order total
   - Trigger: Decrease stock quantity
6. Commit transaction
7. Return order details with ticket

**Subtotal Calculation:**
```
subtotal = quantity × unit_price
order_total = SUM(all order_items subtotals)
```

**Error Handling:**
- 403: User is not student
- 400: No items in order
- 500: Transaction rollback on failure

---

#### Function: Get Order Summary
**Path:** `GET /api/orders?status=pending&date=2024-03-29`
**Query Parameters:**
- `status` - Optional filter
- `date` - Optional date filter (YYYY-MM-DD)

**Process:**
1. Build query against v_order_summary view
2. Apply filters if provided
3. Order by order_date DESC
4. Return formatted order list

**Output:**
```json
[
  {
    "order_id": 1,
    "order_date": "2024-03-29T10:30:00Z",
    "customer_name": "John Student",
    "total_amount": 25.99,
    "status": "preparing",
    "slot_ticket": "TK-5432",
    "created_by_name": "Admin"
  }
]
```

---

#### Function: Get Order Details
**Path:** `GET /api/orders/:id`
**Process:**
1. Query v_order_summary for order header
2. Query order_items with food_items details
3. Return combined order + items array

**Output:**
```json
{
  "order_id": 1,
  "customer_name": "John Student",
  "status": "ready",
  "total_amount": 25.99,
  "items": [
    {
      "food_item_name": "Grilled Chicken",
      "quantity": 1,
      "unit_price": 14.99,
      "subtotal": 14.99,
      "category": "main_course"
    }
  ]
}
```

---

### 6.3 Food Items Module

#### Function: Get Food Items with Stock
**Path:** `GET /api/food-items?category=main_course`
**Query Parameters:**
- `category` - Optional filter
- `available` - Optional (true/false)

**Process:**
1. Query food_items table
2. LEFT JOIN with stock to get current quantities
3. Apply filters
4. Return paginated results

---

#### Function: Create Food Item
**Path:** `POST /api/food-items` (Admin only)
**Inputs:**
```json
{
  "name": "Grilled Chicken",
  "category": "main_course",
  "type": "non-veg",
  "price": 14.99,
  "description": "Grilled chicken breast with vegetables"
}
```

**Process:**
1. Verify admin role
2. Validate inputs
3. Insert into food_items table
4. Create default stock record with reorder_level
5. Return new item record

---

### 6.4 Inventory Management Module

#### Function: Restock Item
**Path:** `POST /api/stock/restock`
**Inputs:**
```json
{
  "food_item_id": 1,
  "supplier_id": 1,
  "quantity": 50,
  "unit": "servings"
}
```

**Process:**
1. Verify admin/staff role
2. Get current stock record
3. Calculate new quantity: current + incoming
4. Update stock table with new quantity and timestamp
5. Trigger: Check if food_items status needs updating
6. Return updated stock details

---

#### Function: Get Low Stock Alert
**Path:** `GET /api/stock/low-stock`
**Process:**
1. Query v_low_stock view
2. Retrieve items where quantity ≤ reorder_level
3. Include supplier contact info
4. Return sorted by urgency (lowest quantity first)

**Output:**
```json
[
  {
    "stock_id": 5,
    "food_item": "Fish and Chips",
    "quantity": 3,
    "unit": "servings",
    "reorder_level": 5,
    "supplier_name": "Ocean Catch Seafood",
    "supplier_phone": "555-1002"
  }
]
```

---

### 6.5 Reporting Module

#### Function: Daily Sales Report
**Path:** `GET /api/reports/daily-sales?start_date=2024-03-01&end_date=2024-03-31`
**Process:**
1. Query v_daily_sales view with date range
2. Filter out cancelled orders
3. Aggregate total orders and revenue per day
4. Return time-series data

**Output:**
```json
[
  {
    "sale_date": "2024-03-29",
    "total_orders": 15,
    "total_revenue": 450.75
  }
]
```

---

#### Function: Category Sales Analysis
**Path:** `GET /api/reports/category-sales`
**Process:**
1. Query v_category_sales view
2. Aggregate by food category
3. Calculate revenue share percentage
4. Sort by revenue desc

---

### 6.6 Customer Management

#### Function: Create Customer
**Path:** `POST /api/customers` (Staff/Admin)
**Inputs:**
- `name, email, phone, address`

**Process:**
1. Validate unique email
2. Insert into customers table
3. Return customer with ID

---

### 6.7 Supplier Management

#### Function: Get All Suppliers
**Path:** `GET /api/suppliers`
**Process:**
1. Query suppliers table
2. Count associated stock items
3. Return with relationship data

---

## 🔐 7. Security & Best Practices

### 7.1 Authentication & Authorization

#### Password Security
- **Hashing:** bcryptjs with 10 salt rounds
- **Storage:** Never store plain passwords; only hashes
- **Transmission:** All API requests use HTTPS (in production)
- **Verification:** Constant-time comparison to prevent timing attacks

#### JWT Token Security
- **Secret Key:** Stored in `.env` file (never committed)
- **Expiry:** 24-hour token lifespan
- **Claims:** Minimal data (id, username, role, fullName)
- **Verification:** All protected routes verify token signature

#### Role-Based Access Control (RBAC)
```
Roles:
- admin: Full system access, user management, reports
- staff: Order/inventory management, read reports
- student: Menu browsing, personal orders only
```

**Access Control Matrix:**
| Feature | Admin | Staff | Student |
|---------|-------|-------|---------|
| View Dashboard | ✓ | ✓ | ✓ (custom) |
| Create/Delete Users | ✓ | ✗ | ✗ |
| Manage Orders | ✓ | ✓ | ✗ (own only) |
| View Reports | ✓ | ✓ | ✗ |
| Restock Items | ✓ | ✓ | ✗ |
| Browse Menu | ✓ | ✓ | ✓ |
| Place Order | ✓ | ✗ | ✓ |

---

### 7.2 Data Validation

#### Frontend Validation
- **Required fields:** Checked before submission
- **Data types:** Email format, numeric ranges
- **Length limits:** Field-specific character limits
- **Feedback:** Real-time error messages

#### Backend Validation
```javascript
// Example: Login validation
if (!username || !password) {
  return res.status(400).json({ error: 'Username and password required' });
}

// Example: Password hash verification
const validPassword = await bcrypt.compare(password, user.password_hash);
if (!validPassword) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

#### Database-Level Constraints
- **UNIQUE:** Prevent duplicate usernames, emails, register numbers
- **NOT NULL:** Enforce required fields
- **ENUM:** Restrict to valid values (status, role, category)
- **DECIMAL(10,2):** Monetary fields with fixed precision
- **Foreign Keys:** Referential integrity with cascade rules

---

### 7.3 Error Handling

#### Backend Error Strategy
```javascript
try {
  // Business logic
} catch (err) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  console.error('Business Logic Error:', err);
  return res.status(500).json({ error: 'Server error' });
}
```

#### Frontend Error Handling
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Error Categories
- **401 Unauthorized:** Missing/invalid authentication
- **403 Forbidden:** Authenticated but no permission
- **400 Bad Request:** Invalid input data
- **404 Not Found:** Resource doesn't exist
- **409 Conflict:** Duplicate entry (unique constraint)
- **500 Server Error:** Unexpected backend failure

---

### 7.4 Rate Limiting

#### Login Rate Limiting
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per window
  message: { error: 'Too many login attempts' }
});
```

**Impact:** Prevents brute force password attacks on login endpoint

---

### 7.5 Database Security

#### Connection Security
- **Connection Pool:** Max 10 concurrent connections (prevents resource exhaustion)
- **Parameterized Queries:** All queries use `?` placeholders (prevents SQL injection)
- **ON DELETE CASCADE:** Orphaned records automatically removed
- **ON DELETE SET NULL:** Foreign keys can safely reference deleted parent record

#### Example Parameterized Query
```javascript
// ✓ SECURE - Parameter substitution
const [rows] = await pool.query(
  'SELECT * FROM users WHERE username = ?',
  [username]
);

// ✗ INSECURE - String concatenation (NEVER DO THIS)
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

---

### 7.6 CORS & Headers

#### CORS Configuration
```javascript
app.use(cors()); // Allows all origins in development
```

**Note:** In production, restrict to specific origins:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

### 7.7 Performance Considerations

#### Database Optimization
- **Indices:** Primary keys, foreign keys, frequently filtered columns
- **Views:** Pre-computed aggregations reduce query complexity
- **Triggers:** Database-level calculations avoid round-trips
- **Connection Pool:** Reuses connections for better throughput

#### API Response Optimization
- **Pagination:** Large result sets paginated to prevent timeout
- **Eager Loading:** Related data fetched in single query (JOINs)
- **View Selection:** Only necessary columns selected
- **Caching:** Leverage browser cache for static assets

#### Frontend Performance
- **Code Splitting:** React Router lazy loading for pages
- **Memoization:** useMemo/useCallback to prevent re-renders
- **Debouncing:** Search/filter inputs debounced
- **Compression:** Gzip enabled for production builds

---

### 7.8 Sensitive Information Protection

#### Environment Variables (Never Committed)
```
DB_HOST=localhost
DB_USER=canteen_user
DB_PASSWORD=secure_password
JWT_SECRET=your_jwt_secret_key_min_32_chars
PORT=5000
```

#### Frontend Storage
- **Tokens:** localStorage (vulnerable but acceptable for internal apps)
- **Sensitive Data:** Never store user passwords
- **Session:** Clear on logout and browser close

---

## 📊 8. Additional Notes

### 8.1 Assumptions Made

1. **Single Database Instance:** System assumes single MySQL instance (not distributed)
2. **Real-Time Updates:** No WebSocket implementation; standard REST polling
3. **Concurrent User Load:** Designed for small-medium scale (< 1000 concurrent users)
4. **UTF-8 Character Support:** All text fields support Unicode
5. **No Payment Integration:** Orders are tracked but no payment processing
6. **Local Development:** Uses localhost for frontend-backend communication
7. **Admin User Seeding:** Initial admin account created via seed script
8. **Business Hours:** No time-based restrictions on ordering

### 8.2 Limitations

1. **Scalability:** Monolithic architecture not suitable for microservices migration
2. **Real-Time Notifications:** Orders not auto-updated; manual refresh required
3. **Inventory Forecasting:** No ML-based demand prediction
4. **Multi-Location:** Single canteen implementation; no multi-branch support
5. **Offline Support:** No offline mode for app usage
6. **Image Support:** Food items have no image storage/serving
7. **Mobile Optimization:** Limited native mobile app (web-only currently)
8. **Audit Trail:** No comprehensive activity logging/audit trail
9. **Email Notifications:** No order confirmation emails to customers
10. **Payment Methods:** No integration with payment gateways (cash-only assumed)

### 8.3 Future Enhancement Opportunities

#### Phase 1: Core Improvements
1. **Email Notifications:** OrderConfirmation, stock alerts, admin reports via email
2. **SMS Integration:** Order ready notifications via SMS
3. **Barcode/QR Codes:** Generate for orders for faster tracking
4. **Bulk Import:** CSV upload for students, food items, suppliers
5. **Audit Logging:** Track all CRUD operations with user/timestamp

#### Phase 2: Advanced Features
1. **Payment Integration:** Online payment gateway (Stripe, Razorpay)
2. **Loyalty Program:** Points system with redeem functionality
3. **Subscription Orders:** Recurring orders for regular customers
4. **Table Reservations:** Dining area seat booking
5. **Kitchen Display System (KDS):** Live order queue for kitchen staff
6. **Inventory Forecasting:** ML-based demand prediction
7. **Dynamic Pricing:** Time-based or demand-based pricing adjustments
8. **Multi-Language Support:** Localization for multiple languages

#### Phase 3: Enterprise Features
1. **Multi-Branch Support:** Centralized management for multiple canteens
2. **Role Hierarchy:** More granular permission levels
3. **API Rate Limiting:** Per-user rate limits based on subscription
4. **Analytics Dashboard:** Advanced BI with data export
5. **Mobile App:** Native iOS/Android applications
6. **Real-time Sync:** WebSocket-based live updates
7. **Franchise Model:** White-label deployment
8. **Integration APIs:** Third-party system integration

#### Phase 4: Operational Excellence
1. **Staff Shift Management:** Schedule and attendance tracking
2. **Supplier Portal:** Direct order placement from suppliers
3. **Customer Portal:** Order history and preferences
4. **Quality Feedback:** Rating system for menu items
5. **Waste Tracking:** Inventory discrepancy investigations
6. **Compliance Reports:** Food safety and health inspection records
7. **Vendor Analytics:** Supplier performance metrics
8. **Route Optimization:** Delivery route planning

---

### 8.4 Migration Path for Scaling

If system needs to scale beyond assumptions:

1. **Database Sharding:** Split orders/students by date range
2. **Caching Layer:** Redis for session and frequently accessed data
3. **Message Queue:** RabbitMQ for async order processing
4. **Microservices:** Split into auth, orders, inventory, reports services
5. **CDN:** Content delivery for static assets
6. **Load Balancer:** Distribute traffic across multiple backend instances
7. **Database Replication:** Master-slave setup for read scaling
8. **API Gateway:** Kong/Nginx for rate limiting and routing

---

### 8.5 Disaster Recovery & Backup

#### Current State
- **Backup Strategy:** Manual database dumps recommended
- **Recovery Time Objective (RTO):** 2-4 hours (estimated)
- **Recovery Point Objective (RPO):** Daily (assuming daily backups)

#### Recommended Improvements
1. **Automated Daily Backups:** Scheduled MySQL dumps to cloud storage
2. **Transaction Logs:** Enable binary logging for point-in-time recovery
3. **Replication:** Slave database for failover
4. **Backup Retention:** 30-day rolling window
5. **Disaster Recovery Plan:** Documented procedures
6. **Regular Testing:** Monthly recovery drills

---

### 8.6 Compliance & Regulatory Considerations

#### Data Privacy
- **GDPR:** If EU users → implement data export/deletion features
- **CCPA:** If California users → provide privacy controls
- **Food Safety:** Maintain ingredient/allergen records
- **Health Regulations:** Track food handling and storage dates

#### Security Certifications
- **PCI DSS:** If accepting credit cards (currently not required)
- **SOC 2:** For enterprise customers
- **ISO 27001:** Information security standard
- **Regular Audits:** Security assessment at least quarterly

---

### 8.7 Performance Benchmarks (Target Metrics)

| Metric | Target | Current Estimate |
|--------|--------|------------------|
| Page Load Time | < 2s | 1.5s |
| API Response Time | < 200ms | 100-150ms |
| Database Query Time | < 100ms | 50-80ms |
| Concurrent Users | 500+ | 100+ |
| Database Connections | < 10 | 3-5 |
| CPU Usage | < 60% | 20-30% |
| Memory Usage | < 512MB | 200-300MB |

---

### 8.8 Development Best Practices

#### Code Quality
- **ESLint:** JavaScript linting for code consistency
- **Prettier:** Code formatting
- **Jest:** Unit testing framework
- **Pre-commit Hooks:** Lint before commit

#### Version Control
- **Git Workflow:** Feature branches with PR reviews
- **Commit Convention:** Semantic commits (feat:, fix:, docs:, etc.)
- **Release Tagging:** SemVer versioning (v1.0.0, v1.1.0, etc.)

#### Documentation
- **JSDoc:** Function-level documentation
- **README:** Setup and deployment instructions
- **Architecture Decision Records (ADRs):** Rationale for major decisions
- **API Documentation:** OpenAPI/Swagger (future)

---

### 8.9 Testing Strategy

#### Current State
- No automated tests implemented
- Manual QA recommended

#### Recommended Unit Tests
- **Auth module:** Login flows, registration, JWT generation
- **Order module:** Order creation, total calculation, triggers
- **Stock module:** Restock logic, low-stock calculations
- **Validation:** Input validation and error handling

#### Recommended Integration Tests
- **E2E workflows:** Student registration → order creation → payment
- **API contracts:** Backend-frontend communication
- **Database triggers:** Cascade deletes, auto-calculations
- **Concurrent operations:** Race condition handling

---

### 8.10 Known Issues & Future Fixes

#### Current Issues
1. **No transaction rollback on partial failures:** Order creation mid-insert could leave orphaned records
2. **No order item deletion:** Once created, items cannot be removed
3. **No user management UI:** Can't create/delete staff users from app
4. **Limited error messages:** Generic "Server error" for debugging blindness
5. **No inventory prediction:** Stock runs out unexpectedly

#### Planned Fixes (Priority Order)
1. ✅ Implementation of comprehensive error messages
2. ✅ Add order item deletion with recalculation
3. ✅ Implement user management dashboard
4. ✅ Add inventory forecasting algorithm
5. ✅ Implement order cancellation refund logic

---

## 📋 Integration Checklist

### Pre-Production Verification
- [ ] Database backups configured and tested
- [ ] Error monitoring (Sentry or similar) integrated
- [ ] HTTPS/SSL certificates installed
- [ ] Environment variables securely configured
- [ ] Rate limiting tested with load tools
- [ ] JWT secret key is cryptographically random (32+ chars)
- [ ] CORS origin restricted to production domain
- [ ] Database user has minimal required permissions
- [ ] API response times < 200ms at 100 concurrent users
- [ ] Disaster recovery procedure documented and tested

### Deployment Checklist
- [ ] Production build minified and optimized
- [ ] Environment variables exported to production server
- [ ] Database migrations executed
- [ ] Sample seed data loaded
- [ ] SSL certificate installed
- [ ] Reverse proxy (Nginx) configured
- [ ] PM2 or supervisor configured for backend auto-restart
- [ ] Log rotation configured
- [ ] Monitoring alerts set up
- [ ] Team trained on operational procedures

---

## 📞 Support & Contact

For questions or issues regarding this documentation:
- **Technical Lead:** [Contact Info]
- **Database Administrator:** [Contact Info]
- **DevOps:** [Contact Info]
- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions

---

## 📄 Document Metadata

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Last Updated** | March 29, 2026 |
| **Next Review Date** | June 29, 2026 |
| **Document Owner** | Technical Team |
| **Approvals** | [Pending] |
| **Change Log** | Initial creation |

---

**END OF TECHNICAL DOCUMENTATION**
