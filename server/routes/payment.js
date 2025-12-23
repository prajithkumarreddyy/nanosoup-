const express = require('express');
const router = express.Router();
const { Cashfree } = require("cashfree-pg");
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// @route   POST /api/payment/create-order
// @desc    Create a Cashfree payment order
// @access  Private
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { orderId, amount, customerPhone, customerName, customerEmail, returnUrl } = req.body;

        const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
        const numericAmount = parseFloat(amount);

        // Sanitize phone number (keep only digits, take last 10)
        let cleanPhone = customerPhone.replace(/\D/g, '');
        if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

        // Default to localhost if not provided (for development)
        const finalReturnUrl = returnUrl || `http://localhost:5173/delivery-details/${orderId}?status={order_status}`;

        const request = {
            order_amount: numericAmount,
            order_currency: "INR",
            order_id: orderId, // Use our DB Order ID
            customer_details: {
                customer_id: (req.user.id || "guest").toString(),
                customer_phone: cleanPhone,
                customer_name: customerName || "Guest",
                customer_email: customerEmail || "guest@example.com"
            },
            order_meta: {
                return_url: finalReturnUrl, // Frontend verification page
                // notify_url: "https://your-backend.com/api/payment/webhook" // Optional
            },
            order_expiry_time: expiryDate.toISOString()
        };

        console.log("Cashfree Request:", JSON.stringify(request, null, 2));

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        // Return the payment_session_id to frontend
        res.json(response.data);

    } catch (error) {
        const errorDetails = error.response ? error.response.data : error.message;
        console.error("Cashfree Create Order Error:", JSON.stringify(errorDetails, null, 2));

        // Send specific error message to client
        const niceMessage = error.response?.data?.message || error.message || "Payment creation failed";
        res.status(500).json({ message: niceMessage, error: errorDetails });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify payment status from backend (optional, but recommended)
// @access  Private
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.body;

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        // Analyze payments to determine status
        // Simplified check: look for any 'SUCCESS' payment
        const payments = response.data;
        const successPayment = payments.find(p => p.payment_status === "SUCCESS");

        if (successPayment) {
            // Update order status in DB
            // This logic might duplicate what happens if you just trust the frontend return, 
            // but backend verification is safer.
            // For now, just return valid.

            // Optionally update your Order model here:
            // await Order.findByIdAndUpdate(orderId, { isPaid: true, paidAt: Date.now() });

            return res.json({ status: "SUCCESS", payment: successPayment });
        } else {
            return res.json({ status: "PENDING", message: "No successful payment found yet" });
        }

    } catch (error) {
        console.error("Cashfree Verify Error:", error);
        res.status(500).json({ message: "Verification failed" });
    }
});

module.exports = router;
