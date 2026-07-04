const express = require('express');
const Message = require('../models/Message');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:roomId
// @desc    Get messages for a room
// @access  Private
router.get('/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is in this room
    const match = await Match.findOne({
      roomId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ error: 'You are not in this chat room.' });
    }

    const messages = await Message.find({ roomId })
      .populate('sender', 'name photos')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { roomId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json({
      success: true,
      messages: messages.reverse(), // Chronological order
      page: parseInt(page),
    });
  } catch (err) {
    console.error('Messages fetch error:', err);
    res.status(500).json({ error: 'Could not fetch messages.' });
  }
});

// @route   POST /api/messages/:roomId
// @desc    Send a message (REST fallback, main via socket)
// @access  Private
router.post('/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters).' });
    }

    // Verify user is in this room
    const match = await Match.findOne({
      roomId,
      users: req.user._id,
      isActive: true,
    });

    if (!match) {
      return res.status(403).json({ error: 'You are not in this chat room.' });
    }

    const message = await Message.create({
      roomId,
      sender: req.user._id,
      content: content.trim(),
    });

    // Update match's last message
    await Match.findByIdAndUpdate(match._id, {
      lastMessage: content.trim().substring(0, 50),
      lastMessageAt: new Date(),
    });

    await message.populate('sender', 'name photos');

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Could not send message.' });
  }
});

module.exports = router;
