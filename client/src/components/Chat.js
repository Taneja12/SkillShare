import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Chat.css';

// Initialize Socket.IO client
const socket = io('http://localhost:5000');

const Chat = () => {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (currentUser && userId) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/chat/history/${currentUser.userId}/${userId}`);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMessages();

        if (currentUser) {
            // Emit joinRoom event when the user joins the chat
            socket.emit('joinRoom', currentUser.userId);
            console.log('User joined room:', currentUser.userId);

            // Real-time messages
            socket.on('messageReceived', (message) => {
                if (message.sender === userId || message.sender === currentUser.userId) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            return () => {
                socket.off('messageReceived');
            };
        }
    }, [userId, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageContent.trim()) return;

        const newMessage = {
            sender: currentUser.userId,
            receiver: userId,
            content: messageContent,
            timestamp: new Date(),
        };

        try {
            socket.emit('sendMessage', newMessage);
            setMessageContent(''); // Clear input field after sending
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) return <div className="text-center mt-5">Loading messages...</div>;

    return (
        <div className="chat-container container mt-5">
            <div
                className="chat-box border p-3 rounded"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                ref={chatBoxRef}
            >
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`chat-message ${msg.sender === currentUser.userId ? 'my-message' : 'other-message'}`}
                        >
                            <div className="chat-bubble">
                                <strong>{msg.sender === currentUser.userId ? 'You' : msg.senderUsername}</strong>
                                : {msg.content}
                                <small className="text-muted d-block">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted">No messages yet.</p>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="d-flex mt-3">
                <input
                    type="text"
                    className="form-control me-2"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message..."
                    required
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    );
};

export default Chat;
