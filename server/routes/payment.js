const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST api/payment/create-order
// @desc    Create a Razorpay order
// @access  Private (usually protected by auth middleware, but keeping open for checkout flow simplicity if needed, better to protect)
const auth = require('../middleware/authMiddleware'); // Assuming we want it protected

router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount } = req.body; // Amount in smallest currency unit (paise)

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Some error occured");
        }

        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).send(error);
    }
});

// @route   GET api/payment/key
// @desc    Get Razorpay Key ID
// @access  Private
router.get('/key', auth, (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
