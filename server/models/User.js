const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Remove whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Normalize email for consistency
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email validation
  },
  password: {
    type: String,
    required: true,
    // minlength: 6, // Minimum length for passwords
  },
  skillsToTeach: {
    type: [String],
    default: [],
  },
  skillsToLearn: {
    type: [String],
    default: [],
  },
  skillsToTeach: [{ 
    skill: { type: String, required: true }, 
    elaboration: { type: String, required: true } 
  }],
  skillsToLearn: [{ 
    skill: { type: String, required: true }, 
    elaboration: { type: String, required: true } 
  }],
  role: {
    type: String,
    default: 'user', // Default role
  },
  profilePicture: {
    type: String, // URL or path to profile picture
    default: null,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
