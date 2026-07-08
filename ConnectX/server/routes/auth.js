const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, token, user: userObj });
};

// @route   POST /api/auth/register
// @desc    Register with email + password
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, college, branch, year } = req.body;

    if (!name || !email || !password || !age || !gender || !college || !branch || !year) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    if (age < 17 || age > 30) {
      return res.status(400).json({ error: 'Age must be between 17 and 30.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      age: parseInt(age),
      gender,
      college: college.trim(),
      branch: branch.trim(),
      year,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login with email + password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    // If user signed up with Google, they have no password
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, college, branch, year, gender, age } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    // Verify the Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Google token. Please try again.' });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user — log them in
      if (!user.isActive) {
        return res.status(403).json({ error: 'This account has been deactivated.' });
      }

      // Update Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.photos?.length && picture) {
          user.photos = [{ url: picture, publicId: 'google' }];
        }
        await user.save();
      }

      return sendTokenResponse(user, 200, res);
    }

    // New user — need college info to create account
    // If college info not provided, tell frontend to show the college form
    if (!college || !branch || !year || !gender || !age) {
      return res.status(206).json({
        needsCollegeInfo: true,
        googleData: { email, name, picture, googleId },
        message: 'Please provide your college details to complete signup.',
      });
    }

    // Create new user with Google data
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      googleId,
      age: parseInt(age),
      gender,
      college: college.trim(),
      branch: branch.trim(),
      year,
      photos: picture ? [{ url: picture, publicId: 'google' }] : [],
      // No password for Google users
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user.' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({ error: 'Google accounts cannot change password here.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not change password.' });
  }
});

module.exports = router;
