const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, mobile } = req.body;

        // Simple validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Check existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (Note: In production normally hash passwords with bcrypt, storing plain text for simplicity per request nature or assuming internal logic later)
        // Adding simple hashing simulation or recommendation
        // For this prototype we will store it directly but normally use bcrypt

        const newUser = new User({
            username,
            email,
            password,
            mobile,
            role: role || 'user'
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET || 'nanosoup_secret_key_12345', { expiresIn: 3600 });

        res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for specific admin (hardcoded for demo as requested)
        // Check for specific admin (hardcoded for demo as requested)
        if (email === 'prajith@nanosoup.com' && password === 'ppp') {
            let adminUser = await User.findOne({ email: 'prajith@nanosoup.com' });

            if (!adminUser) {
                // Create the admin user if not exists
                const newAdmin = new User({
                    username: 'Admin',
                    email: 'prajith@nanosoup.com',
                    password: 'ppp', // In a real app, hash this
                    role: 'admin',
                    mobile: '0000000000'
                });
                adminUser = await newAdmin.save();
            }

            const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'nanosoup_secret_key_12345', { expiresIn: 3600 });
            return res.json({
                token,
                user: {
                    id: adminUser._id,
                    username: adminUser.username,
                    email: adminUser.email,
                    role: 'admin'
                }
            });
        }

        // Check for normal user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Validate password (plain text match for prototype)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role || 'user' }, process.env.JWT_SECRET || 'nanosoup_secret_key_12345', { expiresIn: 3600 });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
