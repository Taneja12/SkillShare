import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Dropdown, ListGroup, Row, Col, Container } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { fetchMatchedUsers, sendRequesttoFriend } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Explore.css'; // Custom styles for Explore component

const Explore = () => {
  const { currentUser } = useAuth();
  const [currentUserDetails, setCurrentUserDetails] = useState({});
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillLevelFilter, setSkillLevelFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const data = await fetchMatchedUsers(currentUser.userId);
          setMatchedUsers(data.matchedUsers);
          setCurrentUserDetails(data.currentUser);
        } catch (error) {
          console.error('Error fetching matched users:', error);
          setError('Unable to load user data. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleFilterChange = (level) => {
    setSkillLevelFilter(level);
  };

  const filteredMatchedUsers = matchedUsers.filter((user) =>
    user.skillsToTeach.some(
      (skill) => skill.level === skillLevelFilter || skillLevelFilter === ''
    )
  );

  const sendRequest = async (userId) => {
    try {
      await sendRequesttoFriend(currentUser.userId, userId);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger my-5">{error}</div>;
  }

  return (
    <Container className="my-5 explore-page">
      <h2 className="text-center mb-4">Explore Matched Users</h2>

      <Dropdown className="mb-4">
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          Filter by Skill Level: {skillLevelFilter || 'All Levels'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleFilterChange('')}>All Levels</Dropdown.Item>
          <Dropdown.Item onClick={() => handleFilterChange('beginner')}>Beginner</Dropdown.Item>
          <Dropdown.Item onClick={() => handleFilterChange('intermediate')}>Intermediate</Dropdown.Item>
          <Dropdown.Item onClick={() => handleFilterChange('expert')}>Expert</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {filteredMatchedUsers.length > 0 ? (
        <ListGroup variant="flush">
          {filteredMatchedUsers.map((user) => (
            <ListGroup.Item
              key={user._id}
              className="d-flex align-items-center justify-content-between py-3 list-group-item"
              onClick={() => navigate(`/profile/${user.userId}`)}
            >
              <Row className="align-items-center w-100">
                <Col xs={3} md={2} className="text-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.username}'s profile`}
                      className="rounded-circle img-fluid profile-picture"
                    />
                  ) : (
                    <FaUserCircle size={40} className="text-muted" />
                  )}
                </Col>
                <Col xs={6} md={7}>
                  <strong>{user.username}</strong>
                  <div className="user-skills">
                    {user.skillsToTeach.length > 0
                      ? `Teaches: ${user.skillsToTeach
                          .slice(0, 2)
                          .map((skill) => skill.skill)
                          .join(', ')}`
                      : 'No skills listed'}
                  </div>
                </Col>
                <Col xs={3} md={3} className="text-end">
                  {currentUserDetails.connections?.includes(user.userId) ? (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/${user.userId}/${user.username}`);
                      }}
                      className="me-2 message-btn"
                    >
                      Message
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendRequest(user.userId);
                      }}
                      className="send-request-btn"
                    >
                      Add
                    </Button>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-center">No matched users found.</p>
      )}
    </Container>
  );
};

export default Explore;
