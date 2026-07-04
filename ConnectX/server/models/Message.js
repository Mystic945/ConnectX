const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for fetching messages by room efficiently
messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
