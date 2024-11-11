import React, { useEffect, useState } from 'react';
import { Nav, Tab, Row, Col } from 'react-bootstrap';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { fetchMatchedUsers } from '../services/api';
import { useAuth } from '../Contexts/AuthContext';
import Chat from './Chat';
import '../css/MessengerTabs.css';

const MessengerTabs = () => {
  const { currentUser } = useAuth();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadConnectedUsers = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const data = await fetchMatchedUsers(currentUser.userId);
          const filteredUsers = data.matchedUsers.filter((user) =>
            data.currentUser.connections.includes(user.userId)
          );
          setConnectedUsers(filteredUsers);
        } catch (error) {
          console.error('Error loading connected users:', error);
        }
      }
    };

    loadConnectedUsers();
  }, [currentUser]);

  const handleUserSelect = (user) => {
    navigate(`/messenger/messages/${user.userId}/${user.username}`);
  };

  return (
    <Tab.Container defaultActiveKey="chat">
      <Row className="mt-5">
        <Col sm={3} className="tabs-col">
          <Nav variant="pills" className="flex-column">
            {connectedUsers.length > 0 ? (
              connectedUsers.map((user) => (
                <Nav.Item key={user.userId}>
                  <Nav.Link
                    as="span"
                    onClick={() => handleUserSelect(user)}
                    style={{ cursor: 'pointer' }}
                  >
                    {user.username}
                  </Nav.Link>
                </Nav.Item>
              ))
            ) : (
              <p className="text-muted">No connections available</p>
            )}
          </Nav>
        </Col>
        <Col sm={9} className="tab-content-col">
          <Routes>
            <Route path="/" element={<div>Select a chat to begin.</div>} />
            <Route path="messages/:userId/:username" element={<Chat />} />
          </Routes>
        </Col>
      </Row>
    </Tab.Container>
  );
};

export default MessengerTabs;
