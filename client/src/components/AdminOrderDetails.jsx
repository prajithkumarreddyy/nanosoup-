import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [riders, setRiders] = useState([]);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const orderRes = await fetch(`${API_URL}/api/orders/admin/${orderId}`, {
                headers: { 'x-auth-token': token }
            });
            if (!orderRes.ok) throw new Error('Failed to fetch order details');
            const orderData = await orderRes.json();
            setOrder(orderData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching order:", err);
            // Don't set error state on polling failure to avoid UI flicker, just log it
            // Only set error if it's the initial load
            if (loading) {
                setError(err.message);
                setLoading(false);
            }
        }
    };

    const fetchRiders = async () => {
        try {
            const token = localStorage.getItem('token');
            const ridersRes = await fetch(`${API_URL}/api/user/all`, {
                headers: { 'x-auth-token': token }
            });
            if (ridersRes.ok) {
                const usersData = await ridersRes.json();
                const riderList = usersData.filter(u => u.username.toLowerCase().includes('rider') || u.role === 'rider' || u.email.includes('rider'));
                setRiders(riderList);
            }
        } catch (err) {
            console.error("Error fetching riders:", err);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
            fetchRiders();

            // Poll for order updates every 3 seconds
            const interval = setInterval(fetchOrder, 3000);
            return () => clearInterval(interval);
        }
    }, [orderId]);

    const updateStatus = async (newStatus, deliveryPartnerId = null) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const body = { status: newStatus };
            if (deliveryPartnerId) {
                body.deliveryPartner = deliveryPartnerId;
            }

            const response = await fetch(`${API_URL}/api/orders/admin/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedOrder = await response.json();
            setOrder(updatedOrder);
        } catch (err) {
            alert('Error updating status: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gray-50 pt-20">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => navigate('/admin')} className="text-primary hover:underline">Back to Dashboard</button>
            </div>
        </div>
    );

    if (!order) return null;

    // Time calculations
    const createdDate = new Date(order.createdAt);
    const deliveryDate = new Date(createdDate.getTime() + 45 * 60000); // +45 mins

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span className="mr-2">←</span> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                                                order.status === 'Preparing' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                        {order.status || 'Processing'}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">Placed on {createdDate.toLocaleDateString()} at {formatTime(createdDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Estimated Delivery</p>
                                <p className="text-2xl font-bold text-gray-900">{formatTime(deliveryDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Order Details */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h3>
                            <div className="space-y-4 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-gray-600">
                                                {item.qty}x
                                            </div>
                                            <span className="text-gray-800 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-gray-600">₹{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                <span className="font-bold text-2xl text-primary">₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Right Column: Customer & Actions */}
                        <div>
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Customer Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{order.user?.username || 'Guest'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{order.user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Delivery Address</p>
                                        <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                                            <p>{order.address?.street}</p>
                                            <p>{order.address?.city}, {order.address?.zip}</p>
                                            <p className="mt-1">📞 {order.address?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Update Status</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Preparing Button */}
                                    <button
                                        onClick={() => updateStatus('Preparing')}
                                        disabled={updating || order.status !== 'Processing'}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex justify-between items-center
                                            ${order.status === 'Preparing'
                                                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2'
                                                : order.status === 'Processing'
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <span>Preparing Order</span>
                                        {order.status === 'Preparing' && <span>✓</span>}
                                    </button>

                                    {/* Prepared Button */}
                                    <button
                                        onClick={() => updateStatus('Prepared')}
                                        disabled={updating || (order.status !== 'Preparing' && order.status !== 'Processing')}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex justify-between items-center
                                            ${order.status === 'Prepared'
                                                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-2'
                                                : (order.status === 'Preparing' || order.status === 'Processing')
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <span>Order Prepared</span>
                                        {order.status === 'Prepared' && <span>✓</span>}
                                    </button>
                                </div>

                                {/* Rider Assignment Section - Show only if status is Prepared AND no partner assigned yet (or re-assigning) */}
                                {order.status === 'Prepared' && !order.deliveryPartner && (
                                    <div className="mt-8 animate-fade-in-up">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Assign Delivery Partner</h3>
                                        {riders.length === 0 ? (
                                            <p className="text-gray-500 italic">No riders found available.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {riders.map(rider => (
                                                    <button
                                                        key={rider._id}
                                                        onClick={() => updateStatus('Prepared', rider._id)}
                                                        disabled={updating}
                                                        className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-red-50 transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                                                                    🛵
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900 group-hover:text-primary">{rider.username}</div>
                                                                    <div className="text-xs text-gray-500">{rider.email}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Assign →
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Show assigned partner / Acceptance Status */}
                                {order.deliveryPartner && (
                                    <div className={`mt-6 p-4 rounded-xl border ${order.status === 'Prepared' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className={`text-xs font-bold uppercase ${order.status === 'Prepared' ? 'text-orange-600' : 'text-green-600'}`}>
                                                {order.status === 'Prepared' ? 'Waiting for Acceptance' : 'Assigned Partner'}
                                            </p>
                                            {order.status === 'Prepared' && (
                                                <span className="text-xs px-2 py-1 bg-white rounded border border-orange-200 text-orange-600 font-bold animate-pulse">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-lg border border-gray-100">
                                                {order.status === 'Prepared' ? '⏳' : '✅'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{order.deliveryPartner.username || 'Partner'}</div>
                                                <div className="text-xs text-gray-500">{order.deliveryPartner.email || 'No email'}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-400">
                                            {order.status === 'Prepared'
                                                ? 'Rider needs to accept the order in their app.'
                                                : order.status === 'Out for Delivery'
                                                    ? 'Rider is on the way.'
                                                    : 'Order Delivered.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
