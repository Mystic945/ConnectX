const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer - store in memory, then upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `campusconnect/${folder}`,
        transformation: [
          { width: 800, height: 1000, crop: 'limit' }, // Max dimensions
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @route   POST /api/upload/photo
// @desc    Upload a profile photo
// @access  Private
router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const user = await User.findById(req.user._id);

    // Max 6 photos
    if (user.photos.length >= 6) {
      return res.status(400).json({ error: 'Maximum 6 photos allowed. Delete one first.' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.user._id.toString());

    // Save to user
    user.photos.push({
      url: result.secure_url,
      publicId: result.public_id,
    });

    // Check if profile is now complete
    user.profileComplete = user.checkProfileComplete();
    await user.save();

    res.json({
      success: true,
      photo: { url: result.secure_url, publicId: result.public_id },
      photos: user.photos,
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Photo upload failed. Please try again.' });
  }
});

// @route   DELETE /api/upload/photo/:publicId
// @desc    Delete a profile photo
// @access  Private
router.delete('/photo/:publicId(*)', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const user = await User.findById(req.user._id);

    // Find the photo
    const photoIndex = user.photos.findIndex((p) => p.publicId === publicId);
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from user
    user.photos.splice(photoIndex, 1);
    user.profileComplete = user.checkProfileComplete();
    await user.save();

    res.json({ success: true, photos: user.photos });
  } catch (err) {
    console.error('Photo delete error:', err);
    res.status(500).json({ error: 'Could not delete photo.' });
  }
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  res.status(400).json({ error: err.message });
});

module.exports = router;
