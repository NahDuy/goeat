const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Card = require('./models/Card');
const User = require('./models/User');
const connectToDatabase = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

module.exports = async (req, res) => {
    await connectToDatabase();

    // Check Auth
    const userPayload = verifyToken(req);

    if (req.method === 'GET') {
        try {
            // Priority: User Personal Deck -> Default DB Deck -> Hardcoded Fallback

            if (userPayload) {
                const user = await User.findById(userPayload.userId);
                if (user && user.foodDeck && user.foodDeck.length > 0) {
                    return res.status(200).json(user.foodDeck);
                }
            }

            // Fallback to global cards
            const cards = await Card.find({});
            res.status(200).json(cards);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cards' });
        }

    } else if (req.method === 'POST') {
        // Save Personalized Deck
        if (!userPayload) return res.status(401).json({ message: 'Unauthorized' });

        const { cards } = req.body;
        if (!Array.isArray(cards)) return res.status(400).json({ message: 'Invalid format' });

        try {
            await User.findByIdAndUpdate(userPayload.userId, { foodDeck: cards });
            return res.status(200).json({ message: 'Deck saved successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving deck' });
        }

    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
