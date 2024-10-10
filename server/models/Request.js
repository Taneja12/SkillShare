// models/Request.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // User who sends the request
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },   // User who receives the request
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);
