const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration
// User registration
exports.register = async (req, res) => {
  const { username, email, password, skillsToTeach, skillsToLearn } = req.body;

  try {
    if (!username || !email || !password || !skillsToTeach || !skillsToLearn) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const skillsTeachArray = Array.isArray(skillsToTeach) ? skillsToTeach : skillsToTeach.split(',').map(skill => skill.trim());
    const skillsLearnArray = Array.isArray(skillsToLearn) ? skillsToLearn : skillsToLearn.split(',').map(skill => skill.trim());

    const user = new User({
      username,
      email,
      password,
      skillsToTeach: skillsTeachArray,
      skillsToLearn: skillsLearnArray,
    });

    await user.save();

    // Generate JWT token after registration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token to be used for auto-login
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};


// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", { email });

  try {
    // Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
