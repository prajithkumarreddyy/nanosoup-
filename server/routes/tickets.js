const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Private (User)
router.post('/', auth, async (req, res) => {
    try {
        const { orderId, issueType, description } = req.body;

        const ticket = new Ticket({
            user: req.user.id,
            order: orderId,
            issueType,
            description
        });

        const savedTicket = await ticket.save();
        res.json(savedTicket);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/tickets
// @desc    Get all tickets for the logged-in user
// @access  Private (User)
router.get('/', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('order', 'items createdAt'); // Populate order details if needed
        res.json(tickets);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/tickets/admin
// @desc    Get ALL tickets
// @access  Private (Admin)
router.get('/admin', auth, admin, async (req, res) => {
    try {
        console.log("Admin fetching all tickets...");
        const tickets = await Ticket.find()
            .sort({ status: 1, createdAt: -1 }) // Sort by Status (Pending first) then Date
            .populate('user', 'username email')
            .populate('order', 'items total');

        console.log(`Found ${tickets.length} tickets.`);
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching admin tickets:", error.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tickets/:id
// @desc    Update ticket status and add reply
// @access  Private (Admin)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { status, adminReply } = req.body;

        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

        if (status) ticket.status = status;
        if (adminReply) ticket.adminReply = adminReply;

        // If replying, mark as Solved automatically if not specified
        if (adminReply && ticket.status === 'Pending') {
            ticket.status = 'Solved';
        }

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
