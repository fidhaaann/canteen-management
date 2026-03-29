import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import FoodItems from './pages/FoodItems';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Stock from './pages/Stock';
import Reports from './pages/Reports';

import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMenu from './pages/student/StudentMenu';
import StudentOrders from './pages/student/StudentOrders';
import StudentReport from './pages/student/StudentReport';

function ProtectedRoute({ children, adminOnly, noStudent }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to={user.role === 'student' ? '/student' : '/'} />;
  if (noStudent && user.role === 'student') return <Navigate to="/student" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/'} /> : <StudentRegister />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute noStudent><Dashboard /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute noStudent><Customers /></ProtectedRoute>} />
        <Route path="food-items" element={<ProtectedRoute noStudent><FoodItems /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute noStudent><Orders /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute noStudent><Suppliers /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute noStudent><Stock /></ProtectedRoute>} />
        <Route
          path="reports"
          element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          }
        />
        
        <Route path="student" element={<StudentDashboard />} />
        <Route path="student/menu" element={<StudentMenu />} />
        <Route path="student/orders" element={<StudentOrders />} />
        <Route path="student/report" element={<StudentReport />} />
      </Route>
      <Route path="*" element={<Navigate to={user?.role === 'student' ? '/student' : '/'} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
