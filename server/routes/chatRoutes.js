const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();

// Send a message
router.post('/send', async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const senderUser = await User.findById(sender);
    const newMessage = new Message({
      sender,
      receiver,
      content,
      senderUsername: senderUser ? senderUser.username : 'Unknown', // Get sender's username
      timestamp: new Date(),
      read: false, // Set initial read status to false
    });
    await newMessage.save();

    res.status(201).json({
      message: newMessage,
      senderUsername: senderUser ? senderUser.username : 'Unknown',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
});

// Get chat history between two users
router.get('/history/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    // Mark as read for messages from user2 to user1
    await Message.updateMany(
      { sender: user2, receiver: user1, read: false },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error });
  }
});


module.exports = router;
