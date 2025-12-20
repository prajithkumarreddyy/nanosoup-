import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const OrderOverview = () => {
    const { cart, total, clearCart } = useCart();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [address, setAddress] = useState({
        street: '',
        city: '',
        zip: '',
        phone: ''
    });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState("");

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch('http://localhost:5000/api/user/addresses', {
                        headers: {
                            'x-auth-token': token
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSavedAddresses(data);
                        if (data.length > 0) {
                            // Auto fill first address
                            setSelectedAddressIndex(0);
                            setAddress({
                                street: data[0].street || '',
                                city: data[0].city || '',
                                zip: data[0].zip || '',
                                phone: data[0].phone || ''
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch addresses", err);
                }
            }
        };
        fetchAddresses();
    }, []);

    console.log('OrderOverview Render:', { cartLength: cart.length, address });

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Add something delicious to proceed to checkout.</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-red-600 transition-all">Go Home</button>
            </div>
        );
    }

    const [error, setError] = useState('');

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!address.street || !address.city || !address.zip || !address.phone) {
            setError('Please fill in all address details to place your order.');
            return;
        }

        setError('');

        const orderData = {
            items: cart.map(item => ({
                name: item.name,
                qty: item.qty,
                price: item.price,
                imageUrl: item.imageUrl // Assuming model supports this, if not schema might need check, but schema has it
            })),
            total: total + 40 + (total * 0.05), // Total + Delivery + Tax
            address
        };

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please sign in to place an order.');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                if (res.status === 401) {
                    // Token invalid/expired
                    logout();
                    alert('Your session has expired. Please sign in again.');
                    navigate('/');
                    return;
                }

                const errorData = await res.text(); // Could be JSON or text
                try {
                    const parsedError = JSON.parse(errorData);
                    throw new Error(parsedError.message || parsedError.msg || 'Failed to place order');
                } catch (e) {
                    // If incorrect JSON, use text
                    throw new Error(errorData || 'Failed to place order');
                }
            }

            clearCart();
            navigate('/delivery-details');
        } catch (err) {
            console.error('Order Error:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span>🛒</span> Cart Items
                            </h2>
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                            <div>
                                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-primary">₹{(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span>📍</span> Delivery Address
                            </h2>

                            {/* Saved Address Selector */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select from Saved Addresses</label>
                                    <select
                                        value={selectedAddressIndex}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none bg-white"
                                        onChange={(e) => {
                                            const index = e.target.value;
                                            setSelectedAddressIndex(index);

                                            if (index !== "") {
                                                const selected = savedAddresses[index];
                                                setAddress({
                                                    street: selected.street || '',
                                                    city: selected.city || '',
                                                    zip: selected.zip || '',
                                                    phone: selected.phone || ''
                                                });
                                            } else {
                                                setAddress({
                                                    street: '',
                                                    city: '',
                                                    zip: '',
                                                    phone: ''
                                                });
                                            }
                                        }}
                                    >
                                        {savedAddresses.map((addr, idx) => (
                                            <option key={idx} value={idx}>
                                                {addr.street}, {addr.city}
                                            </option>
                                        ))}
                                        <option value="">Use a new address</option>
                                    </select>
                                </div>
                            )}

                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                        placeholder="123 Foodie Lane, Apt 4B"
                                        value={address.street}
                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                        placeholder="New York"
                                        value={address.city}
                                        onChange={e => setAddress({ ...address, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                        placeholder="10001"
                                        value={address.zip}
                                        onChange={e => setAddress({ ...address, zip: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                        placeholder="+1 (555) 000-0000"
                                        value={address.phone}
                                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                                    />
                                </div>

                                {selectedAddressIndex === "" && (
                                    <div className="md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!address.street || !address.city || !address.zip || !address.phone) {
                                                    alert('Please fill in all fields to save address');
                                                    return;
                                                }
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                    alert('You must be signed in to save an address.');
                                                    return;
                                                }

                                                try {
                                                    const res = await fetch('http://localhost:5000/api/user/addresses', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'x-auth-token': token
                                                        },
                                                        body: JSON.stringify(address)
                                                    });

                                                    if (res.ok) {
                                                        const updatedAddresses = await res.json();
                                                        setSavedAddresses(updatedAddresses);
                                                        setSelectedAddressIndex(0);
                                                        alert('Address saved to your profile!');
                                                    } else {
                                                        const errorData = await res.json();
                                                        alert(`Failed to save: ${errorData.message || 'Unknown error'}`);
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Server connection failed. Could not save address.');
                                                }
                                            }}
                                            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            Save this Address
                                        </button>
                                    </div>
                                )}
                            </form>
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 animate-shake">
                                    <span>⚠️</span> {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Total & Action */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-red-50 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Estimated Delivery</p>
                                    <p className="text-gray-800 font-bold">35 - 45 mins</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>₹40.00</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxes</span>
                                    <span>₹{(total * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
                                    <span>Total</span>
                                    <span>₹{(total + 40 + total * 0.05).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform hover:-translate-y-1 block text-center"
                            >
                                Place Order
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4">Safe & Secure Checkout via Nanosoup Pay</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOverview;
