const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conversationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);