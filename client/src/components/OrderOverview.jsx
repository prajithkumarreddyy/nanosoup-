import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const OrderOverview = () => {
    const { cart, subtotal, deliveryFee, taxAmount, total, clearCart, updateQty } = useCart();
    const { token, user } = useAuth(); // Need user for prefilling
    const navigate = useNavigate();

    const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState("");
    const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Razorpay
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

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
        setIsLoading(true);

        if (!address.street || !address.city || !address.zip || !address.phone) {
            setError("Please fill in all address fields.");
            setIsLoading(false);
            return;
        }

        try {
            // Check Payment Method
            if (paymentMethod === 'Razorpay') {
                const res = await loadRazorpay();
                if (!res) {
                    setError('Razorpay SDK failed to load. Are you online?');
                    setIsLoading(false);
                    return;
                }

                // Create Order on Server
                const result = await fetch(`${API_URL}/api/payment/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ amount: total }) // Server expects amount
                });

                if (!result.ok) {
                    throw new Error('Server error creating Razorpay order');
                }

                const { id: order_id, amount, currency } = await result.json();

                const options = {
                    key: "YOUR_RAZORPAY_KEY_ID", // Will be replaced or fetched if we want to be dynamic, but usually key_id is public. Wait, better to fetch key from server or env? Env is safe for public key. 
                    // Actually React env variables need REACT_APP_ prefix or VITE_ prefix. 
                    // Let's assume the user puts it in the code or we fetch it? 
                    // For now, I'll assume I should fetch the key or just hardcode it if the user provided it. 
                    // BUT security-wise, key_ID is public. 
                    // Since I don't have it, I will fetch it from an endpoint if possible, or just put a placeholder that user can replace.
                    // Or I can add an endpoint to get the key.
                    // For simplicity, let's assume the user will replace "YOUR_LIVE_KEY_ID" here or I add a config endpoint.
                    // I'll add a quick endpoint to get the key id in payment.js so I don't hardcode it in client.
                    amount: amount.toString(),
                    currency: currency,
                    name: "Nanosoup",
                    description: "Food Order",
                    order_id: order_id,
                    handler: async function (response) {
                        await verifyPayment(response);
                    },
                    prefill: {
                        name: user?.username || '',
                        email: user?.email || '',
                        contact: address.phone || ''
                    },
                    theme: {
                        color: "#EF4444"
                    },
                    modal: {
                        ondismiss: function () {
                            setError("Payment Failed. Please try again later.");
                            setIsLoading(false);
                        }
                    }
                };

                // Fetch Key ID from server to avoid hardcoding
                const keyRes = await fetch(`${API_URL}/api/payment/key`, { headers: { 'x-auth-token': token } });
                const keyData = await keyRes.json();
                options.key = keyData.key;

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                setIsLoading(false); // Modal is open, so we stop loading spinner on our UI
            } else {
                // COD Flow
                await createOrderInDb({});
            }

        } catch (err) {
            setError(err.message || "Order placement failed. Please try again.");
            console.error(err);
            setIsLoading(false);
        }
    };

    const verifyPayment = async (paymentData) => {
        setIsLoading(true);
        try {
            await createOrderInDb({
                paymentMethod: 'Razorpay',
                paymentInfo: paymentData
            });
        } catch (err) {
            setError("Payment verified but order creation failed: " + err.message);
            setIsLoading(false);
        }
    };

    const createOrderInDb = async (extraData = {}) => {
        const orderData = {
            items: cart.map(item => ({
                item: item._id,
                qty: item.qty,
                price: item.price,
                name: item.name
            })),
            total,
            address,
            paymentMethod: paymentMethod, // 'COD' or 'Razorpay'
            ...extraData
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

        // Clear cart and redirect to orders page or tracking
        clearCart();
        navigate(`/delivery-details/${order._id}`, { state: { paymentSuccess: true } });
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
                <p className="text-gray-500 mt-2">Please do not close this window</p>
            </div>
        );
    }

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

                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 block">Payment Method</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'COD' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        💵 COD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Razorpay')}
                                        className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'Razorpay' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        💳 Razorpay
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform hover:-translate-y-1 block text-center"
                            >
                                {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay & Place Order'}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4">
                                {paymentMethod === 'COD' ? 'Cash on Delivery available' : 'Secure payment via Razorpay'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOverview;
