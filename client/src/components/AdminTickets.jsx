import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const AdminTickets = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 3000); // Auto-refresh every 3s
        return () => clearInterval(interval);
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/api/tickets/admin`, {
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                console.error("Failed to fetch tickets:", res.status);
                if (res.status === 403) alert("Access Denied: You are not an Admin!");
                else if (res.status === 401) alert("Session Expired. Please login again.");

                setTickets([]);
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setTickets(data);
            } else {
                console.error("API returned non-array data:", data);
                setTickets([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setTickets([]);
            setLoading(false);
        }
    };

    const handleReply = async (ticketId) => {
        if (!replyText.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    adminReply: replyText,
                    status: 'Solved'
                })
            });

            if (res.ok) {
                setReplyText('');
                setSelectedTicket(null);
                fetchTickets();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Tickets...</div>;

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
            <Link to="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black mb-8 text-gray-800">Support Tickets</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Pending Tickets
                    {tickets.filter(t => t.status === 'Pending').length > 0 &&
                        <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                            {tickets.filter(t => t.status === 'Pending').length}
                        </span>
                    }
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('solved')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'solved' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Solved Tickets
                    {tickets.filter(t => t.status !== 'Pending').length > 0 &&
                        <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                            {tickets.filter(t => t.status !== 'Pending').length}
                        </span>
                    }
                    {activeTab === 'solved' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {tickets.filter(t => (activeTab === 'pending' ? t.status === 'Pending' : t.status !== 'Pending')).length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {activeTab === 'pending' ? 'No pending tickets.' : 'No solved tickets.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets
                            .filter(t => (activeTab === 'pending' ? t.status === 'Pending' : t.status !== 'Pending'))
                            .map(ticket => (
                                <div key={ticket._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'Solved' ? 'bg-green-100 text-green-700' :
                                                    ticket.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="font-bold text-gray-900">{ticket.issueType}</span>
                                                <span className="text-gray-400 text-sm">• {new Date(ticket.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{ticket.description}</p>
                                            <div className="text-sm text-gray-500">
                                                User: <span className="font-medium text-gray-800">{ticket.user?.username}</span> ({ticket.user?.email})
                                                {ticket.order && (
                                                    <span className="ml-4">
                                                        Order: <Link to={`/admin/order/${ticket.order._id}`} className="text-blue-600 hover:underline">#{ticket.order._id.slice(-6)}</Link>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {ticket.status === 'Pending' && (
                                            <button
                                                onClick={() => setSelectedTicket(selectedTicket === ticket._id ? null : ticket._id)}
                                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 transition-all text-sm font-bold text-gray-700"
                                            >
                                                {selectedTicket === ticket._id ? 'Cancel Reply' : 'Reply'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Admin Reply Section */}
                                    {ticket.adminReply && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 ml-8">
                                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">Admin Reply</p>
                                            <p className="text-blue-900">{ticket.adminReply}</p>
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    {selectedTicket === ticket._id && (
                                        <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="w-full p-3 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Type your reply here..."
                                                rows="3"
                                            ></textarea>
                                            <button
                                                onClick={() => handleReply(ticket._id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                                            >
                                                Send Reply & Mark Solved
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTickets;
