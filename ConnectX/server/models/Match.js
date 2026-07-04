const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  // Which mode triggered the match
  matchType: {
    type: String,
    enum: ['social', 'dating'],
    default: 'social',
  },
  // Chat room ID (same as match ID)
  roomId: {
    type: String,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
  },
}, { timestamps: true });

// Create roomId from sorted user IDs (ensures uniqueness regardless of order)
matchSchema.pre('save', function (next) {
  if (!this.roomId) {
    const sortedIds = this.users.map(id => id.toString()).sort();
    this.roomId = sortedIds.join('_');
  }
  next();
});

// Static method to check if two users already matched
matchSchema.statics.areMatched = async function (userId1, userId2) {
  const match = await this.findOne({
    users: { $all: [userId1, userId2] },
    isActive: true,
  });
  return !!match;
};

module.exports = mongoose.model('Match', matchSchema);
