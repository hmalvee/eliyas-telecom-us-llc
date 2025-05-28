import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import NewCustomer from './pages/NewCustomer';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import SalePayment from './pages/SalePayment';
import Plans from './pages/Plans';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import RechargeHistory from './pages/RechargeHistory';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/customers" element={<PrivateRoute element={<Customers />} />} />
            <Route path="/customers/new" element={<PrivateRoute element={<NewCustomer />} />} />
            <Route path="/customers/:id" element={<PrivateRoute element={<CustomerDetails />} />} />
            <Route path="/sales" element={<PrivateRoute element={<Sales />} />} />
            <Route path="/sales/new" element={<PrivateRoute element={<NewSale />} />} />
            <Route path="/sales/:id/payment" element={<PrivateRoute element={<SalePayment />} />} />
            <Route path="/plans" element={<PrivateRoute element={<Plans />} />} />
            <Route path="/invoices" element={<PrivateRoute element={<Invoices />} />} />
            <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
            <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
            <Route path="/recharge-history" element={<PrivateRoute element={<RechargeHistory />} />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;