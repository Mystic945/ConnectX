const express = require('express');
const User = require('../models/User');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/discover
// @desc    Get users to swipe on (filtered, excluding already swiped)
// @access  Private
router.get('/discover', protect, async (req, res) => {
  try {
    const { mode, branch, year, limit = 20 } = req.query;
    const currentUser = req.user;

    // Build exclusion list - already swiped + self + blocked
    const excludeIds = [
      currentUser._id,
      ...currentUser.swipedRight,
      ...currentUser.swipedLeft,
      ...currentUser.blockedUsers,
      ...currentUser.matches,
    ];

    // Build filter
    const filter = {
      _id: { $nin: excludeIds },
      college: currentUser.college,
      isActive: true,
      'photos.0': { $exists: true },
      profileComplete: true,
      blockedUsers: { $nin: [currentUser._id] },
    };

    // Mode filter
    if (mode && mode !== 'both') {
      filter.$or = [{ mode: mode }, { mode: 'both' }];
    }

    // Gender preference filter
    if (currentUser.interestedIn && currentUser.interestedIn !== 'everyone') {
      filter.gender = currentUser.interestedIn;
    }

    if (branch) filter.branch = branch;
    if (year) filter.year = year;

    const users = await User.find(filter)
      .select('name age gender bio photos college branch year interests skills lookingFor mode lastActive')
      .limit(parseInt(limit))
      .sort({ lastActive: -1 });

    res.json({ success: true, users });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

// @route   POST /api/users/swipe
// @desc    Swipe right or left on a user
// @access  Private
router.post('/swipe', protect, async (req, res) => {
  try {
    const { targetUserId, direction, mode } = req.body;

    if (!targetUserId || !direction) {
      return res.status(400).json({ error: 'Missing targetUserId or direction.' });
    }

    if (!['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Direction must be left or right.' });
    }

    const currentUser = req.user;

    if (targetUserId === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Cannot swipe on yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let isMatch = false;
    let match = null;

    if (direction === 'right') {
      // Add to swipedRight
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { swipedRight: targetUserId },
      });

      // Check if target also swiped right on current user
      const targetUser2 = await User.findById(targetUserId);
      const alreadySwiped = targetUser2.swipedRight
        .map(id => id.toString())
        .includes(currentUser._id.toString());

      if (alreadySwiped) {
        isMatch = true;

        const existingMatch = await Match.findOne({
          users: { $all: [currentUser._id, targetUserId] },
        });

        if (!existingMatch) {
          match = await Match.create({
            users: [currentUser._id, targetUserId],
            matchType: mode || 'social',
          });

          await User.findByIdAndUpdate(currentUser._id, {
            $addToSet: { matches: targetUserId },
          });
          await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { matches: currentUser._id },
          });
        } else {
          match = existingMatch;
        }
      }
    } else {
      // Swipe left
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { swipedLeft: targetUserId },
      });
    }

    res.json({
      success: true,
      isMatch,
      match: isMatch ? {
        id: match._id,
        roomId: match.roomId,
        matchedUser: {
          _id: targetUser._id,
          name: targetUser.name,
          photos: targetUser.photos,
          college: targetUser.college,
          branch: targetUser.branch,
        },
      } : null,
    });
  } catch (err) {
    console.error('Swipe error:', err);
    res.status(500).json({ error: 'Swipe failed. Please try again.' });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get a user's public profile
// @access  Private
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name age gender bio photos college branch year interests skills lookingFor mode lastActive');

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'age', 'bio', 'branch', 'year', 'mode',
      'lookingFor', 'interestedIn', 'interests', 'skills',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const isComplete = user.checkProfileComplete();
    if (isComplete !== user.profileComplete) {
      user.profileComplete = isComplete;
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// @route   POST /api/users/report
// @desc    Report a user
// @access  Private
router.post('/report', protect, async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;

    if (!targetUserId || !reason) {
      return res.status(400).json({ error: 'Please provide user and reason.' });
    }

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { reportedBy: req.user._id },
    });

    const targetUser = await User.findById(targetUserId);
    if (targetUser && targetUser.reportedBy.length >= 5) {
      await User.findByIdAndUpdate(targetUserId, { isActive: false });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });

    res.json({ success: true, message: 'User reported and blocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit report.' });
  }
});

// @route   POST /api/users/block
// @desc    Block a user
// @access  Private
router.post('/block', protect, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });

    await Match.findOneAndUpdate(
      { users: { $all: [req.user._id, targetUserId] } },
      { isActive: false }
    );

    res.json({ success: true, message: 'User blocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not block user.' });
  }
});

module.exports = router;
