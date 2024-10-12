import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Image } from 'react-bootstrap'; // Import Bootstrap components
import { FaUserCircle } from 'react-icons/fa'; // Import profile icon
import '../css/UserProfle.css'; // Your custom CSS
import { fetchMatchedUsers, uploadProfilePicture } from '../services/api'; // Import API functions

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Add state for uploading
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const data = await fetchMatchedUsers(currentUser.userId);
          setMatchedUsers(data.matchedUsers);
          setCurrentUserDetails(data.currentUser);
          setProfilePicture(data.currentUser.profilePicture);
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

  // Handle file selection and upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    if (file && currentUser) {
      setUploading(true); // Show spinner during upload
      try {
        const result = await uploadProfilePicture(file, currentUser.userId);
        setProfilePicture(result.url);
        console.log('Image uploaded successfully:', result.url);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false); // Hide spinner after upload
      }
    } else {
      console.error('No file selected or user not found');
    }
  };

  const renderSkills = useCallback(
    (skills, title, isTeaching) => (
      <>
        <h6>{title}:</h6>
        {Array.isArray(skills) && skills.length > 0 ? (
          <ul>
            {skills.map((skillObj, index) => (
              <li key={`${title}-${index}-${skillObj.skill || skillObj.id}`}>
                <strong>{skillObj.skill}</strong> - {skillObj.elaboration || 'No elaboration provided'}
                {isTeaching ? (
                  <span>{skillObj.level ? ` (Level: ${skillObj.level})` : ''}</span>
                ) : (
                  <span>{skillObj.desiredLevel ? ` (Current Level: ${skillObj.desiredLevel})` : ''}</span>
                )}
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

        {/* Profile Picture with hover effect and spinner */}
        <div className="profile-picture-wrapper" onClick={() => document.getElementById('fileInput').click()}>
  {uploading && (
    <div className="spinner-overlay">
      <Spinner animation="border" role="status" className="profile-spinner">
        <span className="visually-hidden">Uploading...</span>
      </Spinner>
    </div>
  )}
  {profilePicture ? (
    <Image
      src={profilePicture}
      roundedCircle
      className="profile-picture"
      style={{ width: '100px', height: '100px' }}
    />
  ) : (
    <FaUserCircle size={100} className="profile-icon" />
  )}
  
  {/* Click to upload text */}
  <div className="upload-text">Click to upload</div>
  
  <input
    id="fileInput"
    type="file"
    accept="image/*"
    style={{ display: 'none' }}
    onChange={handleFileChange}
  />
</div>


        {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach', true)}
        {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn', false)}
      </div>

      <h2 className="text-center my-4">Matched Users</h2>

      {matchedUsers.length > 0 ? (
        <div className="user-list">
          {matchedUsers.map((user) => (
            <div className="user-card" key={user._id}>
              <h5 className="user-title">{user.username}</h5>
              {user.profilePicture && (
                <Image
                  src={user.profilePicture}
                  roundedCircle
                  style={{ width: '75px', height: '75px' }}
                  alt={`${user.username}'s profile`}
                />
              )}
              {renderSkills(user.skillsToTeach, 'Skills to Teach', true)}
              {renderSkills(user.skillsToLearn, 'Skills to Learn', false)}

              {user.interests && <p>Interests: {user.interests.join(', ')}</p>}
              {user.description && <p>Description: {user.description}</p>}

              <Button variant="primary" onClick={() => handleMessageClick(user.userId)}>
                Message
              </Button>
              <Button variant="secondary" onClick={() => handleSendRequestClick(user._id)}>
                Send Request
              </Button>
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
