const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    intent: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    
    // [NEW] Link chat to a specific user email
    userEmail: { type: String, required: true, index: true }, 

    messages: [messageSchema],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);