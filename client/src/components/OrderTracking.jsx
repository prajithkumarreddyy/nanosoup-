import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LiveTrackingMap from './LiveTrackingMap';
import API_URL from '../config';

const OrderTracking = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/'); // Redirect if not logged in
                    return;
                }

                const res = await fetch(`${API_URL}/api/orders`, {
                    headers: { 'x-auth-token': token }
                });

                if (!res.ok) throw new Error('Failed to fetch orders');

                const allOrders = await res.json();
                // Find the specific order from the user's list
                // (Optimallly we would have a getSingleOrder endpoint for users, but filtering client side for now is safe enough for own orders)
                const foundOrder = allOrders.find(o => o._id === orderId);

                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load order details');
            } finally {
                // Only stop loading if it was the initial load
                setLoading(false);
            }
        };

        // Initial Fetch
        if (orderId) {
            fetchOrder();
        }

        // Polling interval (1 second)
        const intervalId = setInterval(() => {
            if (orderId) fetchOrder();
        }, 3000);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [orderId, navigate]);

    if (loading) return (
        <div className="min-h-screen pt-32 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order not found</h2>
            <button onClick={() => navigate('/orders')} className="mt-4 text-primary font-bold">Back to Orders</button>
        </div>
    );

    // Dynamic Content based on Status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Preparing':
                return { icon: '🍳', title: 'Preparing your Order', desc: 'Your food is being prepared with love.' };
            case 'Out for Delivery':
                return { icon: '🛵', title: 'Out for Delivery', desc: 'Our hero is on the way!' };
            case 'Delivered':
                return { icon: '😋', title: 'Order Delivered', desc: 'Enjoy your meal!' };
            case 'Cancelled':
                return { icon: '❌', title: 'Order Cancelled', desc: 'This order has been cancelled.' };
            default: // Processing
                return { icon: '⏳', title: 'Order Received', desc: 'Waiting for restaurant confirmation.' };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Status Card */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center animate-fade-in-up">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-500' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                        {statusInfo.icon}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{statusInfo.title}</h1>
                    <p className="text-gray-500 text-lg mb-6">{statusInfo.desc}</p>

                    {/* Timer */}
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div className="mb-8">
                            <div className="inline-flex flex-col items-center bg-gray-50 px-8 py-4 rounded-2xl border border-gray-200">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Arriving In</p>
                                <CountdownTimer createdAt={order.createdAt} />
                            </div>
                        </div>
                    )}

                    {/* Live Map - Only show when Out for Delivery */}
                    {order.status === 'Out for Delivery' && (
                        <div className="mb-8 w-full animate-fade-in-up">
                            <LiveTrackingMap />
                        </div>
                    )}

                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 inline-block">
                        <p className="text-green-700 font-bold flex items-center gap-2">
                            <span>🕒</span> Order ID: #{order._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Delivery Partner Card (Static for Demo) */}
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 animate-slide-up">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Partner</h2>
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                                <img src="/kethan.jpg" alt="Kethan" className="w-full h-full object-cover bg-gray-200" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-800">Kethan Reddy</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-yellow-400 text-lg">★</span>
                                    <span className="font-bold text-gray-700">4.8</span>
                                    <span className="text-gray-400 text-sm">(500+ deliveries)</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Driving a Honda Activa • KA-05-AB-1234</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <a href="tel:+919876543210" className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                                    📞
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Contact Kethan Reddy</span>
                            <span className="font-bold text-gray-800">+91 98765 43210</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Back to Home
                    </button>
                    <button onClick={() => navigate('/orders')} className="py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
                        View All Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;

const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const createdTime = new Date(createdAt).getTime();
            const targetTime = createdTime + 45 * 60 * 1000; // +45 minutes
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference > 0) {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft('00:00');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [createdAt]);

    return (
        <span className="text-4xl font-mono font-bold text-gray-900 tracking-widest">
            {timeLeft}
        </span>
    );
};
