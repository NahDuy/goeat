const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('./models/Group');
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
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'POST') {
        const { action, groupCode, dishes, status } = req.body;

        try {
            if (action === 'create') {
                // Generate simple 4-char code
                const { name } = req.body;
                const code = Math.random().toString(36).substring(2, 6).toUpperCase();

                const group = new Group({
                    code,
                    name: name || `G-${code}`, // Default name if empty
                    host: user.userId,
                    members: [{
                        userId: user.userId,
                        username: user.username,
                        dishes: [],
                        ready: false
                    }]
                });
                await group.save();
                return res.status(201).json(group);
            }

            if (action === 'join') {
                const group = await Group.findOne({ code: groupCode });
                if (!group) return res.status(404).json({ message: 'Room not found' });

                // Check if already in group
                const alreadyMember = group.members.find(m => m.userId.toString() === user.userId);
                if (!alreadyMember) {
                    group.members.push({ userId: user.userId, username: user.username, ready: false });
                    await group.save();
                }
                return res.status(200).json(group);
            }

            if (action === 'submit') { // Submit dishes & ready status
                const group = await Group.findOne({ code: groupCode });
                if (!group) return res.status(404).json({ message: 'Room not found' });

                const member = group.members.find(m => m.userId.toString() === user.userId);
                if (member) {
                    // Append new dishes, filter duplicates if needed
                    const newDishes = dishes || [];
                    newDishes.forEach(d => {
                        if (!member.dishes.includes(d)) member.dishes.push(d);
                    });
                    member.ready = true;
                    await group.save();
                }
                return res.status(200).json(group);
            }

            if (action === 'startRoll') {
                const group = await Group.findOne({ code: groupCode });
                if (!group) return res.status(404).json({ message: 'Room not found' });
                if (group.host.toString() !== user.userId) return res.status(403).json({ message: 'Only host' });

                group.status = 'rolling';
                await group.save();
                return res.status(200).json(group);
            }

            if (action === 'finishRoll') {
                const group = await Group.findOne({ code: groupCode });
                if (!group) return res.status(404).json({ message: 'Room not found' });
                if (group.host.toString() !== user.userId) return res.status(403).json({ message: 'Only host' });

                // Collect dishes
                let allDishes = [];
                group.members.forEach(m => {
                    if (m.dishes && m.dishes.length > 0) allDishes.push(...m.dishes);
                });

                // Fallback if empty
                if (allDishes.length === 0) allDishes = ['Phở', 'Bún chả', 'Cơm tấm', 'Mì xào'];

                const winner = allDishes[Math.floor(Math.random() * allDishes.length)];
                group.result = winner;
                group.status = 'decided';
                await group.save();

                return res.status(200).json({ result: winner, group });
            }

            if (action === 'reset') {
                const group = await Group.findOne({ code: groupCode });
                if (!group) return res.status(404).json({ message: 'Room not found' });
                if (group.host.toString() !== user.userId) return res.status(403).json({ message: 'Only host can reset' });

                group.status = 'waiting';
                group.result = null;
                // Reset all members
                group.members.forEach(m => {
                    m.dishes = [];
                    m.ready = false;
                });

                await group.save();
                return res.status(200).json(group);
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    } else if (req.method === 'GET') {
        const { code, userId } = req.query;

        if (code) {
            const group = await Group.findOne({ code });
            if (!group) return res.status(404).json({ message: 'Room not found' });
            return res.status(200).json(group);
        }

        if (userId) {
            // Fetch groups where user is a member, sorted by newest
            try {
                const groups = await Group.find({ 'members.userId': userId })
                    .sort({ createdAt: -1 })
                    .limit(10); // Limit to last 10
                return res.status(200).json(groups);
            } catch (e) {
                return res.status(500).json({ message: 'Error fetching groups' });
            }
        }

        return res.status(400).json({ message: 'Missing parameters' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
