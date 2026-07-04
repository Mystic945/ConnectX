const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/matches
// @desc    Get all matches for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      isActive: true,
    })
      .populate('users', 'name photos college branch year lastActive')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    // Format matches to show the "other" user
    const formatted = matches.map((match) => {
      const otherUser = match.users.find(
        (u) => u._id.toString() !== req.user._id.toString()
      );
      return {
        id: match._id,
        roomId: match.roomId,
        matchType: match.matchType,
        matchedAt: match.createdAt,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        user: otherUser,
      };
    });

    res.json({ success: true, matches: formatted });
  } catch (err) {
    console.error('Matches fetch error:', err);
    res.status(500).json({ error: 'Could not fetch matches.' });
  }
});

// @route   DELETE /api/matches/:matchId
// @desc    Unmatch (delete) a match
// @access  Private
router.delete('/:matchId', protect, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.user._id,
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    // Deactivate match
    match.isActive = false;
    await match.save();

    // Remove from both users' matches array
    const otherUserId = match.users.find(
      (id) => id.toString() !== req.user._id.toString()
    );

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { matches: otherUserId },
    });
    await User.findByIdAndUpdate(otherUserId, {
      $pull: { matches: req.user._id },
    });

    res.json({ success: true, message: 'Unmatched.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not unmatch.' });
  }
});

module.exports = router;
