
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Chat.css';
import { getChatHistory, generateGoogleMeetLink, initiateGoogleAuth } from '../services/api';

const API_URL = 'https://skillshare-p28w.onrender.com';

let socket; // Move socket initialization here

const Chat = () => {
    const { userId, username } = useParams();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generatingLink, setGeneratingLink] = useState(false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        // Initialize Socket.IO connection
        socket = io(API_URL, {
            transports: ['websocket'],
        });

        // Join the room when the user is authenticated
        if (currentUser) {
            socket.emit('joinRoom', currentUser.userId);

            // Listen for real-time messages
            socket.on('messageReceived', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });
        }

        return () => {
            socket.disconnect(); // Clean up the socket connection
        };
    }, [currentUser]);

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
    }, [currentUser, userId]);

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

        // Immediately update the messages state with the new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Clear the message input
        setMessageContent('');
    };

    // Handle redirect to Google OAuth route
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
                    content: `Google Meet Link: ${meetLink}`, // Include the link in the message content
                    timestamp: new Date(),
                };
                socket.emit('sendMessage', newMessage); // Emit the new message
                setMessages((prevMessages) => [...prevMessages, newMessage]); // Immediately update the messages state
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
            <h3 className="text-center mb-4">Chat with {username}</h3>
            <div className="chat-box border p-3 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }} ref={chatBoxRef}>
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`chat-message ${msg.sender === currentUser.userId ? 'my-message' : 'other-message'}`}
                        >
                            <div className="chat-bubble">
                                <strong>{msg.sender === currentUser.userId ? 'You' : msg.senderUsername}</strong>:
                                {msg.content.includes('https://meet.google.com/') ? (
                                    // Detect if the message contains a Google Meet link and wrap it as a clickable link
                                    <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-primary">
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

