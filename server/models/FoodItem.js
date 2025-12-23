const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'Italian', 'Indian', 'mexican'
  imageUrl: { type: String, required: true },
  isVegetarian: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
