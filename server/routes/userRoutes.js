// matchRoutes.js
const express = require('express');
const router = express.Router();
const { matchUsers } = require('../controllers/userController');

// Route to get matched users by user ID
router.get('/match/:id', matchUsers);

module.exports = router;