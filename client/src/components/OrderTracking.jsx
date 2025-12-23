import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LiveTrackingMap from './LiveTrackingMap';
import API_URL from '../config';

const OrderTracking = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Check query params for payment status
        const searchParams = new URLSearchParams(location.search);
        const status = searchParams.get('status');
        if (status === 'SUCCESS') {
            setShowSuccessPopup(true);
            // Optionally clear the query param so refresh doesn't show it again
            // window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

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
            case 'Prepared':
                return { icon: '🥡', title: 'Order Prepared', desc: 'Waiting for rider to pickup your order.' };
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
                        <div className="mb-10">
                            <div className="inline-flex flex-col items-center bg-gray-50/50 backdrop-blur-sm px-10 py-6 rounded-3xl border border-gray-100 shadow-inner">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Estimated Arrival</p>
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

                    <div className="px-6 py-2 bg-green-50 rounded-full border border-green-100 inline-block shadow-sm">
                        <p className="text-green-700 font-bold flex items-center gap-2 text-sm">
                            <span className="animate-pulse">●</span> Order ID: #{order._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Delivery Partner / Status Card */}
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-slide-up hover:shadow-2xl transition-shadow duration-300">
                        {order.status === 'Out for Delivery' ? (
                            <>
                                <h2 className="text-md font-bold text-gray-400 uppercase tracking-wider mb-8">Delivery Partner</h2>
                                <div className="flex items-center gap-8">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-gray-100 text-4xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                        {order.deliveryPartner?.avatar ? (
                                            <img src={order.deliveryPartner.avatar} alt={order.deliveryPartner.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{order.deliveryPartner?.username || 'Assigned Partner'}</h3>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex bg-yellow-400 text-white px-2 py-0.5 rounded-md text-sm font-bold shadow-sm">
                                                ★ 4.9
                                            </div>
                                            <span className="text-gray-400 text-sm font-medium">1,240 deliveries</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                                            <span>🏍️</span> Hero Splendor • KA-05-XY-9876
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3">
                                        <a href={`tel:${order.deliveryPartner?.mobile || ''}`} className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-200 transition-all active:scale-95">
                                            📞
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
                                    🛵
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Finding nearby partner...</h2>
                                <p className="text-gray-400">We are matching you with the best delivery partner in your area.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={() => navigate('/')}
                        className="py-4 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Back to Home
                    </button>
                    <button onClick={() => navigate('/orders')} className="py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all transform hover:-translate-y-1">
                        Track All Orders
                    </button>
                </div>

                {/* Payment Success Popup */}
                {showSuccessPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up relative overflow-hidden">
                            {/* Confetti Background (simplified) */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://cdn.confetti.js.org/confetti.js')]"></div>

                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
                                ✅
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 mb-8">Thank you for your order. We've received your payment and are preparing your food!</p>

                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all"
                            >
                                Track Order
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;

const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: '00', seconds: '00' });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const createdTime = new Date(createdAt).getTime();
            const targetTime = createdTime + 45 * 60 * 1000; // +45 minutes
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference > 0) {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                });
            } else {
                setTimeLeft({ minutes: '00', seconds: '00' });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [createdAt]);

    return (
        <div className="flex items-center gap-4">
            <div className="text-center">
                <div className="w-20 h-24 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center mb-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent opacity-50"></div>
                    <span className="text-5xl font-bold text-gray-800 font-sans z-10">{timeLeft.minutes}</span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mins</span>
            </div>
            <div className="text-4xl font-bold text-gray-300 -mt-6">:</div>
            <div className="text-center">
                <div className="w-20 h-24 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center mb-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent opacity-50"></div>
                    <span className="text-5xl font-bold text-red-500 font-sans z-10">{timeLeft.seconds}</span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secs</span>
            </div>
        </div>
    );
};
