import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap'; // Optional: Add Bootstrap spinner
import '../css/UserProfle.css'; // Your custom CSS
import { fetchMatchedUsers, uploadProfilePicture } from '../services/api'; // Import API functions

const UserProfile = () => {
  const { currentUser } = useAuth(); // Get the currentUser from AuthContext
  const [matchedUsers, setMatchedUsers] = useState([]); // Default to an empty array
  const [currentUserDetails, setCurrentUserDetails] = useState({}); // Use an object to store user details
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add error state
  const [profilePicture, setProfilePicture] = useState(null); // State to hold the profile picture
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected image file
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const data = await fetchMatchedUsers(currentUser.userId);
          setMatchedUsers(data.matchedUsers); // Directly set matched users
          setCurrentUserDetails(data.currentUser); // Set current user details
          setProfilePicture(data.currentUser.profilePicture); // Load current profile picture
        } catch (error) {
          console.error('Error fetching matched users:', error); // Keep error logging
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

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedFile && currentUser) {
      try {
        const result = await uploadProfilePicture(selectedFile, currentUser.userId);
        setProfilePicture(result.url); // Update state with new image URL
        console.log('Image uploaded successfully:', result.url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    } else {
      console.error('No file selected or user not found');
    }
  };

  // Memoize skills rendering for optimization
  const renderSkills = useCallback(
    (skills, title) => (
      <>
        <h6>{title}:</h6>
        {Array.isArray(skills) && skills.length > 0 ? (
          <ul>
            {skills.map((skillObj, index) => (
              <li key={`${title}-${index}-${skillObj.skill || skillObj.id}`}> {/* Ensure each skill has a unique key */}
                <strong>{skillObj.skill}</strong> - {skillObj.elaboration || 'No elaboration provided'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No skills available</p>
        )}
      </>
    ),
    []
  );

  // Handle message click with useCallback to avoid re-renders
  const handleMessageClick = useCallback(
    (userId) => {
      if (userId) {
        navigate(`/messages/${userId}`);
      } else {
        console.error('Invalid userId for messaging.');
      }
    },
    [navigate]
  );

  // Handle send request click with useCallback to avoid re-renders
  const handleSendRequestClick = useCallback(
    (userId) => {
      console.log(`Request sent to user with ID: ${userId}`);
    },
    []
  );

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
    <div className="container my-5 user-profile">
      <h1 className="text-center mb-4">User Profile</h1>

      {/* Current User Profile */}
      <div className="user-info mb-4">
        <h5>User ID: {currentUser ? currentUser.userId : 'No user available'}</h5>

        {/* Profile Picture */}
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="rounded-circle profile-picture"
            style={{ width: '100px', height: '100px' }} // Adjust size as needed
          />
        ) : (
          <div>
            {/* Show the upload option if no profile picture is present */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button className="btn btn-primary" onClick={handleImageUpload}>
              Upload
            </button>
          </div>
        )}

        {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach')}
        {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn')}
      </div>

      <h2 className="text-center my-4">Matched Users</h2>

      {matchedUsers.length > 0 ? (
        <div className="user-list">
          {matchedUsers.map((user) => (
            <div className="user-card animate" key={user._id}>
              <h5 className="user-title">{user.username}</h5>

              {/* Display matched user's profile picture */}
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  className="rounded-circle matched-user-picture"
                  style={{ width: '75px', height: '75px' }} // Adjust size as needed
                />
              )}

              {renderSkills(user.skillsToTeach, 'Skills to Teach')}
              {renderSkills(user.skillsToLearn, 'Skills to Learn')}

              {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
                <p className="user-interests">Interests: {user.interests.join(', ')}</p>
              )}
              {user.description && <p className="user-description">Description: {user.description}</p>}

              <button className="btn btn-primary" onClick={() => handleMessageClick(user.userId)}>
                Message
              </button>
              <button className="btn btn-secondary" onClick={() => handleSendRequestClick(user._id)}>
                Send Request
              </button>
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
