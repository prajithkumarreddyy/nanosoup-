const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');

// @route   GET /api/settings
// @desc    Get current settings (create default if not exists)
// @access  Public (or semi-private if needed, but cart needs it publicly usually, strict: Private)
// Let's make it public so guest users can see cart totals correctly? 
// Actually frontend uses it for calculation, should be public or accessible.
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ deliveryFee: 40, taxRate: 5 });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/settings
// @desc    Update settings
// @access  Private/Admin
router.put('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { deliveryFee, taxRate } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
        if (taxRate !== undefined) settings.taxRate = taxRate;
        settings.updatedAt = Date.now();

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
