const mongoose = require('mongoose');
const moment = require('moment'); // Only needed if you use it elsewhere

const orderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to User model
    required: true 
  },
  OrderId: {
    type: String,
    default: null,
  }, // New field for the order ID received from webhook
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the current date and time
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
    required: true,
  },
  transactionId: {
    type: String,
    default: null,
  },
});

// Optionally, you can add a virtual field to format `createdAt` for output
orderSchema.virtual('formattedCreatedAt').get(function() {
  return moment(this.createdAt).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
