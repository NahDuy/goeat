const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const connectToDatabase = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // In production use env var

module.exports = async (req, res) => {
    await connectToDatabase();

    if (req.method === 'POST') {
        const { action, username, password } = req.body; // action: 'register' or 'login'

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing username or password' });
        }

        try {
            if (action === 'register') {
                // Check if user exists
                const existing = await User.findOne({ username });
                if (existing) return res.status(400).json({ message: 'Username taken' });

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await User.create({ username, password: hashedPassword });

                // Generate Token
                const token = jwt.sign({ userId: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
                return res.status(201).json({ token, username, userId: newUser._id });

            } else if (action === 'login') {
                const user = await User.findOne({ username });
                if (!user) return res.status(400).json({ message: 'User not found' });

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return res.status(400).json({ message: 'Invalid password' });

                const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
                return res.status(200).json({ token, username, userId: user._id });
            } else {
                return res.status(400).json({ message: 'Invalid action' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
