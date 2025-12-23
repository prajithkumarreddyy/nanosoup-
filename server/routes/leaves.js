const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');
const Leave = require('../models/Leave');

// @route   POST /api/leaves
// @desc    Apply for a leave (Chef only)
// @access  Private (Chef)
router.post('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, reason, type } = req.body;

        // Basic validation
        if (!startDate || !endDate || !reason || !type) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const leave = new Leave({
            chef: req.user.id,
            startDate,
            endDate,
            reason,
            type
        });

        const savedLeave = await leave.save();
        res.json(savedLeave);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/leaves
// @desc    Get current user's leaves
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const leaves = await Leave.find({ chef: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/leaves/admin
// @desc    Get ALL leaves (Admin only)
// @access  Private (Admin)
router.get('/admin', auth, admin, async (req, res) => {
    try {
        const leaves = await Leave.find()
            .sort({ status: 1, createdAt: -1 }) // Pending first, then by date
            .populate('chef', 'username email');
        res.json(leaves);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/leaves/:id
// @desc    Update leave status (Approve/Reject)
// @access  Private (Admin)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { status, adminNote } = req.body;

        let leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ msg: 'Leave not found' });

        if (status) leave.status = status;
        if (adminNote) leave.adminNote = adminNote;

        await leave.save();
        res.json(leave);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
