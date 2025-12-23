import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PaymentStatus = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [statusText, setStatusText] = useState("Verifying Payment...");

    useEffect(() => {
        const checkStatus = async () => {
            const searchParams = new URLSearchParams(location.search);
            const status = searchParams.get('status');
            const orderId = searchParams.get('order_id');

            if (!orderId) {
                setStatusText("Error: Invalid Link (No Order ID)");
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            // If we have explicit SUCCESS status
            if (status === 'SUCCESS') {
                setStatusText("Payment Successful! Confirming...");
                clearCart();
                setTimeout(() => navigate(`/delivery-details/${orderId}?status=SUCCESS`), 1000);
                return;
            }

            // Fallback: Check backend if status is missing or ambiguous
            setStatusText("Verifying payment status with bank...");
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/payment/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ orderId })
                });

                const data = await res.json();

                if (data.status === 'SUCCESS' || data.payment?.payment_status === 'SUCCESS') {
                    setStatusText("Payment Verified! Redirecting...");
                    clearCart();
                    setTimeout(() => navigate(`/delivery-details/${orderId}?status=SUCCESS`), 1000);
                } else {
                    setStatusText("Payment Failed or Pending.");
                    setTimeout(() => navigate(`/checkout?error=PAYMENT_FAILED&order_id=${orderId}`), 2000);
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatusText("Could not verify payment. Please check 'My Orders'.");
                setTimeout(() => navigate(`/orders`), 3000);
            }
        };

        checkStatus();
    }, [location, navigate, clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">{statusText}</h2>
            <p className="text-gray-500 mt-2">Please do not refresh the page or click back.</p>
        </div>
    );
};

export default PaymentStatus;
