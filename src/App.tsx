import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import NewCustomer from './pages/NewCustomer';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import SalePayment from './pages/SalePayment';
import Invoices from './pages/Invoices';
import Plans from './pages/Plans';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/new" element={<NewCustomer />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/new" element={<NewSale />} />
              <Route path="sales/:id/payment" element={<SalePayment />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="plans" element={<Plans />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;