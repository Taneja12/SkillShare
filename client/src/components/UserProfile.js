import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Image, Dropdown, Card, ProgressBar } from 'react-bootstrap';
import { FaUserCircle, FaCheckCircle, FaPen, FaUpload, FaCoins } from 'react-icons/fa';
import { fetchMatchedUsers, uploadProfilePicture, updateSkills, sendRequesttoFriend } from '../services/api';
import SkillsSelector from './SkillsSelector';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams(); // Retrieve userId from URL
  const { currentUser } = useAuth();
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTeachSkillsSelector, setShowTeachSkillsSelector] = useState(false);
  const [showLearnSkillsSelector, setShowLearnSkillsSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) { // Use userId from params
        try {
          const data = await fetchMatchedUsers(userId);
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
  }, [userId]);

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

  const navigateToVerify = (skill) => {
    navigate(`/skill-verification/${skill}`, { state: { skill } });
  };

  const renderSkills = useCallback(
    (skills, title, isTeaching, isCurrentUser = false) => (
      <Card className="mb-3 fade-in">
        <Card.Header>
          <h6>{title}</h6>
        </Card.Header>
        <Card.Body>
          {Array.isArray(skills) && skills.length > 0 ? (
            <ul className="skill-list">
              {skills.map((skillObj, index) => (
                <li key={`${title}-${index}-${skillObj.skill}`} className="mb-2">
                  <strong>{skillObj.skill}</strong> - {skillObj.elaboration || 'No elaboration provided'}
                  {isTeaching ? (
                    <>
                      <span>{skillObj.level ? ` (Level: ${skillObj.level})` : ''}</span>
                      {isCurrentUser ? (
                        skillObj.verified_status === 'verified' ? (
                          <span className="verified-badge text-success ms-2">
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <Button
                            variant="outline-primary"
                            className="ml-2"
                            size="sm"
                            onClick={() => navigateToVerify(skillObj.skill)}
                            disabled={currentUser.userId !== currentUserDetails.userId} // Disable button if currentUser is not the same as currentUserDetails
                          >
                            Verify Skill
                          </Button>
                        )
                      ) : (
                        <span className="ms-2">
                          {skillObj.verified_status === 'verified' ? (
                            <span className="text-success">
                              <FaCheckCircle /> Verified
                            </span>
                          ) : (
                            <span className="text-danger">
                              {/* Add any styling or icon for unverified skills */}
                            </span>
                          )}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>{skillObj.level ? ` (Desired Level: ${skillObj.level})` : ''}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No skills available</p>
          )}
        </Card.Body>
      </Card>
    ),
    [navigateToVerify]
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" className="fade-in">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger my-5 fade-in">{error}</div>;
  }

  return (
    <div className="container my-5 user-profile fade-in">
      <Card className="shadow-lg p-4 mb-4 fade-in">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mt-0">
            <h5>Username: {currentUserDetails ? currentUserDetails.username : 'No user available'}</h5>
            {currentUser.userId === currentUserDetails.userId && (
              <div className="d-flex align-items-center">
                <FaCoins size={24} className="me-2 text-warning" />
                <h5>{currentUserDetails.tokens}</h5>
              </div>
            )}
          </div>

          <div className="profile-picture-wrapper mx-auto my-4 text-center" onClick={() => currentUser.userId == currentUserDetails.userId && document.getElementById('fileInput').click()}>
            {uploading && (
              <div className="spinner-overlay">
                <Spinner animation="border" role="status" className="profile-spinner">
                  <span className="visually-hidden">Uploading...</span>
                </Spinner>
                <ProgressBar animated now={80} variant="primary" className="mt-2" />
              </div>
            )}
            {profilePicture ? (
              <Image
                src={profilePicture}
                roundedCircle
                className="profile-picture"
                style={{ width: '120px', height: '120px' }}
              />
            ) : (
              <FaUserCircle size={120} className="profile-icon" />
            )}
            <div className="upload-text mt-2">{currentUser.userId !== currentUserDetails.userId ? '' : 'Click to upload'}</div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={currentUser.userId !== currentUserDetails.userId} // Disable if it's not the current user
            />
          </div>

          {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach', true, currentUser.userId === currentUserDetails.userId)}
          {currentUser.userId === currentUserDetails.userId && (
            <>
              <Button onClick={() => setShowTeachSkillsSelector(!showTeachSkillsSelector)} className="mt-2 mt">
                {showTeachSkillsSelector ? 'Cancel' : 'Add Skills to Teach'}
              </Button>
              {showTeachSkillsSelector && (
                <SkillsSelector onSkillsSelect={(skill) => handleAddSkill(skill, true)} />
              )}
            </>
          )}

          {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn', false)}
          {currentUser.userId === currentUserDetails.userId && (
            <>
              <Button onClick={() => setShowLearnSkillsSelector(!showLearnSkillsSelector)} className="mt-2">
                {showLearnSkillsSelector ? 'Cancel' : 'Add Skills to Learn'}
              </Button>
              {showLearnSkillsSelector && (
                <SkillsSelector onSkillsSelect={(skill) => handleAddSkill(skill, false)} />
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {currentUser.userId === currentUserDetails.userId && (
  <>
    <Button
      variant="primary"
      onClick={() => navigate(`/requests/received/${currentUser.userId}`)}>
      Show Request
    </Button>
    <Button
      variant="primary"
      onClick={() => navigate(`/user/connections/${currentUser.userId}`)}>
      Show Connections
    </Button>
  </>
)}

    </div>
  );
};

export default UserProfile;
