import React, { useState } from 'react';
import { registerUser, googleSignUpUser } from '../services/api'; 
import { useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import skillsData from './skills'; 
import { useAuth } from '../Contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; 
import loginImage from '../static/login.webp';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); 
  };

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

  const handleNextStep = (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (currentStep === 1) {
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setCurrentStep(2); 
    } else if (currentStep === 2) {
      if (!formData.skillsToTeach.length || !formData.skillsToLearn.length) {
        setError('You must select skills to teach and learn');
        return;
      }
      setCurrentStep(3); 
    }
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    const { skillsDescription, skillsToTeach, skillsToLearn, teachingLevels, learningLevels } = formData;

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
        level: teachingLevels[skill] || 'beginner', 
      })),
      skillsToLearn: skillsToLearn.map(skill => ({
        skill,
        elaboration: skillsDescription.learning || '',
        level: learningLevels[skill] || 'beginner', 
      })),
    };

    try {
      const response = await registerUser(formattedData);
      const { token } = response;
      if (token) {
        login(token); 
        alert('Registration successful');
        navigate('/'); 
      } else {
        alert('Registration successful, but no token received.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Error in registration. Please try again.';
      setError(errorMessage);
    }
  };

  const handleGoogleSignUp = async (response) => {
    try {
      const result = await googleSignUpUser({ token: response.credential });
      if (result && result.token) {
        login(result.token); 
        setFormData(prev => ({
          ...prev,
          username: result.userId, 
        }));
        setCurrentStep(2); 
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.message.includes("User already exists")) {
        setError('User already exists. Please log in.');
      } else if (error.message.includes("User not found")) {
        setError('No account found with this Google ID. Please sign up first.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  const renderFormStep = () => {
    if (currentStep === 1) {
      return (
        <>
          {/* Adjusting image size and margins */}
          <img
            src={loginImage}
            className="img-fluid"
            alt="Your Image"
            style={{
              width: '200px',   // Adjust width as needed
              height: 'auto',
              marginBottom: '20px',  // Adding margin below the image
              display: 'block',  // Centering the image horizontally
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
          {/* Form fields */}
          {['username', 'email', 'password', 'confirmPassword'].map((field) => (
            <div className="form-group mb-2" key={field}>
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
          {/* Next button */}
          <button type="submit" className="btn w-100 mt-2" style={{ backgroundColor:'#79a7ac'}}>Next</button>
        </>
      );
    }
    

    if (currentStep === 2) {
      return (
        <>
          <div className="mb-2">
            <Select
              isMulti
              name="teachingCategories"
              options={skillCategories}
              classNamePrefix="select"
              onChange={setTeachingCategories}
              placeholder="Skills You Can Teach (Select Category)"
            />
          </div>
          {teachingCategories.length > 0 && (
            <div className="mb-2">
              <Select
                isMulti
                name="skillsToTeach"
                options={teachingCategories.flatMap(category =>
                  skillsData[category.value]?.map(skill => ({ value: skill, label: skill })) || []
                )}
                classNamePrefix="select"
                onChange={(options) => handleSelectChange(options, 'skillsToTeach')}
                placeholder="Skills to Teach"
              />
            </div>
          )}
          <div className="mb-2">
            <Select
              name="learningCategory"
              options={skillCategories}
              classNamePrefix="select"
              onChange={setLearningCategory}
              placeholder="Skills You Want to Learn (Select Category)"
            />
          </div>
          {learningCategory && (
            <div className="mb-2">
              <Select
                isMulti
                name="skillsToLearn"
                options={skillsData[learningCategory.value]?.map(skill => ({ value: skill, label: skill })) || []}
                classNamePrefix="select"
                onChange={(options) => handleSelectChange(options, 'skillsToLearn')}
                placeholder="Skills to Learn"
              />
            </div>
          )}
          <div className="mb-2">
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
          <button type="submit" className="btn w-100 mt-2" style={{ backgroundColor:'#79a7ac'}}>Next</button>
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
                  placeholder="Select teaching level"
                  className="select-level"
                  classNamePrefix="select"
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
                  placeholder="Select learning level"
                  className="select-level"
                  classNamePrefix="select"
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn w-100 mt-2" style={{
             backgroundColor:'#79a7ac'}}>Submit</button>
        </>
      );
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        {/* Adjust the column size */}
        <div className="col-lg-4 col-md-8 col-sm-10">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="card-body">
              <h3 className="text-center">Register</h3>
              {error && <div className="alert alert-danger text-center">{error}</div>}
              
              {/* Form with steps */}
              <form onSubmit={currentStep < 3 ? handleNextStep : handleSubmit}>
                {renderFormStep()}
              </form>
              
              {/* Google sign-up button */}
              <div className="text-center mt-3">
                <GoogleLogin onSuccess={handleGoogleSignUp} />
              </div>
              
              {/* Link to login page */}
              <div className="text-center mt-2">
                <Link to="/login">Already have an account? Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Register;
