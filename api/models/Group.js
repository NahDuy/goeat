const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, default: 'Phòng Ăn' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        dishes: [String], // Suggested dishes
        ready: { type: Boolean, default: false }
    }],
    status: { type: String, default: 'waiting' }, // waiting, rolling, decided
    result: { type: String }, // Final dish
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto delete after 24h
});

module.exports = mongoose.models.Group || mongoose.model('Group', GroupSchema);
