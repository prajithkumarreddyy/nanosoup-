import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const CustomerCare = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [issueType, setIssueType] = useState('Late Delivery');
    const [description, setDescription] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // New State for Tabs and Tickets
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'pending'
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false); // Stop loading if no token (guest)
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Orders (Only need to fetch once or less frequently, but keeping together for simplicity or separate if optimized)
                // Actually, let's keep fetching both to ensure status updates on orders reflect too.
                const orderRes = await fetch(`${API_URL}/api/orders`, {
                    headers: { 'x-auth-token': token }
                });
                if (orderRes.ok) {
                    const orderData = await orderRes.json();
                    if (Array.isArray(orderData)) setOrders(orderData);
                }

                // Fetch Tickets
                const ticketRes = await fetch(`${API_URL}/api/tickets`, {
                    headers: { 'x-auth-token': token }
                });
                if (ticketRes.ok) {
                    const ticketData = await ticketRes.json();
                    setTickets(ticketData);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial
        const interval = setInterval(fetchData, 3000); // Poll every 3s

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    orderId: selectedOrder._id,
                    issueType,
                    description
                })
            });

            if (res.ok) {
                const newTicket = await res.json();
                setTickets([newTicket, ...tickets]);

                // Close modal
                setSelectedOrder(null);
                setDescription('');
                setIssueType('Late Delivery');

                // Show success
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Care</h1>
                        <p className="text-gray-500">We're here to help!</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`pb-4 px-4 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'new' ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Report an Issue
                        {activeTab === 'new' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 px-4 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'pending' ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Pending Tickets
                        {tickets.filter(t => t.status === 'Pending').length > 0 &&
                            <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                                {tickets.filter(t => t.status === 'Pending').length}
                            </span>
                        }
                        {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('solved')}
                        className={`pb-4 px-4 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'solved' ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Solved Tickets
                        {tickets.filter(t => t.status !== 'Pending').length > 0 &&
                            <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                {tickets.filter(t => t.status !== 'Pending').length}
                            </span>
                        }
                        {activeTab === 'solved' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full"></div>}
                    </button>
                </div>

                {showSuccess && (
                    <div className="fixed top-24 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in-up">
                        <strong className="font-bold">Ticket Submitted! </strong>
                        <span className="block sm:inline">You can track it in the Pending Tickets tab.</span>
                    </div>
                )}

                {/* Content Area */}
                {activeTab === 'new' && (
                    <div>
                        <p className="text-gray-500 mb-6">Select an order below to report an issue.</p>

                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-4xl mb-4">🤷‍♂️</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No past orders found</h3>
                                <p className="text-gray-500 mb-6">You need to place an order before requesting help.</p>
                                <Link to="/" className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-primary transition-colors">
                                    Browse Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-bold text-gray-900">#{order._id.slice(-6)}</span>
                                                <span className="text-xs text-gray-400">• {new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {order.status || 'Processing'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-1">
                                                {order.items.map(item => `${item.qty}x ${item.name} `).join(', ')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-6 py-2 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-red-100 hover:text-red-600 hover:bg-red-50 transition-all whitespace-nowrap"
                                        >
                                            Get Help
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div>
                        {tickets.filter(t => t.status === 'Pending').length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-4xl mb-4">✅</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No pending tickets</h3>
                                <p className="text-gray-500">You have no open issues at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.filter(t => t.status === 'Pending').map(ticket => (
                                    <div key={ticket._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-gray-900">{ticket.issueType}</span>
                                                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-xs bg-yellow-100 text-yellow-700">
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">ID: {ticket._id} • Raised on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {ticket.order && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Order Ref</p>
                                                    <p className="text-sm font-bold text-gray-900">#{typeof ticket.order === 'object' ? ticket.order._id.slice(-6) : ticket.order.slice(-6)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-4">
                                            <p>"{ticket.description}"</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                            <span>🕒 This ticket is currently under review by our support team.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'solved' && (
                    <div>
                        {tickets.filter(t => t.status !== 'Pending').length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-4xl mb-4">📜</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No solved tickets</h3>
                                <p className="text-gray-500">History of your resolved issues will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.filter(t => t.status !== 'Pending').map(ticket => (
                                    <div key={ticket._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 opacity-90">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-gray-900">{ticket.issueType}</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-xs ${ticket.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">ID: {ticket._id} • Raised on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {ticket.order && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Order Ref</p>
                                                    <p className="text-sm font-bold text-gray-900">#{typeof ticket.order === 'object' ? ticket.order._id.slice(-6) : ticket.order.slice(-6)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-4">
                                            <p>"{ticket.description}"</p>
                                        </div>

                                        {ticket.adminReply && (
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Support Team Reply</p>
                                                <p className="text-sm text-blue-900">{ticket.adminReply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Help Modal */}
                {/* Help Modal */}
                {selectedOrder && ReactDOM.createPortal(
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Report Issue</h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Order #{selectedOrder._id.slice(-6)}</p>
                                <p className="text-sm font-medium text-gray-800">{selectedOrder.items.map(i => i.name).join(', ')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type</label>
                                    <select
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none bg-white"
                                    >
                                        <option>Late Delivery</option>
                                        <option>Missing Items</option>
                                        <option>Wrong Item Delivered</option>
                                        <option>Food Quality Issue</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                        rows="4"
                                        placeholder="Please tell us more about the issue..."
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all">
                                    Submit Ticket
                                </button>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

                {/* General Inquiry Section */}
                <div className="mt-12 bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Have a different question?</h3>
                    <p className="text-blue-700 mb-6">For general inquiries not related to a specific order, you can email us directly.</p>
                    <a href="mailto:d.prajithkuamrreddy@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        <span>📧</span> Email Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CustomerCare;
