const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_PERSON_CLIENT_ID);

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password, skillsToTeach, skillsToLearn } = req.body;

  try {
    // Validate input fields
    if (!username || !email || !password || !skillsToTeach || !skillsToLearn) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "User already exists with this email" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    // Convert skills to arrays
    const skillsTeachArray = Array.isArray(skillsToTeach)
      ? skillsToTeach
      : skillsToTeach.split(',').map(skill => skill.trim());

    const skillsLearnArray = Array.isArray(skillsToLearn)
      ? skillsToLearn
      : skillsToLearn.split(',').map(skill => skill.trim());

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user object
    const user = new User({
      username,
      email,
      password: hashedPassword,
      skillsToTeach: skillsTeachArray,
      skillsToLearn: skillsLearnArray,
    });

    // Save the new user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error registering user:", error.message || error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: `Duplicate key error: ${Object.keys(error.keyValue)[0]} is already taken`
      });
    }
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    if (!password || (!email && !username)) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message.includes("validation failed")) {
      res.status(400).json({ error: "Invalid request data" });
    } else {
      res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    }
  }
});

router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_PERSON_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId } = payload;

    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const tokenResponse = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: tokenResponse, userId: user._id });
  } catch (error) {
    console.error("Google sign-in error:", error);
    if (error.code === 'invalid_grant') {
      return res.status(400).json({ error: "Invalid token. Please try logging in again." });
    }
    res.status(500).json({ error: "An unexpected error occurred during login. Please try again later." });
  }
});

router.post('/google-signup', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_PERSON_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email: googleEmail, name, sub: googleId } = payload;

    let user = await User.findOne({ googleId });
    if (user) {
      return res.status(409).json({ error: "User already exists. Please log in." }); // User already exists
    }

    // Create a new user if not found
    user = new User({
      username: name,
      email: googleEmail,
      googleId,
    });
    await user.save();

    const tokenResponse = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: tokenResponse, userId: user._id });
  } catch (error) {
    console.error("Google sign-up error:", error);
    if (error.code === 'invalid_grant') {
      return res.status(400).json({ error: "Invalid token. Please try signing up again." });
    }
    res.status(500).json({ error: "An unexpected error occurred during sign-up. Please try again later." });
  }
});

module.exports = router;
 