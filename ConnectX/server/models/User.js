const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Auth
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    // Not required — Google users have no password
  },
  googleId: {
    type: String,
    default: null,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },

  // Basic profile
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: true,
    min: 17,
    max: 30,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
    required: true,
  },
  bio: {
    type: String,
    maxlength: 300,
    default: '',
  },
  photos: [{
    url: String,
    publicId: String,
  }],

  // College info
  college: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: String,
    enum: ['FY', 'SY', 'TY', 'Final Year', 'Postgrad'],
    required: true,
  },

  // App preferences
  mode: {
    type: String,
    enum: ['social', 'dating', 'both'],
    default: 'both',
  },
  lookingFor: [{
    type: String,
    enum: ['friends', 'study-partner', 'project-team', 'dating', 'networking'],
  }],
  interestedIn: {
    type: String,
    enum: ['male', 'female', 'everyone'],
    default: 'everyone',
  },

  // Interests & tags
  interests: [{ type: String, maxlength: 30 }],
  skills: [{ type: String, maxlength: 30 }],

  // Swipe data
  swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  swipedLeft:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Safety
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Profile completeness
  profileComplete: {
    type: Boolean,
    default: false,
  },

  // Activity
  lastActive: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

}, { timestamps: true });

// Hash password before saving (only if password exists and was modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if profile is complete
userSchema.methods.checkProfileComplete = function () {
  return !!(
    this.name &&
    this.age &&
    this.gender &&
    this.college &&
    this.branch &&
    this.year &&
    this.photos.length > 0 &&
    this.bio && this.bio.length > 10
  );
};

// Update last active
userSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
