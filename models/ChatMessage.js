const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient retrieval of user's chat history
chatMessageSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
