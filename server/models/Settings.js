const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    deliveryFee: { type: Number, required: true, default: 40 },
    taxRate: { type: Number, required: true, default: 5 }, // Percentage
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
