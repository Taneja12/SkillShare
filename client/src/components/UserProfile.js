import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Image, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import '../css/UserProfle.css';
import { fetchMatchedUsers, uploadProfilePicture, updateSkills } from '../services/api'; // Update API
import SkillsSelector from './SkillsSelector'; // Import the SkillsSelector component

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTeachSkillsSelector, setShowTeachSkillsSelector] = useState(false); // Toggle for skills to teach
  const [showLearnSkillsSelector, setShowLearnSkillsSelector] = useState(false); // Toggle for skills to learn
  const [skillLevelFilter, setSkillLevelFilter] = useState(''); // New state for filter
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    if (file && currentUser) {
      setUploading(true); 
      try {
        const result = await uploadProfilePicture(file, currentUser.userId);
        setProfilePicture(result.url);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddSkill = async (skill, isTeaching) => {
    const updatedSkills = isTeaching
      ? [...currentUserDetails.skillsToTeach, skill]
      : [...currentUserDetails.skillsToLearn, skill];
  
    try {
      await updateSkills(currentUser.userId, updatedSkills, isTeaching);
  
      if (isTeaching) {
        setCurrentUserDetails({
          ...currentUserDetails,
          skillsToTeach: updatedSkills,
        });
      } else {
        setCurrentUserDetails({
          ...currentUserDetails,
          skillsToLearn: updatedSkills,
        });
      }
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };
  
  const handleFilterChange = (level) => {
    setSkillLevelFilter(level);
  };

  // Filter matched users based on selected skill level filter
  const filteredMatchedUsers = matchedUsers.filter(user =>
    user.skillsToTeach.some(skill => skill.level === skillLevelFilter || skillLevelFilter === '')
  );

  const renderSkills = useCallback(
    (skills, title, isTeaching) => (
      <>
        <h6>{title}:</h6>
        {Array.isArray(skills) && skills.length > 0 ? (
          <ul>
            {skills.map((skillObj, index) => (
              <li key={`${title}-${index}-${skillObj.skill}`}>
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
          <div className="upload-text">Click to upload</div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Display and Edit Skills to Teach */}
        {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach', true)}
        <Button onClick={() => setShowTeachSkillsSelector(!showTeachSkillsSelector)}>
          {showTeachSkillsSelector ? 'Cancel' : 'Add Skills to Teach'}
        </Button>
        {showTeachSkillsSelector && (
          <SkillsSelector
            onSkillsSelect={(skill) => handleAddSkill(skill, true)}
          />
        )}

        {/* Display and Edit Skills to Learn */}
        {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn', false)}
        <Button onClick={() => setShowLearnSkillsSelector(!showLearnSkillsSelector)}>
          {showLearnSkillsSelector ? 'Cancel' : 'Add Skills to Learn'}
        </Button>
        {showLearnSkillsSelector && (
          <SkillsSelector
            onSkillsSelect={(skill) => handleAddSkill(skill, false)}
          />
        )}
      </div>

      <h2 className="text-center my-4">Matched Users</h2>

      {/* Skill Level Filter Dropdown */}
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
        <div className="user-list">
          {filteredMatchedUsers.map((user) => (
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

              <Button variant="primary" onClick={() => navigate(`/messages/${user.userId}`)}>
                Message
              </Button>
              <Button variant="secondary" onClick={() => console.log(`Request sent to ${user._id}`)}>
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
