const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinaryConfig'); // Adjust path if needed
const User = require('../models/User'); // Adjust path as necessary

const router = express.Router();

// Use Multer's memory storage to avoid saving files locally
const storage = multer.memoryStorage(); // Store files in memory (RAM)
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload image to Cloudinary directly from memory
        const uploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Failed to upload image', details: error.message });
                }
                
                // Update user's profile picture in the database
                const userId = req.body.userId;
                User.findByIdAndUpdate(userId, { profilePicture: result.secure_url })
                    .then(() => res.status(200).json({ url: result.secure_url }))
                    .catch((err) => res.status(500).json({ error: 'Failed to update user data', details: err.message }));
            }
        );

        // Stream the file buffer to Cloudinary
        uploadResult.end(req.file.buffer);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

module.exports = router;
