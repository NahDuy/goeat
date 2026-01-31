const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent model recompilation error in serverless
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
