import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Chat.css';
import { getChatHistory, generateGoogleMeetLink, initiateGoogleAuth } from '../services/api';

const API_URL = 'https://skillshare-p28w.onrender.com';

let socket;

const Chat = () => {
    const { userId, username } = useParams();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generatingLink, setGeneratingLink] = useState(false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        // Fetch messages only when Chat component mounts
        const fetchMessages = async () => {
            if (currentUser && userId) {
                setLoading(true);
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

        // Initialize Socket.IO connection
        socket = io(API_URL, { transports: ['websocket'] });
        
        if (currentUser) {
            socket.emit('joinRoom', currentUser.userId);
            socket.on('messageReceived', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });
        }

        return () => {
            socket.disconnect(); // Clean up on unmount
        };
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

        socket.emit('sendMessage', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageContent('');
    };

    const handleGenerateMeetLink = async () => {
        setGeneratingLink(true);
        try {
            const meetLink = await generateGoogleMeetLink();
            if (meetLink) {
                const newMessage = {
                    sender: currentUser.userId,
                    receiver: userId,
                    content: `Google Meet Link: ${meetLink}`,
                    timestamp: new Date(),
                };
                socket.emit('sendMessage', newMessage);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        } catch (error) {
            console.error('Error generating Google Meet link:', error);
            if (error.response && error.response.status === 403) {
                initiateGoogleAuth();
            }
        } finally {
            setGeneratingLink(false);
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
                        <div key={msg._id} className={`chat-message ${msg.sender === currentUser.userId ? 'my-message' : 'other-message'}`}>
                            <div className="chat-bubble">
                                <strong>{msg.sender === currentUser.userId ? 'You' : msg.senderUsername}</strong>
                                : {msg.content.includes('Google Meet Link') ? (
                                    <a href={msg.content.match(/https?:\/\/[^\s]+/g)} target="_blank" rel="noopener noreferrer">
                                        Join Meet
                                    </a>
                                ) : (
                                    msg.content.split(' ').map((word, index) =>
                                        word.match(/https?:\/\/[^\s]+/g) ? (
                                            <a key={index} href={word} target="_blank" rel="noopener noreferrer">
                                                {word}
                                            </a>
                                        ) : (
                                            <span key={index}>{word} </span>
                                        )
                                    )
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

            <div className="mt-3">
                <button onClick={handleGenerateMeetLink} className="btn btn-secondary" disabled={generatingLink}>
                    {generatingLink ? 'Generating...' : 'Generate Google Meet Link'}
                </button>
            </div>
        </div>
    );
};

export default Chat;
