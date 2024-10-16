const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const moment = require('moment');
const { handleWebhook } = require('../controllers/webhookController');
require('dotenv').config();

const CF_API_BASE_URL = process.env.CF_API_BASE_URL;
const CF_APP_ID = process.env.CF_APP_ID;
const CF_SECRET_KEY = process.env.CF_SECRET_KEY;

router.post('/createOrder', async (req, res) => {
  try {
    const { orderId, orderAmount, customer_id, customerName, customerEmail, customerPhone } = req.body;
    console.log({ orderId, orderAmount, customer_id, customerName, customerEmail, customerPhone });
    const orderData = {
      customer_details: {
        customer_id,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      },
      order_amount: orderAmount,
      order_currency: 'INR',
      order_id: orderId,
    };

    const response = await axios.post(CF_API_BASE_URL, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    const responseData = response.data;
    console.log(responseData);
    if (responseData.order_status === 'ACTIVE') {
      res.json({ sessionId: responseData.payment_session_id , order_id:responseData.order_id});
    } else {
      throw new Error(responseData.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error creating Cashfree order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Allowed IP addresses for webhook
const allowedIps = {
  production: [
    '52.66.101.190',
    '3.109.102.144',
    '3.111.60.173'
  ],
  test: [
    '52.66.25.127'
  ]
};

// Assuming you are in a test environment
const allowedIpsCurrentEnv = allowedIps.test;

const ipFilter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // If behind a proxy, you might need to use req.headers['x-forwarded-for']
  const forwardedIp = req.headers['x-forwarded-for'] || ip;

  if (allowedIpsCurrentEnv.includes(forwardedIp)) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

// Webhook endpoint for Cashfree
router.post('/webhook', handleWebhook);



router.post('/new', async (req, res) => {
  try {
    const { sessionId, userId, orderId } = req.body;
    console.log({ sessionId, userId,orderId })
    console.log(orderId);
    const order = new Order({
      sessionId,
      userId,
      orderId,
      createdAt:moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'), // Set createdAt manually to current date/time
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId }).populate('cartItems.bookId');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;




