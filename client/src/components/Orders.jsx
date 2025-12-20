import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to delete order');
            }

            // Remove from UI
            setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete order: " + err.message);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/orders`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    setOrders([]);
                    console.error("Failed to fetch orders or invalid format");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };



        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        🍽️
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders placed</h2>
                    <p className="text-gray-500 mb-8">You haven't placed any orders yet. Explore our menu to find something delicious!</p>
                    <Link to="/" className="px-8 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all inline-block">
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-gray-50">
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wide mb-1">Order ID: #{order._id.slice(-6)}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center gap-3">
                                    <span className={`px - 4 py - 1 rounded - full text - xs font - bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                        } `}>
                                        {order.status || 'Processing'}
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                                {item.qty}x
                                            </div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                        </div>
                                        <p className="text-gray-600">₹{(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                <button
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="text-gray-400 text-sm hover:text-red-500 font-medium flex items-center gap-2 transition-colors"
                                >
                                    <span>🗑️</span> Delete Order
                                </button>
                                <button className="text-red-600 text-sm font-bold hover:underline">
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
