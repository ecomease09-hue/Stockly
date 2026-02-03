
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Customers from './components/Customers';
import Vendors from './components/Vendors';
import VendorLedger from './components/VendorLedger';
import Ledger from './components/Ledger';
import Reports from './components/Reports';
import UserDetails from './components/UserDetails';
import Login from './components/Login';
import SignUp from './components/SignUp';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><Layout><Vendors /></Layout></ProtectedRoute>} />
        <Route path="/vendor-ledger" element={<ProtectedRoute><Layout><VendorLedger /></Layout></ProtectedRoute>} />
        <Route path="/ledger" element={<ProtectedRoute><Layout><Ledger /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><UserDetails /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
      <Analytics />
    </AppProvider>
  );
};

export default App;
