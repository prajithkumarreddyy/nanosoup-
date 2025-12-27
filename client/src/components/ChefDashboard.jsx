import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const ChefDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Stats Data (Mock)
    const stats = {
        monthlyIncome: '₹45,000',
        increment: '+12% this month',
        shiftTimings: '10:00 AM - 6:00 PM',
        role: 'Head Chef'
    };

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }
    const [newLeave, setNewLeave] = useState({ type: 'Casual Leave', startDate: '', endDate: '', reason: '' });

    React.useEffect(() => {
        fetchLeaves();
        const interval = setInterval(fetchLeaves, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leaves:", error);
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newLeave)
            });

            if (res.ok) {
                showNotification('Leave application submitted successfully!', 'success');
                setNewLeave({ type: 'Casual Leave', startDate: '', endDate: '', reason: '' });
                fetchLeaves();
            } else {
                showNotification('Failed to submit leave application', 'error');
            }
        } catch (error) {
            console.error("Error submitting leave:", error);
            showNotification('Error submitting leave application', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">CHEF DASHBOARD</h1>
                        <p className="text-gray-500 mt-1">Welcome back, <span className="font-bold text-gray-800">{user?.username || 'Chef'}</span>! 👨‍🍳</p>
                    </div>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        On Duty
                    </span>
                </div>

                {/* Notification Banner */}
                {notification && (
                    <div className={`p-4 rounded-xl border flex items-center shadow-sm animate-fade-in-down ${notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <span className="text-xl mr-3">{notification.type === 'success' ? '✅' : '⚠️'}</span>
                        <p className="font-bold">{notification.message}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200">
                    <button
                        className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === 'overview' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === 'leaves' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('leaves')}
                    >
                        Leaves
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {/* Income Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">💰</span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Monthly Income</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.monthlyIncome}</h3>
                            <div className="flex items-center mt-3 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                                <span>📈 {stats.increment}</span>
                            </div>
                        </div>

                        {/* Shift Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">⏰</span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Shift Timings</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-2">{stats.shiftTimings}</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Standard Shift</p>
                        </div>

                        {/* Role Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">👨‍🍳</span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Designation</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-2">{stats.role}</h3>
                            <p className="text-xs text-blue-600 mt-2 font-medium">Full Time</p>
                        </div>
                    </div>
                )}

                {activeTab === 'leaves' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                        {/* Apply Leave Form */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Apply for Leave</h3>
                            <form onSubmit={handleLeaveSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Leave Type</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        value={newLeave.type}
                                        onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                                    >
                                        <option>Casual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Privilege Leave</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                            value={newLeave.startDate}
                                            onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                            value={newLeave.endDate}
                                            onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        placeholder="Brief reason for leave..."
                                        value={newLeave.reason}
                                        onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-transform transform active:scale-95 shadow-lg shadow-red-200">
                                    Submit Application
                                </button>
                            </form>
                        </div>

                        {/* Recent Leaves List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Leave History</h3>
                            <div className="space-y-4">
                                {leaves.map((leave) => (
                                    <div key={leave._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{leave.type || 'Leave'}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 italic">"{leave.reason}"</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefDashboard;
