import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/all`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized access. Admins only.');
                }
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const togglePassword = (userId) => {
        setShowPasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

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
                <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Data</h1>
                        <p className="text-gray-500">Manage registered users</p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <span>⬅️</span> <span className="font-medium text-gray-700">Back to Dashboard</span>
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-xl">👥</span>
                            <h2 className="text-xl font-bold text-gray-800">All Registered Users ({users.length})</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                                    <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Password</th>
                                    <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.username}</div>
                                                    <div className="text-xs text-gray-400 font-mono">ID: {user._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 align-middle">
                                            <div className="text-gray-700 font-medium">{user.email}</div>
                                        </td>
                                        <td className="p-5 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 min-w-[120px]">
                                                    {showPasswords[user._id] ? (
                                                        <span className="text-gray-800 font-medium">{user.password}</span>
                                                    ) : (
                                                        <span className="text-gray-400">••••••••</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => togglePassword(user._id)}
                                                    className="text-gray-400 hover:text-primary transition-colors p-1"
                                                    title={showPasswords[user._id] ? "Hide Password" : "Show Password"}
                                                >
                                                    {showPasswords[user._id] ? '🙈' : '👁️'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-5 align-middle">
                                            <span className="text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
