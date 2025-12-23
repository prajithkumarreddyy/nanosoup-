const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');

// @route   GET /api/food
// @desc    Get all food items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const foods = await FoodItem.find({});
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/food
// @desc    Add new food item
// @access  Private/Admin
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, isVegetarian } = req.body;

        const newItem = new FoodItem({
            name,
            description,
            price,
            category,
            imageUrl,
            isVegetarian
        });

        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/food/:id
// @desc    Update food item
// @access  Private/Admin
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        let item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        const { name, description, price, category, imageUrl, isVegetarian, inStock } = req.body;

        if (name) item.name = name;
        if (description) item.description = description;
        if (price) item.price = price;
        if (category) item.category = category;
        if (imageUrl) item.imageUrl = imageUrl;
        if (isVegetarian !== undefined) item.isVegetarian = isVegetarian;
        if (inStock !== undefined) item.inStock = inStock;

        await item.save();
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/food/:id
// @desc    Delete food item
// @access  Private/Admin
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        await FoodItem.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
