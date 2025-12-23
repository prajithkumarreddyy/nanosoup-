const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/user/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', authMiddleware, async (req, res) => {
    try {
        console.log('GET /addresses called for user:', req.user.id);
        const user = await User.findById(req.user.id).select('addresses');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/user/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', authMiddleware, async (req, res) => {
    const { street, city, zip, phone } = req.body;

    try {
        console.log('POST /addresses called for user:', req.user.id);
        console.log('Address data:', req.body);
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found during save');
            return res.status(404).json({ msg: 'User not found' });
        }

        const newAddress = {
            street,
            city,
            zip,
            phone
        };

        user.addresses.unshift(newAddress);
        const savedUser = await user.save();
        console.log('Address saved successfully for user:', req.user.id);

        res.json(savedUser.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const admin = require('../middleware/admin');

// @route   GET /api/user/all
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/all', [authMiddleware, admin], async (req, res) => {
    try {
        const query = req.query.role ? { role: req.query.role } : {};
        const users = await User.find(query).select('-addresses -__v').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
