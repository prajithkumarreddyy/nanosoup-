import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import OrderOverview from './components/OrderOverview';
import Orders from './components/Orders';
import OrderTracking from './components/OrderTracking';
import SavedAddresses from './components/SavedAddresses';
import Founder from './components/Founder';
import CustomerCare from './components/CustomerCare';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import AdminOrderDetails from './components/AdminOrderDetails';
import AdminUsers from './components/AdminUsers';

import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

function AppContent() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user?.role === 'admin') {
            // Allow any path starting with /admin
            if (!location.pathname.startsWith('/admin')) {
                navigate('/admin');
            }
        }
    }, [user, location, navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

            <Routes>
                <Route path="/" element={
                    <>
                        <Hero />
                        <Menu onOpenAuth={() => setAuthModalOpen(true)} />
                    </>
                } />
                <Route path="/checkout" element={<OrderOverview />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/addresses" element={<SavedAddresses />} />
                <Route path="/delivery-details/:orderId" element={<OrderTracking />} />
                <Route path="/founder" element={<Founder />} />
                <Route path="/help" element={<CustomerCare />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/order/:orderId" element={<AdminOrderDetails />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <CartDrawer />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">nanosoup.</h2>
                    <p className="text-gray-400 mb-8">Delivering happiness, one meal at a time.</p>
                    <div className="text-sm text-gray-600">
                        © 2024 Nanosoup Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppContent />
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
