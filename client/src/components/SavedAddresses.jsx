import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const SavedAddresses = ({ onSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        zip: '',
        phone: ''
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/user/addresses', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!res.ok) {
                // Handle error (e.g., token expired)
                setLoading(false);
                return;
            }

            const data = await res.json();
            // Ensure data is array before setting
            if (Array.isArray(data)) {
                setAddresses(data);
            } else {
                setAddresses([]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/user/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newAddress)
            });

            if (res.ok) {
                const updatedAddresses = await res.json();
                setAddresses(updatedAddresses);
                setIsAdding(false);
                setNewAddress({ street: '', city: '', zip: '', phone: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 transition-all"
                    >
                        {isAdding ? 'Cancel' : '+ Add New Address'}
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 mb-8 animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-6">Add New Address</h2>
                        <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    value={newAddress.street}
                                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                    placeholder="123 Foodie Lane"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    value={newAddress.city}
                                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                    placeholder="New York"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    value={newAddress.zip}
                                    onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                                    placeholder="10001"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    value={newAddress.phone}
                                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <button type="submit" className="md:col-span-2 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
                                Save Address
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-xl">
                                    📍
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{addr.street}</p>
                                    <p className="text-gray-500">{addr.city}, {addr.zip}</p>
                                    <p className="text-gray-400 text-sm mt-2">📞 {addr.phone}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && !isAdding && (
                        <div className="md:col-span-2 text-center py-12 text-gray-400">
                            <p>No addresses saved yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedAddresses;
