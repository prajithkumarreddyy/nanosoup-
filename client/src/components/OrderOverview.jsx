import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { load } from '@cashfreepayments/cashfree-js';
import API_URL from '../config';

const OrderOverview = () => {
    const { cart, subtotal, deliveryFee, taxAmount, total, clearCart, updateQty } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState("");
    const [error, setError] = useState(null);

    const [paymentErrorPopup, setPaymentErrorPopup] = useState(false);
    const location = useLocation();

    // Handle Cashfree Return Redirect
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');

        if (status && orderId) {
            if (status === 'SUCCESS') {
                clearCart();
                navigate(`/delivery-details/${orderId}?status=SUCCESS`);
            } else {
                setPaymentErrorPopup(true);
            }
        }
    }, [location]);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/api/user/addresses`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSavedAddresses(data);
                    if (data.length > 0) {
                        const first = data[0];
                        setSelectedAddressIndex(0);
                        setAddress({
                            street: first.street || '',
                            city: first.city || '',
                            zip: first.zip || '',
                            phone: first.phone || ''
                        });
                    }
                }
            })
            .catch(err => console.error("Failed to load addresses", err));
    }, [token]);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError(null);

        if (!address.street || !address.city || !address.zip || !address.phone) {
            setError("Please fill in all address fields.");
            return;
        }

        try {
            // 1. Create Order in Backend (Pending Payment)
            const orderData = {
                items: cart.map(item => ({
                    item: item._id,
                    qty: item.qty,
                    price: item.price,
                    name: item.name
                })),
                total,
                address,
                paymentMethod: 'ONLINE' // Changed from COD
            };

            const orderRes = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || localStorage.getItem('token')
                },
                body: JSON.stringify(orderData)
            });

            if (!orderRes.ok) {
                const data = await orderRes.json();
                throw new Error(data.message || "Failed to create order");
            }

            const order = await orderRes.json();

            // 2. Initiate Cashfree Payment Session
            const paymentRes = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || localStorage.getItem('token')
                },
                body: JSON.stringify({
                    orderId: order._id,
                    amount: total,
                    customerPhone: address.phone,
                    // You might want to get these from user context or form
                    customerName: "Guest User",
                    customerEmail: "guest@example.com"
                })
            });

            if (!paymentRes.ok) {
                const data = await paymentRes.json();
                throw new Error("Payment init failed: " + (data.message || "Unknown error"));
            }

            const paymentSession = await paymentRes.json();

            // 3. Load Cashfree SDK and Checkout
            const cashfree = await load({
                mode: "production"
            });

            const checkoutOptions = {
                paymentSessionId: paymentSession.payment_session_id,
                redirectTarget: "_self", // "_self", "_blank", or container element
                returnUrl: `${window.location.origin}/delivery-details/${order._id}?status={order_status}` // Fallback if SDK doesn't redirect
            };

            cashfree.checkout(checkoutOptions);

        } catch (err) {
            setError(err.message || "Payment processing failed. Please try again.");
            console.error(err);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <Link to="/" className="text-red-600 font-bold hover:underline">Browse Menu</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Cart & Address */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{item.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <button
                                                    onClick={() => updateQty(item._id, -1)}
                                                    className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold text-gray-700 w-4 text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item._id, 1)}
                                                    className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-red-600 hover:bg-red-50 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-bold text-primary">₹{(item.price * item.qty).toFixed(2)}</p>
                                </div>
                            ))}
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
                                                    const res = await fetch(`${API_URL}/api/user/addresses`, {
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
                    < div className="lg:col-span-1" >
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
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>₹{deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxes</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
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

            {/* Payment Failure Popup */}
            {paymentErrorPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-shake">
                            ❌
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                        <p className="text-gray-500 mb-8">We couldn't process your payment. Please try again or use a different payment method.</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setPaymentErrorPopup(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={(e) => {
                                    setPaymentErrorPopup(false);
                                    handlePlaceOrder(e);
                                }}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >

    );
};

export default OrderOverview;
