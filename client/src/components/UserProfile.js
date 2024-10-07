import React, { useEffect, useState } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/UserProfle.css'; // Your custom CSS
import { Spinner } from 'react-bootstrap'; // Optional: Add Bootstrap spinner

const UserProfile = () => {
  const { currentUser } = useAuth(); // Get the currentUser from AuthContext
  const [matchedUsers, setMatchedUsers] = useState([]); // Default to an empty array
  const [currentUserDetails, setCurrentUserDetails] = useState({}); // Use an object to store user details
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/match/${currentUser.userId}`);
          console.log('API Response:', response.data); // Log API response for debugging
          setMatchedUsers(response.data.matchedUsers); // Directly set matched users
          setCurrentUserDetails(response.data.currentUser); // Set current user details
        } catch (error) {
          console.error('Error fetching matched users:', error);
          setError('Unable to load user data. Please try again later.');
        } finally {
          setLoading(false); // Stop loading when request is done
        }
      } else {
        setLoading(false); // Stop loading if currentUser is not available
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Function to render skills with elaboration
  const renderSkills = (skills, title) => (
    <>
      <h6>{title}:</h6>
      {Array.isArray(skills) && skills.length > 0 ? (
        <ul>
          {skills.map((skillObj, index) => (
            <li key={index}>
              <strong>{skillObj.skill}</strong> - {skillObj.elaboration || 'No elaboration provided'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No skills available</p>
      )}
    </>
  );

  // Handle message click
  const handleMessageClick = (userId) => {
    // Ensure userId is valid before navigating
    if (userId) {
      navigate(`/messages/${userId}`); // Navigate to the messages page
    } else {
      console.error('Invalid userId for messaging.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        {/* Loading Spinner */}
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
    <div className="container my-5 user-profile">
      <h1 className="text-center mb-4">User Profile</h1>

      <div className="user-info mb-4">
        <h5>User ID: {currentUser ? currentUser.userId : 'No user available'}</h5>
        
        {/* Skills to Teach and Learn */}
        {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach')}
        {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn')}
      </div>

      <h2 className="text-center my-4">Matched Users</h2>
      
      {matchedUsers.length > 0 ? (
        <div className="user-list">
          {matchedUsers.map((user) => (
            <div className="user-card animate" key={user._id}>
              <h5 className="user-title">{user.username}</h5>

              {/* Matched User Skills to Teach */}
              {renderSkills(user.skillsToTeach, 'Skills to Teach')}

              {/* Matched User Skills to Learn */}
              {renderSkills(user.skillsToLearn, 'Skills to Learn')}

              {/* User Interests and Description */}
              {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
                <p className="user-interests">Interests: {user.interests.join(', ')}</p>
              )}
              {user.description && <p className="user-description">Description: {user.description}</p>}

              {/* Action Buttons */}
              <button className="btn btn-primary" onClick={() => handleMessageClick(user._id)}>
                Message
              </button>
              <button className="btn btn-secondary">Connect</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No matched users found.</p>
      )}
    </div>
  );
};

export default UserProfile;
