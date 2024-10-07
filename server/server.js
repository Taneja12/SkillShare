const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with proper CORS settings
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT'], // Add 'PUT' here
        credentials: true,
    },
});
app.set('io', io);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT'], // Add 'PUT' here
    credentials: true,
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Listen for 'joinRoom' to join a specific user room
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (message) => {
        try {
            let senderUsername = message.senderUsername;
            if (!senderUsername) {
                const user = await User.findById(message.sender);
                senderUsername = user ? user.username : 'Unknown';
            }

            const newMessage = new Message({
                ...message,
                senderUsername,
                read: false // Set initial read status to false
            });
            await newMessage.save();

            // Emit the message to the receiver's room
            io.to(message.receiver).emit('messageReceived', {
                ...message,
                senderUsername,
                _id: newMessage._id,
                timestamp: newMessage.timestamp,
            });

            socket.emit('messageReceived', {
                ...message,
                senderUsername,
                _id: newMessage._id,
                timestamp: newMessage.timestamp,
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
