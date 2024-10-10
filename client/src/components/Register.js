import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import skillsData from './skills';
import { useAuth } from '../Contexts/AuthContext';

// Convert skillsData into options for React Select
const skillCategories = Object.keys(skillsData).map(category => ({
  value: category,
  label: category,
}));

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
  });
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [teachingCategories, setTeachingCategories] = useState([]);
  const [learningCategory, setLearningCategory] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOptions, fieldName) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, [fieldName]: values }));
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
    } else {
      setCurrentStep(3);
    }
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset previous error
    
    const { skillsDescription, skillsToTeach, skillsToLearn } = formData;
  
    // Check if there are any common skills between "Skills to Teach" and "Skills to Learn"
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
      })),
      skillsToLearn: skillsToLearn.map(skill => ({
        skill,
        elaboration: skillsDescription.learning || '',
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
  
      // Check if the error is from the backend
      const errorMessage = error.message || 'Error in registration. Please try again.';
      
      // Set the error message to be displayed
      setError(errorMessage); 
  
      // Log the detailed error message for debugging
      console.error('Detailed error:', error.response?.data);
    }
  };
  
  
  const renderFormStep = () => {
    if (currentStep === 1) {
      return (
        <>
          {['username', 'email', 'password', 'confirmPassword'].map((field) => (
            <div className="form-group mb-2" key={field}>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="form-control"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
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
            <label className="form-label">Skills You Can Teach:</label>
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
            <label className="form-label">Skills You Want to Learn:</label>
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
              placeholder="Describe your learning skills"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Next</button>
        </>
      );
    }

    return (
      <>
        <h5>Skills to Teach:</h5>
        {formData.skillsToTeach.length > 0 ? (
          <ul>
            {formData.skillsToTeach.map((skill, index) => <li key={index}>{skill}</li>)}
          </ul>
        ) : (
          <p>No skills selected.</p>
        )}

        <h5>Skills to Learn:</h5>
        {formData.skillsToLearn.length > 0 ? (
          <ul>
            {formData.skillsToLearn.map((skill, index) => <li key={index}>{skill}</li>)}
          </ul>
        ) : (
          <p>No skills selected.</p>
        )}

        <div className="d-flex justify-content-between mt-3">
          <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(2)}>Previous</button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Register</button>
        </div>
      </>
    );
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6">
        <div className="card p-4 shadow-sm">
          <h2 className="text-center mb-4">Register - Step {currentStep}</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleNextStep}>
            {renderFormStep()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
