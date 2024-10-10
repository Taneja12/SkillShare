// controllers/requestController.js
const Request = require('../models/Request');
const User = require('../models/User');

// Send connection request
const sendRequest = async (req, res) => {
  try {
    const { currentUserId } = req.body;
    const matchedUserId = req.params.matchedUserId;

    // Check if the request already exists
    const existingRequest = await Request.findOne({ requesterId: currentUserId, receiverId: matchedUserId });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const newRequest = new Request({
      requesterId: currentUserId,
      receiverId: matchedUserId,
      status: 'pending',
    });

    await newRequest.save();
    res.status(200).json({ message: 'Connection request sent successfully!' });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Error sending connection request.' });
  }
};

// Accept connection request
const acceptRequest = async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    const currentUserId = req.userId; // User receiving the request

    const request = await Request.findOneAndUpdate(
      { requesterId, receiverId: currentUserId, status: 'pending' },
      { status: 'accepted' }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    // Add both users to each other's connections
    await User.findByIdAndUpdate(currentUserId, { $push: { connections: requesterId } });
    await User.findByIdAndUpdate(requesterId, { $push: { connections: currentUserId } });

    res.status(200).json({ message: 'Connection request accepted!' });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ error: 'Error accepting connection request.' });
  }
};

// Reject connection request
const rejectRequest = async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    const currentUserId = req.userId;  // User receiving the request

    const request = await Request.findOneAndUpdate(
      { requesterId, receiverId: currentUserId, status: 'pending' },
      { status: 'declined' }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    res.status(200).json({ message: 'Connection request rejected!' });
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ error: 'Error rejecting connection request.' });
  }
};

// Fetch all pending requests
const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.userId;  // User's ID from auth token

    const pendingRequests = await Request.find({ receiverId: currentUserId, status: 'pending' })
      .populate('requesterId', 'username');

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Error fetching pending requests.' });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getPendingRequests,
};
