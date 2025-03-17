const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma pour chaque message
const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Schéma pour une conversation
const conversationSchema = new Schema({
  messages: [messageSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
