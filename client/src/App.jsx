import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import OrderOverview from './components/OrderOverview';
import PaymentStatus from './components/PaymentStatus';
import Orders from './components/Orders';
import OrderTracking from './components/OrderTracking';
import SavedAddresses from './components/SavedAddresses';
import Founder from './components/Founder';
import CustomerCare from './components/CustomerCare';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import AdminOrderDetails from './components/AdminOrderDetails';
import AdminUsers from './components/AdminUsers';
import AdminRiders from './components/AdminRiders';
import AdminChefs from './components/AdminChefs';
import AdminFood from './components/AdminFood';
import AdminTickets from './components/AdminTickets';
import AdminLeaves from './components/AdminLeaves';
import RiderDashboard from './components/RiderDashboard';
import ChefDashboard from './components/ChefDashboard';
import PrivateRoute from './components/PrivateRoute';

import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

function AppContent() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                // Allow any path starting with /admin
                if (!location.pathname.startsWith('/admin')) {
                    navigate('/admin');
                }
            } else if (user.email.includes('@rider.nanosoup.com') || user.role === 'rider') {
                if (location.pathname !== '/rider') {
                    navigate('/rider');
                }
            } else if (user.email.includes('@chef.nanosoup.com') || user.role === 'chef') {
                if (location.pathname !== '/chef') {
                    navigate('/chef');
                }
            }
        }
    }, [user, location, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Navbar
                onOpenAuth={() => setAuthModalOpen(true)}
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
            />

            <div
                className={`transition-transform duration-300 ease-in-out ${isProfileOpen ? 'translate-x-[20rem]' : 'translate-x-0'}`}
                onClick={() => isProfileOpen && setIsProfileOpen(false)}
            >
                <Routes>
                    <Route path="/" element={
                        <>
                            <Hero />
                            <Menu onOpenAuth={() => setAuthModalOpen(true)} />
                        </>
                    } />
                    <Route path="/checkout" element={<OrderOverview />} />
                    <Route path="/payment-status" element={<PaymentStatus />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/addresses" element={<SavedAddresses />} />
                    <Route path="/delivery-details/:orderId" element={<OrderTracking />} />
                    <Route path="/founder" element={<Founder />} />
                    <Route path="/help" element={<CustomerCare />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/order/:orderId" element={<PrivateRoute><AdminOrderDetails /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
                    <Route path="/admin/riders" element={<PrivateRoute><AdminRiders /></PrivateRoute>} />
                    <Route path="/admin/chefs" element={<PrivateRoute><AdminChefs /></PrivateRoute>} />
                    <Route path="/admin/food" element={<PrivateRoute><AdminFood /></PrivateRoute>} />
                    <Route path="/admin/tickets" element={<PrivateRoute><AdminTickets /></PrivateRoute>} />
                    <Route path="/admin/leaves" element={<PrivateRoute><AdminLeaves /></PrivateRoute>} />
                    <Route path="/rider" element={<RiderDashboard />} />
                    <Route path="/chef" element={<ChefDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold mb-4">nanosoup.</h2>
                        <p className="text-gray-400 mb-8">Delivering happiness, one meal at a time.</p>
                        <div className="text-sm text-gray-600">
                            © 2024 Nanosoup Inc. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>

            <CartDrawer />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
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
