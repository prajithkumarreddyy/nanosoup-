const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { items, total, address, paymentMethod, paymentInfo } = req.body;

    try {
        // Fetch current delivery fee from global settings
        const settings = await Settings.findOne();
        const currentDeliveryFee = settings ? settings.deliveryFee : 40; // Default to 40 if not set

        // Verify Razorpay Payment if method is Razorpay
        if (paymentMethod === 'Razorpay') {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentInfo;

            const crypto = require('crypto');
            const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            const digest = shasum.digest('hex');

            if (digest !== razorpay_signature) {
                return res.status(400).json({ msg: 'Transaction not legit!' });
            }
        }

        const newOrder = new Order({
            user: req.user.id,
            items,
            total,
            address,
            deliveryFee: currentDeliveryFee,
            paymentInfo: paymentMethod === 'Razorpay' ? {
                id: paymentInfo.razorpay_payment_id,
                status: 'Paid' // Assumed paid if signature verifies
            } : {},
            status: paymentMethod === 'Razorpay' ? 'Preparing' : 'Processing' // Auto-advance if paid? Or keep Processing. Let's keep Processing usually, but Paid orders are confirmed.
        });

        // If paid, maybe set status to 'Preparing' directly? 
        // For now, let's look at the schema defaults. Default is 'Processing'. 
        // Let's set it to 'Processing' but with payment status.
        if (paymentMethod === 'Razorpay') {
            newOrder.status = 'Preparing'; // Auto-confirm paid orders? Or just 'Processing'? Let's go with 'Processing' to be safe, but typically paid = confirmed.
            // Actually, the user flow usually expects "Processing" until the restaurant accepts it. 
            newOrder.status = 'Processing';
        }

        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
// @desc    Get all orders for logged in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('deliveryPartner', ['username', 'mobile']) // Populate partner details
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/all', [authMiddleware, require('../middleware/admin')], async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', ['username', 'email'])
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        const ordersFallback = await Order.find().sort({ createdAt: -1 });
        res.json(ordersFallback);
    }
});

// @route   GET /api/orders/admin/:id
// @desc    Get single order by ID (Admin only)
// @access  Private/Admin
router.get('/admin/:id', [authMiddleware, require('../middleware/admin')], async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', ['username', 'email', 'addresses']) // Populate user details
            .populate('deliveryPartner', ['username', 'email', 'mobile']); // Populate partner details

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/admin/:id/status', [authMiddleware, require('../middleware/admin')], async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Processing', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        let order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.status = status;

        // If deliveryPartner is provided in body, update it
        if (req.body.deliveryPartner) {
            order.deliveryPartner = req.body.deliveryPartner;
        }

        await order.save();

        // Re-fetch to populate
        order = await Order.findById(req.params.id)
            .populate('user', ['username', 'email', 'addresses'])
            .populate('deliveryPartner', ['username', 'email', 'mobile']);

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check user
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Order removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/assigned
// @desc    Get orders assigned to the logged-in rider (employee)
// @access  Private (Riders)
router.get('/assigned', authMiddleware, async (req, res) => {
    try {
        // Find orders where deliveryPartner matches the user ID
        // Filter by active statuses primarily, but maybe history too?
        // Let's return all assigned orders and filter client side for now.
        const orders = await Order.find({ deliveryPartner: req.user.id })
            .populate('user', ['username', 'phone', 'email'])
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/rider/:id/status
// @desc    Update order status by Rider (Accept / Deliver)
// @access  Private
router.put('/rider/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Out for Delivery', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status update for rider' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Verify that the logged-in user is the assigned partner
        if (order.deliveryPartner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized for this order' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
