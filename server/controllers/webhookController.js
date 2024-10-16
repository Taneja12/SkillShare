const mongoose = require('mongoose');
const Order = require('../models/Order'); // Update the path as necessary

exports.handleWebhook = async (req, res) => {
  console.log('triggered webhook')
  try {
    const payload = req.body;
    console.log('Webhook received:', payload);
    if (!payload.data || !payload.data.order || !payload.data.payment) {
      console.error('Invalid payload structure:', payload);
      return res.status(400).send('Invalid payload structure');
    }
    const { order_id } = payload.data.order;
    const { cf_payment_id, payment_status } = payload.data.payment;

    if (!order_id || !cf_payment_id || !payment_status) {
      console.error('Missing required fields:', payload);
      return res.status(400).send('Missing required fields');
    }

    const order = await Order.findOneAndUpdate(
      { OrderId: order_id },
      { paymentStatus: payment_status, transactionId: cf_payment_id },
      { new: true }
    );

    if (!order) {
      console.error('Order not found:', order_id);
      return res.status(404).send('Order not found');
    }

    console.log('Order updated:', order);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
};

