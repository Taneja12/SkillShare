const mongoose = require('mongoose');

// Create a User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  skillsToTeach: [{
    skill: { type: String, required: true },
    elaboration: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'expert'], required: true }, // Skill level
    category: { type: String, default: null }, // Optional: skill category
  }],
  skillsToLearn: [{
    skill: { type: String, required: true },
    elaboration: { type: String, required: true },
    desiredLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], required: true }, // Desired skill level
    category: { type: String, default: null }, // Optional: skill category
  }],
  role: {
    type: String,
    default: 'user',
  },
  profilePicture: {
    type: String,
    default: null,
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users connected with
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Incoming requests
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Outgoing requests
  location: { type: String, default: null }, // Optional: add location for filtering
  languages: [{ type: String, default: null }], // Optional: add languages for filtering
}, {
  timestamps: true, // Track creation and update timestamps
});

// Add indexes for fast query performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'skillsToTeach.skill': 1 });
UserSchema.index({ 'skillsToLearn.skill': 1 });

module.exports = mongoose.model('User', UserSchema);
