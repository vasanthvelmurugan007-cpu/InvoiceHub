import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UpgradePage from './pages/UpgradePage';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';

// Pages
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Dashboard from './pages/Dashboard';
import Estimates from './pages/Estimates';
import CreateEstimate from './pages/CreateEstimate';
import PurchaseOrders from './pages/PurchaseOrders';
import CreatePO from './pages/CreatePO';
import DeliveryChallans from './pages/DeliveryChallans';
import CreateChallan from './pages/CreateChallan';
import Vendors from './pages/Vendors';
import Expenses from './pages/Expenses';

import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!user) return <LoginPage />;
  return children;
};

const AppContent = () => {
  // Note: The subscription state and useEffect were removed as per the instruction's implied changes.
  // If subscription logic is still needed, it should be re-integrated or moved to AuthContext.
  return (
    <Router>
      <div className="app-container"> {/* Kept original class name for consistency */}
        <Sidebar /> {/* Removed subscription prop as it's no longer managed here */}
        <main className="main-content"> {/* Kept original class name for consistency */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} /> {/* Kept original path and component */}

            <Route path="/estimates" element={<ProtectedRoute><Estimates /></ProtectedRoute>} />
            <Route path="/estimates/new" element={<ProtectedRoute><CreateEstimate /></ProtectedRoute>} />

            <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
            <Route path="/purchase-orders/new" element={<ProtectedRoute><CreatePO /></ProtectedRoute>} />

            <Route path="/delivery-challans" element={<ProtectedRoute><DeliveryChallans /></ProtectedRoute>} />
            <Route path="/delivery-challans/new" element={<ProtectedRoute><CreateChallan /></ProtectedRoute>} />

            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} /> {/* Kept original component */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
