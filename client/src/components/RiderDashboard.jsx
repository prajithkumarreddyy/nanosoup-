import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const RiderDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    React.useEffect(() => {
        fetchAssignedOrders();
        const interval = setInterval(fetchAssignedOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAssignedOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/orders/assigned`, {
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/orders/rider/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');

            // Refresh local state immediately
            fetchAssignedOrders();
            // alert(`Order marked as ${newStatus}`);
            showNotification(`Order marked as ${newStatus}`, 'success');
        } catch (err) {
            // alert(err.message);
            showNotification(err.message, 'error');
        }
    };

    // Filter Logic
    const newRequests = orders.filter(o => o.status === 'Prepared');
    const activeDeliveries = orders.filter(o => o.status === 'Out for Delivery');
    const pastDeliveries = orders.filter(o => o.status === 'Delivered').slice(0, 5); // Show last 5

    // Calc Stats
    const deliveredToday = orders.filter(o => {
        const isDelivered = o.status === 'Delivered';
        if (!isDelivered) return false;

        try {
            const orderDate = new Date(o.createdAt);
            const today = new Date();
            return (
                orderDate.getDate() === today.getDate() &&
                orderDate.getMonth() === today.getMonth() &&
                orderDate.getFullYear() === today.getFullYear()
            );
        } catch (e) {
            return false;
        }
    });

    const todayEarnings = deliveredToday.reduce((total, order) => {
        // Use the saved deliveryFee, or fallback to 40 if for some reason it's missing (legacy orders)
        const fee = order.deliveryFee !== undefined ? order.deliveryFee : 40;
        return total + fee;
    }, 0);

    if (loading) return (
        <div className="min-h-screen pt-32 flex justify-center text-primary">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Notification Banner */}
            {notification.show && (
                <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-xl border animate-fade-in-down ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
                        <div>
                            <h4 className="font-bold">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-sm">{notification.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">RIDER DASHBOARD</h1>
                        <p className="text-gray-500 mt-1">Welcome back, <span className="font-bold text-gray-800">{user?.username || 'Rider'}</span>! 🛵</p>
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Online
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Delivered Today</h3>
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📦</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{deliveredToday.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Today's Earnings</h3>
                            <span className="bg-green-100 text-green-600 p-2 rounded-lg">₹</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">₹{todayEarnings}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Assignments */}
                    <div className="space-y-8">
                        {/* New Assignments */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-red-50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-2">
                                New Requests
                                {newRequests.length > 0 && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{newRequests.length}</span>
                                )}
                            </h2>

                            <div className="space-y-4 relative z-10">
                                {newRequests.length === 0 ? (
                                    <p className="text-gray-500 italic pb-4">No new delivery requests.</p>
                                ) : (
                                    newRequests.map((order) => (
                                        <div key={order._id} className="bg-white border-2 border-red-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">Order #{order._id.slice(-4).toUpperCase()}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <span>📍</span> {order.address?.street}, {order.address?.city}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl">
                                                <div className="flex items-center gap-1">
                                                    <span>💰</span> <span className="font-bold text-gray-900">₹{order.total}</span>
                                                </div>
                                                <div className="w-px h-4 bg-gray-300"></div>
                                                <div className="flex items-center gap-1 text-green-600 font-medium">
                                                    <span>⏱️</span> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => updateStatus(order._id, 'Out for Delivery')}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-red-200 shadow-lg"
                                            >
                                                Accept Order
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Active Deliveries */}
                        <div className="bg-white rounded-3xl p-6 shadow-md border border-purple-50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Active Deliveries
                                {activeDeliveries.length > 0 && (
                                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{activeDeliveries.length}</span>
                                )}
                            </h2>
                            <div className="space-y-4">
                                {activeDeliveries.length === 0 ? (
                                    <p className="text-gray-500 italic">No active deliveries.</p>
                                ) : (
                                    activeDeliveries.map((order) => (
                                        <div key={order._id} className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                                            <div className="mb-3">
                                                <h3 className="font-bold text-lg text-gray-900">Heading to: {order.user?.username || 'Customer'}</h3>
                                                <p className="text-sm text-gray-600">{order.address?.street}</p>
                                                <a href={`tel:${order.address?.phone}`} className="text-xs text-primary font-bold mt-1 inline-block">📞 Call {order.address?.phone}</a>
                                            </div>
                                            <button
                                                onClick={() => updateStatus(order._id, 'Delivered')}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-colors shadow-lg"
                                            >
                                                Mark Delivered
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            {pastDeliveries.length === 0 ? (
                                <p className="text-gray-500 italic">No past deliveries.</p>
                            ) : (
                                pastDeliveries.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg">
                                                ✓
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{order.address?.street}</p>
                                                <p className="text-xs text-gray-500">#{order._id.slice(-4)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">₹{order.total}</p>
                                            <p className="text-xs text-green-600 font-medium">Completed</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
