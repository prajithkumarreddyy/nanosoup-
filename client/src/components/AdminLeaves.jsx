import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const AdminLeaves = () => {
    const { token } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
    const [confirmModal, setConfirmModal] = useState({ show: false, leaveId: null, status: null });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchLeaves();
        const interval = setInterval(fetchLeaves, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch(`${API_URL}/api/leaves/admin`, {
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                console.error("Failed to fetch leaves:", res.status);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setLeaves(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leaves:", error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = (leaveId, status) => {
        setConfirmModal({ show: true, leaveId, status });
    };

    const confirmAction = async () => {
        const { leaveId, status } = confirmModal;
        setConfirmModal({ show: false, leaveId: null, status: null });

        try {
            const res = await fetch(`${API_URL}/api/leaves/${leaveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                showNotification(`Leave request ${status} successfully!`, 'success');
                fetchLeaves();
            } else {
                showNotification('Failed to update leave status', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error updating leave status', 'error');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <div className="p-10 text-center">Loading Leaves...</div>;

    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    const historyLeaves = leaves.filter(l => l.status !== 'Pending');
    const displayedLeaves = activeTab === 'pending' ? pendingLeaves : historyLeaves;

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
            <Link to="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black mb-8 text-gray-800">Chef Leave Requests</h1>

            {/* Notification Banner */}
            {notification && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center shadow-sm animate-fade-in-down ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <span className="text-xl mr-3">{notification.type === 'success' ? '✅' : '⚠️'}</span>
                    <p className="font-bold">{notification.message}</p>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Confirm Action</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to <span className="font-bold text-gray-900">{confirmModal.status}</span> this leave request?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ show: false, leaveId: null, status: null })}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-2 text-white rounded-xl font-bold shadow-lg transition-transform transform active:scale-95 ${confirmModal.status === 'Approved' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                            >
                                Yes, {confirmModal.status}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Pending Requests
                    {pendingLeaves.length > 0 &&
                        <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                            {pendingLeaves.length}
                        </span>
                    }
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    History
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {displayedLeaves.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {activeTab === 'pending' ? 'No pending leave requests.' : 'No leave history found.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {displayedLeaves.map(leave => (
                            <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {leave.status}
                                            </span>
                                            <span className="font-bold text-gray-900">{leave.chef?.username || 'Unknown Chef'}</span>
                                            <span className="text-gray-400 text-sm">({leave.chef?.email})</span>
                                        </div>

                                        <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-bold text-gray-400 text-xs uppercase block mb-1">From</span>
                                                {new Date(leave.startDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-400 text-xs uppercase block mb-1">To</span>
                                                {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-400 text-xs uppercase block mb-1">Duration</span>
                                                {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm">
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Reason</span>
                                            "{leave.reason}"
                                        </div>
                                    </div>

                                    {leave.status === 'Pending' && (
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm shadow-lg shadow-green-100 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-100 font-bold text-sm transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {/* Allow changing status for History items (Undo) */}
                                    {leave.status === 'Approved' && (
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-bold transition-all"
                                            >
                                                Reject (Undo)
                                            </button>
                                        </div>
                                    )}
                                    {leave.status === 'Rejected' && (
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                className="px-3 py-1 bg-white border border-green-200 text-green-600 rounded-lg hover:bg-green-50 text-xs font-bold transition-all"
                                            >
                                                Approve (Undo)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeaves;
