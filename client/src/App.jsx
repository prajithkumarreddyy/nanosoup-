import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import { AuthProvider } from './context/AuthContext';
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

import { Routes, Route, Navigate } from 'react-router-dom';

// ... other imports ...

function App() {
    const [authModalOpen, setAuthModalOpen] = useState(false);

    return (
        <AuthProvider>
            <CartProvider>
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
                        <Route path="/delivery-details" element={<OrderTracking />} />
                        <Route path="/founder" element={<Founder />} />
                        <Route path="/help" element={<CustomerCare />} />
                        <Route path="/settings" element={<Settings />} />
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
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
