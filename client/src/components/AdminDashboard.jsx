import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState(localStorage.getItem('adminViewMode') || 'all');

    useEffect(() => {
        localStorage.setItem('adminViewMode', viewMode);
    }, [viewMode]);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/orders/all`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized access. Please login as admin.');
                }
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error("API returned non-array:", data);
                setOrders([]);
            }
            setLoading(false);
        } catch (err) {
            console.error("AdminDashboard Fetch Error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Helper to group orders by Month YYYY
    const getOrdersByMonth = () => {
        const groups = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(order);
        });
        return groups;
    };

    const groupedOrders = getOrdersByMonth();
    // Sort months? Currently object keys order relies on insertion order usually, 
    // but better to sort keys effectively or just rely on 'Recent Orders' fetch order (descending)
    // fetching is sorted by createdAt desc, so keys created in order of appearance should follow roughly,
    // but explicit sort of keys by date might be safer.
    // However, for simplicity and since backend sorts by date desc, the first key encountered will be the latest month.
    const monthKeys = Object.keys(groupedOrders); // fetching gives sorted desc, so keys likely in desc order of appearance

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <a href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                    Go Back Home
                </a>
            </div>
        </div>
    );

    const OrdersTable = ({ data, title }) => (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{data.length} Orders</span>
                </div>
                {title === 'All Recent Orders' && (
                    <button
                        onClick={fetchOrders}
                        className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                    >
                        Refresh Data
                    </button>
                )}
                {title !== 'All Recent Orders' && (
                    <div className="text-sm font-bold text-gray-600">
                        Monthly Revenue: <span className="text-green-600">₹{data.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2)}</span>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                            <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</th>
                            <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((order) => (
                            <tr
                                key={order._id}
                                onClick={() => navigate(`/admin/order/${order._id}`)}
                                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="p-5 align-top group-hover:text-primary transition-colors">
                                    <div className="font-mono text-xs text-gray-400 mb-1">#{order._id.slice(-6).toUpperCase()}</div>
                                    <div className="font-bold text-gray-900">₹{order.total?.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-5 align-top">
                                    {order.user ? (
                                        <>
                                            <div className="font-medium text-gray-900">{order.user.username || 'Admin/User'}</div>
                                            <div className="text-sm text-gray-500 break-all">{order.user.email}</div>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic">Unknown User</span>
                                    )}
                                </td>
                                <td className="p-5 align-top">
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 max-w-xs">
                                        <div className="font-semibold mb-1">{order.address?.street}</div>
                                        <div>{order.address?.city}, {order.address?.zip}</div>
                                        <div className="text-gray-500 mt-1 flex items-center gap-1">
                                            <span className="text-xs">📞</span> {order.address?.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 align-top">
                                    <div className="flex flex-col gap-2">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-xs">
                                                    x{item.qty}
                                                </span>
                                                <span className="text-gray-700">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-5 align-top">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                        ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                        {order.status || 'Processing'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Nanosoup Admin</h1>
                        <p className="text-gray-500">Manage your orders and deliveries</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-gray-700">Live Dashboard</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Orders</p>
                        <p className="text-4xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-4xl font-bold text-green-600">
                            ₹{orders.reduce((acc, order) => acc + (order.total || 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pending Deliveries</p>
                        <p className="text-4xl font-bold text-orange-500">
                            {orders.filter(o => o.status === 'Processing').length}
                        </p>
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'all'
                            ? 'bg-gray-900 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'monthly'
                            ? 'bg-gray-900 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Monthly View
                    </button>
                    {viewMode === 'monthly' && (
                        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100">
                            <span>📅</span> Showing data for {monthKeys.length} months
                        </div>
                    )}
                </div>

                {/* Content */}
                {viewMode === 'all' ? (
                    <OrdersTable data={orders} title="All Recent Orders" />
                ) : (
                    <div className="space-y-8">
                        {monthKeys.map(month => (
                            <OrdersTable key={month} data={groupedOrders[month]} title={month} />
                        ))}
                        {monthKeys.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No data available to segregate.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
