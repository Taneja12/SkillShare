const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
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

    // Check if user already exists (check for both email and username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "User already exists with this email" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    // Convert skills to arrays (if not already arrays)
    const skillsTeachArray = Array.isArray(skillsToTeach)
      ? skillsToTeach
      : skillsToTeach.split(',').map(skill => skill.trim());

    const skillsLearnArray = Array.isArray(skillsToLearn)
      ? skillsToLearn
      : skillsToLearn.split(',').map(skill => skill.trim());

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user object with the hashed password
    const user = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password
      skillsToTeach: skillsTeachArray,
      skillsToLearn: skillsLearnArray,
    });

    // Save the new user to the database
    await user.save();

    // Generate JWT token after registration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token to be used for auto-login
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error registering user:", error.message || error);

    // Handle specific MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        error: `Duplicate key error: ${Object.keys(error.keyValue)[0]} is already taken`
      });
    }

    // Send a generic error message to avoid exposing sensitive details
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check for missing fields
    if (!password || (!email && !username)) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }

    // Check if the user exists (by email or username)
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return the token in the response
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);

    // Handle different types of error more specifically
    if (error.message.includes("validation failed")) {
      res.status(400).json({ error: "Invalid request data" });
    } else {
      res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    }
  }
};
