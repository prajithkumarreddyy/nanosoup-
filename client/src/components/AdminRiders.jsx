import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const AdminRiders = () => {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch users with role 'employee' (which includes riders/chefs based on seeding) OR filter by specific types if we stored them as 'rider'
            // Since our seeder used role: 'employee' for the abhi user, we should fetch 'employee' OR 'rider'
            // Let's fetch all optionally and filter client side if needed, or better, update backend to allow $in query.
            // For now, let's fetch 'employee' role as that's what we seeded "abhi" as.
            // If future riders are saved as 'rider', we might need to fetch multiple roles.
            // Simpler approach: Fetch by role=employee for now since that's what we used.
            // Fetch all users to ensure we capture everyone, then filter client-side for maximum flexibility
            // This avoids backend filtering issues where "rider" role might be excluded if we only ask for "employee"
            const response = await fetch(`${API_URL}/api/user/all`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch riders');
            }

            const data = await response.json();
            // Filter further if needed (e.g. check email domain if role is generic 'employee')
            const riderList = data.filter(u => u.email.includes('@rider.nanosoup.com') || u.role === 'rider');
            setRiders(riderList);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Rider Management</h2>
                        <p className="text-gray-500 mt-1">View and manage fleet details</p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                        Back to Dashboard
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rider Info</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {riders.length > 0 ? (
                                        riders.map((rider) => (
                                            <tr key={rider._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                            {rider.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{rider.username}</div>
                                                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Rider</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-medium">{rider.email}</div>
                                                    <div className="text-xs text-gray-400">ID: {rider._id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(rider.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <button className="text-gray-400 hover:text-red-600 font-bold text-xs transition-colors">
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colspan="5" className="px-6 py-12 text-center text-gray-500">
                                                <p className="font-medium text-lg">No riders found</p>
                                                <p className="text-sm mt-1">Wait for riders to register or seed data.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default AdminRiders;
