import React, { useState } from 'react';
import { registerUser, googleSignUpUser } from '../services/api'; // Import both API functions
import { useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import skillsData from './skills'; // Import the skills data
import { useAuth } from '../Contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin component

// Convert skillsData into options for React Select
const skillCategories = Object.keys(skillsData).map(category => ({
  value: category,
  label: category,
}));

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const Register = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    skillsToTeach: [],
    skillsToLearn: [],
    skillsDescription: { teaching: '', learning: '' },
    teachingLevels: {},
    learningLevels: {},
  });
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [teachingCategories, setTeachingCategories] = useState([]);
  const [learningCategory, setLearningCategory] = useState(null);
  const navigate = useNavigate();

  // Handling input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error on input change
  };

  // Handle React-Select changes
  const handleSelectChange = (selectedOptions, fieldName) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, [fieldName]: values }));
  };

  const handleLevelChange = (skill, level, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [skill]: level,
      },
    }));
  };

  // Go to the next step
  const handleNextStep = (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (currentStep === 1) {
      // Basic validation for Step 1 (username, email, password)
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setCurrentStep(2); // Move to Step 2
    } else if (currentStep === 2) {
      // Ensure both skillsToTeach and skillsToLearn are selected
      if (!formData.skillsToTeach.length || !formData.skillsToLearn.length) {
        setError('You must select skills to teach and learn');
        return;
      }
      setCurrentStep(3); // Move to Step 3
    }
    setError(''); // Clear any error messages
  };

  // Submit final data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset previous error

    const { skillsDescription, skillsToTeach, skillsToLearn, teachingLevels, learningLevels } = formData;

    // Check for common skills
    const commonSkills = skillsToTeach.filter(skill => skillsToLearn.includes(skill));
    if (commonSkills.length > 0) {
      setError('You cannot select the same skill for both teaching and learning');
      return;
    }

    const formattedData = {
      ...formData,
      skillsToTeach: skillsToTeach.map(skill => ({
        skill,
        elaboration: skillsDescription.teaching || '',
        level: teachingLevels[skill] || 'beginner', // Default to 'beginner'
      })),
      skillsToLearn: skillsToLearn.map(skill => ({
        skill,
        elaboration: skillsDescription.learning || '',
        level: learningLevels[skill] || 'beginner', // Default to 'beginner'
      })),
    };

    try {
      const response = await registerUser(formattedData);
      const { token } = response;
      if (token) {
        login(token); // Automatically login the user using the token
        alert('Registration successful');
        navigate('/'); // Redirect to the homepage or dashboard
      } else {
        alert('Registration successful, but no token received.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Error in registration. Please try again.';
      setError(errorMessage);
    }
  };

  // Google Sign-Up
  const handleGoogleSignUp = async (response) => {
    try {
        const result = await googleSignUpUser({ token: response.credential });
        if (result && result.token) {
            login(result.token); // Store the token in context
            setFormData(prev => ({
                ...prev,
                username: result.userId, // or result.username if available
            }));
            setCurrentStep(2); // Move to the next step of registration
        } else {
            setError('Google sign-in failed. Please try again.');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.message.includes("User already exists")) {
            setError('User already exists. Please log in.'); // Handle existing user error
        } else if (error.message.includes("User not found")) {
            setError('No account found with this Google ID. Please sign up first.');
        } else {
            setError('Google sign-in failed. Please try again.');
        }
    }
};


  // Render form steps dynamically
  const renderFormStep = () => {
    if (currentStep === 1) {
      return (
        <>
          {['username', 'email', 'password', 'confirmPassword'].map((field) => (
            <div className="form-group mb-2" key={field}>
              <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="form-control"
                placeholder={`Enter your ${field}`}
                required
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary w-100 mt-2">Next</button>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <div className="mb-2">
            <label className="form-label">Skills You Can Teach (Select Category):</label>
            <Select
              isMulti
              name="teachingCategories"
              options={skillCategories}
              classNamePrefix="select"
              onChange={setTeachingCategories}
            />
          </div>
          {teachingCategories.length > 0 && (
            <div className="mb-2">
              <label className="form-label">Skills to Teach:</label>
              <Select
                isMulti
                name="skillsToTeach"
                options={teachingCategories.flatMap(category =>
                  skillsData[category.value]?.map(skill => ({ value: skill, label: skill })) || []
                )}
                classNamePrefix="select"
                onChange={(options) => handleSelectChange(options, 'skillsToTeach')}
              />
            </div>
          )}
          <div className="mb-2">
            <label className="form-label">Skills You Want to Learn (Select Category):</label>
            <Select
              name="learningCategory"
              options={skillCategories}
              classNamePrefix="select"
              onChange={setLearningCategory}
            />
          </div>
          {learningCategory && (
            <div className="mb-2">
              <label className="form-label">Skills to Learn:</label>
              <Select
                isMulti
                name="skillsToLearn"
                options={skillsData[learningCategory.value]?.map(skill => ({ value: skill, label: skill })) || []}
                classNamePrefix="select"
                onChange={(options) => handleSelectChange(options, 'skillsToLearn')}
              />
            </div>
          )}
          <div className="mb-2">
            <label className="form-label">Teaching Skills Description:</label>
            <textarea
              name="teachingDescription"
              value={formData.skillsDescription.teaching}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                skillsDescription: { ...prev.skillsDescription, teaching: e.target.value }
              }))}
              className="form-control"
              placeholder="Describe your teaching skills"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Learning Skills Description:</label>
            <textarea
              name="learningDescription"
              value={formData.skillsDescription.learning}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                skillsDescription: { ...prev.skillsDescription, learning: e.target.value }
              }))}
              className="form-control"
              placeholder="Describe your learning interests"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Next</button>
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <>
          <div className="mb-2">
            <h5>Select Teaching Levels:</h5>
            {formData.skillsToTeach.map((skill, index) => (
              <div key={index} className="mb-1">
                <label>{skill}</label>
                <Select
                  options={skillLevels}
                  onChange={(option) => handleLevelChange(skill, option.value, 'teachingLevels')}
                />
              </div>
            ))}
          </div>
          <div className="mb-2">
            <h5>Select Learning Levels:</h5>
            {formData.skillsToLearn.map((skill, index) => (
              <div key={index} className="mb-1">
                <label>{skill}</label>
                <Select
                  options={skillLevels}
                  onChange={(option) => handleLevelChange(skill, option.value, 'learningLevels')}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Register</button>
        </>
      );
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-4">
        <div className="card p-4 shadow-sm">
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={currentStep === 3 ? handleSubmit : handleNextStep}>
            {renderFormStep()}
          </form>
          <div className="text-center mt-3">
            <p>or</p>
            <GoogleLogin
              onSuccess={handleGoogleSignUp}
              onError={() => setError('Google sign-in failed. Please try again.')}
            />
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
