-- ============================================
-- Canteen Management System - MySQL Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS canteen_management;
USE canteen_management;

-- ============================================
-- TABLES
-- ============================================

-- Users table (Admin and Staff)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Items table
CREATE TABLE IF NOT EXISTS food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('appetizer', 'main_course', 'dessert', 'beverage', 'snack') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock table
CREATE TABLE IF NOT EXISTS stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  food_item_id INT NOT NULL,
  supplier_id INT,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'units',
  reorder_level DECIMAL(10, 2) DEFAULT 10,
  last_restocked TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_by INT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  food_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-calculate subtotal on order_items insert
DELIMITER //
CREATE TRIGGER trg_order_item_subtotal
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  SET NEW.subtotal = NEW.quantity * NEW.unit_price;
END//
DELIMITER ;

-- Update order total when order item is inserted
DELIMITER //
CREATE TRIGGER trg_update_order_total_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = NEW.order_id)
  WHERE id = NEW.order_id;
END//
DELIMITER ;

-- Update order total when order item is deleted
DELIMITER //
CREATE TRIGGER trg_update_order_total_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = OLD.order_id)
  WHERE id = OLD.order_id;
END//
DELIMITER ;

-- Decrease stock when order item is inserted
DELIMITER //
CREATE TRIGGER trg_decrease_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE stock
  SET quantity = GREATEST(quantity - NEW.quantity, 0)
  WHERE food_item_id = NEW.food_item_id;

  -- Mark food item unavailable if stock reaches 0
  UPDATE food_items
  SET is_available = (
    SELECT CASE WHEN COALESCE(SUM(s.quantity), 0) > 0 THEN TRUE ELSE FALSE END
    FROM stock s WHERE s.food_item_id = NEW.food_item_id
  )
  WHERE id = NEW.food_item_id;
END//
DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

-- Order summary view
CREATE OR REPLACE VIEW v_order_summary AS
SELECT
  o.id AS order_id,
  o.order_date,
  c.name AS customer_name,
  c.phone AS customer_phone,
  o.total_amount,
  o.status,
  u.full_name AS created_by_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN users u ON o.created_by = u.id;

-- Daily sales view
CREATE OR REPLACE VIEW v_daily_sales AS
SELECT
  DATE(o.order_date) AS sale_date,
  COUNT(o.id) AS total_orders,
  SUM(o.total_amount) AS total_revenue
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;

-- Category-wise sales view
CREATE OR REPLACE VIEW v_category_sales AS
SELECT
  fi.category,
  COUNT(oi.id) AS items_sold,
  SUM(oi.subtotal) AS revenue
FROM order_items oi
JOIN food_items fi ON oi.food_item_id = fi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY fi.category;

-- Low stock view
CREATE OR REPLACE VIEW v_low_stock AS
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

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Default admin user (password: admin123) and staff user (password: admin123)
-- These hashes will be regenerated by the seed script
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2a$10$placeholder', 'System Admin', 'admin'),
('staff1', '$2a$10$placeholder', 'John Staff', 'staff');

-- Sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('Alice Johnson', 'alice@example.com', '555-0101', '123 Main St'),
('Bob Smith', 'bob@example.com', '555-0102', '456 Oak Ave'),
('Carol Williams', 'carol@example.com', '555-0103', '789 Pine Rd'),
('David Brown', 'david@example.com', '555-0104', '321 Elm St'),
('Eve Davis', 'eve@example.com', '555-0105', '654 Maple Dr');

-- Sample food items
INSERT INTO food_items (name, category, price, description) VALUES
('Caesar Salad', 'appetizer', 8.99, 'Fresh romaine lettuce with caesar dressing'),
('Tomato Soup', 'appetizer', 5.99, 'Creamy tomato soup with croutons'),
('Grilled Chicken', 'main_course', 14.99, 'Grilled chicken breast with vegetables'),
('Pasta Alfredo', 'main_course', 12.99, 'Creamy alfredo pasta with parmesan'),
('Beef Burger', 'main_course', 11.99, 'Classic beef burger with fries'),
('Fish and Chips', 'main_course', 13.99, 'Battered fish with golden fries'),
('Chocolate Cake', 'dessert', 6.99, 'Rich chocolate layer cake'),
('Ice Cream Sundae', 'dessert', 5.49, 'Vanilla ice cream with toppings'),
('Fresh Juice', 'beverage', 4.99, 'Freshly squeezed orange juice'),
('Coffee', 'beverage', 3.49, 'Hot brewed coffee'),
('Tea', 'beverage', 2.99, 'Assorted tea varieties'),
('French Fries', 'snack', 4.49, 'Crispy golden french fries'),
('Spring Rolls', 'snack', 6.49, 'Vegetable spring rolls with dipping sauce');

-- Sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Fresh Farms Ltd', 'Mike Green', 'mike@freshfarms.com', '555-1001', '100 Farm Rd'),
('Ocean Catch Seafood', 'Sarah Blue', 'sarah@oceancatch.com', '555-1002', '200 Harbor St'),
('Baker''s Best', 'Tom White', 'tom@bakersbest.com', '555-1003', '300 Bakery Ln'),
('Beverage World', 'Lisa Red', 'lisa@bevworld.com', '555-1004', '400 Drink Ave');

-- Sample stock
INSERT INTO stock (food_item_id, supplier_id, quantity, unit, reorder_level, last_restocked) VALUES
(1, 1, 50, 'servings', 10, NOW()),
(2, 1, 40, 'servings', 10, NOW()),
(3, 1, 30, 'servings', 8, NOW()),
(4, 1, 35, 'servings', 8, NOW()),
(5, 1, 25, 'servings', 8, NOW()),
(6, 2, 20, 'servings', 5, NOW()),
(7, 3, 45, 'servings', 10, NOW()),
(8, 3, 30, 'servings', 10, NOW()),
(9, 1, 60, 'servings', 15, NOW()),
(10, 4, 100, 'servings', 20, NOW()),
(11, 4, 80, 'servings', 20, NOW()),
(12, 1, 55, 'servings', 10, NOW()),
(13, 1, 40, 'servings', 10, NOW());

-- Sample orders
INSERT INTO orders (customer_id, total_amount, status, created_by) VALUES
(1, 23.98, 'delivered', 1),
(2, 27.97, 'delivered', 2),
(3, 14.99, 'ready', 1),
(4, 18.48, 'preparing', 2),
(5, 11.99, 'pending', 1);

-- Sample order items
INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 8.99, 8.99),
(1, 3, 1, 14.99, 14.99),
(2, 4, 1, 12.99, 12.99),
(2, 7, 1, 6.99, 6.99),
(2, 10, 1, 3.49, 3.49),
(3, 3, 1, 14.99, 14.99),
(4, 9, 1, 4.99, 4.99),
(4, 6, 1, 13.99, 13.99),
(5, 5, 1, 11.99, 11.99);
