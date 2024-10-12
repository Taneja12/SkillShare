const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const requestRoutes = require('./routes/requestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const meetRoutes = require('./routes/meetRoutes');
const Message = require('./models/Message');
const User = require('./models/User');
require('dotenv').config();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://skill-share-deepanshu-tanejas-projects.vercel.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// Initialize Socket.IO with proper CORS settings
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'], // Enable both 'websocket' and 'polling'
});

app.set('io', io);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/meet', meetRoutes);

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined room ${userId}`);
    });


    socket.on('sendMessage', async (message) => {
        try {
            let senderUsername = message.senderUsername || (await getSenderUsername(message.sender));

            const newMessage = new Message({
                ...message,
                senderUsername,
                read: false
            });
            await newMessage.save();

            io.to(message.receiver).emit('messageReceived', {
                ...message,
                senderUsername,
                _id: newMessage._id,
                timestamp: newMessage.timestamp,
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id} Reason: ${reason}`);
    });
});

// Helper function to get sender username
async function getSenderUsername(senderId) {
    const user = await User.findById(senderId);
    return user ? user.username : 'Unknown';
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
