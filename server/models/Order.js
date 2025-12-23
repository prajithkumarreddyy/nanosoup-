const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        name: String,
        qty: Number,
        price: Number,
        imageUrl: String
    }],
    total: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 40 // Fallback default
    },

    address: {
        street: String,
        city: String,
        zip: String,
        phone: String
    },
    status: {
        type: String,
        default: 'Processing'
    },
    paymentInfo: {
        id: String,
        status: String
    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
