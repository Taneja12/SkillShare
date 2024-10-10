// cloudinaryConfig.js
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config(); // Make sure to load environment variables

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary; // Export the cloudinary instance
