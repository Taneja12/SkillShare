const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Send a message
router.post('/send-request', async (req, res) => {
  const { currentUserId, requestId } = req.body;

  // console.log({currentUserId, requestId});
  try {
    const sender = await User.findById(currentUserId);
    const receiver = await User.findById(requestId);
    // console.log('Sender details', sender);
    // console.log('reciever details', receiver);
    if (!sender || !receiver) return res.status(404).json({ error: 'User not found' });

    // Prevent sending duplicate requests
    if (receiver.receivedRequests.includes(currentUserId) || sender.sentRequests.includes(requestId)) {
      return res.status(400).json({ error: 'Request already sent' });
    }
    sender.sentRequests.push(requestId);
    receiver.receivedRequests.push(currentUserId);
    // const senderUser = await User.findById(currentUserId);
    // console.log(senderUser)
    await receiver.save();
    await sender.save();
    res.status(200).json({ message: 'Request Send successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requests/received/:userId
router.get('/received/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('receivedRequests', 'username profilePicture');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.receivedRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests/accept
router.post('/accept', async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) return res.status(404).json({ error: 'User not found' });

    // Add each other to connections
    sender.connections.push(receiverId);
    receiver.connections.push(senderId);

    // Remove from received and sent requests
    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Request accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST /api/requests/decline
router.post('/decline', async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) return res.status(404).json({ error: 'User not found' });

    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Request declined' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/connections/:userId
router.get('/connections/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Fetch user by ID and populate connections
    const user = await User.findById(userId).populate('connections', 'username profilePicture skillsToTeach skillsToLearn');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
