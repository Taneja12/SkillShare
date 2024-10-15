import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { registerUser } from '../services/api'; 
import skillsData from './skills'; // Skills data stored here
import { useAuth } from '../Contexts/AuthContext';

const skillCategories = Object.keys(skillsData).map(category => ({
  value: category,
  label: category,
}));

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const RegistrationSteps = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ...location.state.formData,
    skillsToTeach: [],
    skillsToLearn: [],
    skillsDescription: { teaching: '', learning: '' },
    teachingLevels: {},
    learningLevels: {},
  });

  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(2);
  const [teachingCategories, setTeachingCategories] = useState([]);
  const [learningCategory, setLearningCategory] = useState(null);

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
    if (!formData.skillsToTeach.length || !formData.skillsToLearn.length) {
      setError('You must select skills to teach and learn');
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const commonSkills = formData.skillsToTeach.filter(skill => formData.skillsToLearn.includes(skill));
    if (commonSkills.length > 0) {
      setError('You cannot select the same skill for both teaching and learning');
      return;
    }

    const formattedData = {
      ...formData,
      skillsToTeach: formData.skillsToTeach.map(skill => ({
        skill,
        elaboration: formData.skillsDescription.teaching || '',
        level: formData.teachingLevels[skill] || 'beginner',
      })),
      skillsToLearn: formData.skillsToLearn.map(skill => ({
        skill,
        elaboration: formData.skillsDescription.learning || '',
        desiredLevel: formData.learningLevels[skill] || 'beginner',
      })),
    };

    try {
      const response = await registerUser(formattedData);
      const { token } = response;
      if (token) {
        login(token);
        navigate('/');
      } else {
        alert('Registration successful, but no token received.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Error in registration. Please try again.');
    }
  };

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      {currentStep === 2 && (
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

          <button onClick={handleNextStep} className="btn btn-primary">Next</button>
        </>
      )}

      {currentStep === 3 && (
        <>
          {/* Step 3 - Skill Levels */}
          <h5>Assign Levels to Skills</h5>

          <div className="mb-2">
            <h6>Teaching Skills:</h6>
            {formData.skillsToTeach.map(skill => (
              <div key={skill}>
                <label>{skill}</label>
                <Select
                  name={`${skill}-level`}
                  options={skillLevels}
                  classNamePrefix="select"
                  onChange={level => handleLevelChange(skill, level.value, 'teachingLevels')}
                />
              </div>
            ))}
          </div>

          <div className="mb-2">
            <h6>Learning Skills:</h6>
            {formData.skillsToLearn.map(skill => (
              <div key={skill}>
                <label>{skill}</label>
                <Select
                  name={`${skill}-level`}
                  options={skillLevels}
                  classNamePrefix="select"
                  onChange={level => handleLevelChange(skill, level.value, 'learningLevels')}
                />
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} className="btn btn-success mt-2">Submit</button>
        </>
      )}
    </div>
  );
};

export default RegistrationSteps;
