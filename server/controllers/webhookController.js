const mongoose = require('mongoose');
const Order = require('../models/Order'); // Update the path as necessary
const User = require('../models/User'); // Assuming the User model is in ../models/User

exports.handleWebhook = async (req, res) => {
  console.log('triggered webhook');
  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Check for required fields
    if (!payload.data || !payload.data.order || !payload.data.payment) {
      console.error('Invalid payload structure:', payload);
      return res.status(400).send('Invalid payload structure');
    }

    const { order_id } = payload.data.order;
    const { cf_payment_id, payment_status, order_amount } = payload.data.payment;

    if (!order_id || !cf_payment_id || !payment_status || !order_amount) {
      console.error('Missing required fields:', payload);
      return res.status(400).send('Missing required fields');
    }

    // Find and update the order with the payment details
    const order = await Order.findOneAndUpdate(
      { OrderId: order_id },
      { paymentStatus: payment_status, transactionId: cf_payment_id },
      { new: true }
    );

    if (!order) {
      console.error('Order not found:', order_id);
      return res.status(404).send('Order not found');
    }

    // Check the payment amount to determine the subscription type
    let subscriptionPlan = null;
    let subscriptionEndDate = null;

    if (order_amount === 49) {
      subscriptionPlan = 'monthly';
      subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month from today
    } else if (order_amount === 499) {
      subscriptionPlan = 'yearly';
      subscriptionEndDate = new Date();
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year from today
    }

    if (subscriptionPlan) {
      // Find the user related to this order (assuming there's a userId in the Order schema)
      const user = await User.findById(order.userId);
      if (user) {
        // Update the user's subscription details
        user.subscriptionPlan = subscriptionPlan;
        user.subscriptionStartDate = new Date();
        user.subscriptionEndDate = subscriptionEndDate;
        await user.save();

        console.log(`User ${user.username} subscription updated to ${subscriptionPlan}`);
      } else {
        console.error('User not found for order:', order_id);
      }
    }

    console.log('Order updated:', order);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
};
