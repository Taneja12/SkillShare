import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Image, Dropdown, Card, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaUserCircle, FaCheckCircle, FaPen, FaUpload, FaCoins } from 'react-icons/fa';
import { fetchMatchedUsers, uploadProfilePicture, updateSkills } from '../services/api';
import SkillsSelector from './SkillsSelector';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/UserProfile.css'; // Custom styles for further enhancements

const UserProfile = () => {
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
  const [skillLevelFilter, setSkillLevelFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const data = await fetchMatchedUsers(currentUser.userId);
          console.log(data);
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

  const filteredMatchedUsers = matchedUsers.filter((user) =>
    user.skillsToTeach.some(
      (skill) => skill.level === skillLevelFilter || skillLevelFilter === ''
    )
  );

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
            <h5>Username: {currentUser ? currentUser.username : 'No user available'}</h5>
            <div className="d-flex align-items-center">
              <FaCoins size={24} className="me-2 text-warning" /> {/* Token icon */}
              <h5>{currentUserDetails.tokens}</h5>
            </div>
          </div>


          <div className="profile-picture-wrapper mx-auto my-4 text-center" onClick={() => document.getElementById('fileInput').click()}>
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
            <div className="upload-text mt-2">Click to upload</div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {renderSkills(currentUserDetails.skillsToTeach, 'Skills to Teach', true, true)}
          <Button onClick={() => setShowTeachSkillsSelector(!showTeachSkillsSelector)} className="mt-2 mt">
            {showTeachSkillsSelector ? 'Cancel' : 'Add Skills to Teach'}
          </Button>
          {showTeachSkillsSelector && (
            <SkillsSelector onSkillsSelect={(skill) => handleAddSkill(skill, true)} />
          )}

          {renderSkills(currentUserDetails.skillsToLearn, 'Skills to Learn', false)}
          <Button onClick={() => setShowLearnSkillsSelector(!showLearnSkillsSelector)} className="mt-2">
            {showLearnSkillsSelector ? 'Cancel' : 'Add Skills to Learn'}
          </Button>
          {showLearnSkillsSelector && (
            <SkillsSelector onSkillsSelect={(skill) => handleAddSkill(skill, false)} />
          )}
        </Card.Body>
      </Card>

      <h2 className="text-center my-4 fade-in">Matched Users</h2>

      <Dropdown className="mb-4 fade-in">
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
        <div className="row">
          {filteredMatchedUsers.map((user) => (
            <div className="col-md-6 col-lg-4 mb-4 fade-in" key={user._id}>
              <Card className="shadow-lg h-100 user-card">
                <Card.Body>
                  {/* User Title */}
                  <h5 className="user-title">{user.username}</h5>

                  {/* Profile Picture or Placeholder */}
                  <div className="text-center mb-3">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        roundedCircle
                        className="profile-picture"
                        style={{ width: '75px', height: '75px' }}
                        alt={`${user.username}'s profile`}
                      />
                    ) : (
                      <div className="placeholder-profile" style={{ width: '75px', height: '75px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUserCircle size={40} />
                      </div>
                    )}
                  </div>

                  {/* Render User Skills */}
                  {renderSkills(user.skillsToTeach, 'Skills to Teach', true)}
                  {renderSkills(user.skillsToLearn, 'Skills to Learn', false)}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/messages/${user.userId}/${user.username}`)}
                    >
                      Message
                    </Button>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Send Skill Exchange Request</Tooltip>}>
                      <Button
                        variant="secondary"
                        onClick={() => console.log(`Request sent to ${user._id}`)}
                      >
                        Send Request
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center fade-in">No matched users found.</p>
      )}

    </div>
  );
};

export default UserProfile;
