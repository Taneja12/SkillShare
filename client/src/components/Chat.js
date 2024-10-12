import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Chat.css';
import { getChatHistory, generateGoogleMeetLink, initiateGoogleAuth } from '../services/api'; // Import the API function for Meet link and auth

// Set the API URL to your deployed backend
const API_URL = 'http://localhost:5000'; // Use your deployed backend URL

// Initialize Socket.IO client with the deployed API URL and with credentials
const socket = io(API_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });
  

const Chat = () => {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generatingLink, setGeneratingLink] = useState(false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (currentUser && userId) {
                try {
                    const chatHistory = await getChatHistory(currentUser.userId, userId);
                    setMessages(chatHistory);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMessages();

        if (currentUser) {
            socket.emit('joinRoom', currentUser.userId);

            // Listen for real-time messages
            socket.on('messageReceived', (message) => {
                if (message.sender === userId || message.sender === currentUser.userId) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            // Clean up when the component unmounts
            return () => {
                socket.off('messageReceived');
            };
        }
    }, [userId, currentUser]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageContent.trim()) return;

        const newMessage = {
            sender: currentUser.userId,
            receiver: userId,
            content: messageContent,
            timestamp: new Date(),
        };

        // Emit the message via Socket.IO
        socket.emit('sendMessage', newMessage);
        setMessageContent('');
    };

    const handleClick = () => {
        // Redirect to the backend Google OAuth route
        window.location.href = `${API_URL}/api/meet/google/auth`;
    };

    const handleGenerateMeetLink = async () => {
        setGeneratingLink(true); // Set generating state to true
        try {
            const meetLink = await generateGoogleMeetLink(); // Call API to generate Google Meet link
            if (meetLink) {
                // Send the Google Meet link as a chat message
                const newMessage = {
                    sender: currentUser.userId,
                    receiver: userId,
                    content: `Google Meet Link: ${meetLink}`,
                    timestamp: new Date(),
                };
                socket.emit('sendMessage', newMessage);
            }
        } catch (error) {
            console.error('Error generating Google Meet link:', error);
            // Optionally, redirect to Google authentication if not authorized
            if (error.response && error.response.status === 403) {
                initiateGoogleAuth(); // Redirect to Google auth
            }
        } finally {
            setGeneratingLink(false); // Reset generating state
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
                                : {msg.content.includes('Google Meet Link') ? (
                                    <a href={msg.content.split('Google Meet Link: ')[1]} target="_blank" rel="noopener noreferrer">
                                        Join Meet
                                    </a>
                                ) : (
                                    msg.content
                                )}
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

            {/* Button to generate Google Meet link */}
            <div className="mt-3">
                <button onClick={handleClick} className="btn btn-secondary" disabled={generatingLink}>
                    {generatingLink ? 'Generating...' : 'Generate Google Meet Link'}
                </button>
            </div>
        </div>
    );
};

export default Chat;
