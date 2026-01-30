const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    suit: { type: String, required: true },
    value: { type: String, required: true },
    display: { type: String, required: true },
    dish: { type: String, required: true },
    color: { type: String, required: true },
    symbol: { type: String, required: true }
});

// Prevent model recompilation error in serverless environment
module.exports = mongoose.models.Card || mongoose.model('Card', CardSchema);
