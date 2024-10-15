import React, { useState } from 'react';
import skillsData from './skills'; // Adjust the path based on your folder structure
import { Form, Button, Alert, Fade } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is included

const SkillsSelector = ({ onSkillsSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [elaboration, setElaboration] = useState('');
  const [level, setLevel] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  const skillLevels = ['beginner', 'intermediate', 'expert'];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSkill('');
    setElaboration('');
    setLevel('');
  };

  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
  };

  const handleElaborationChange = (e) => {
    setElaboration(e.target.value);
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };

  const handleAddSkill = () => {
    if (selectedSkill && elaboration && level) {
      const skillObject = {
        skill: selectedSkill,
        elaboration,
        level,
        category: selectedCategory,
      };

      // console.log('Adding skill:', skillObject);
      onSkillsSelect(skillObject);
      setShowAlert(false); // Show success alert
      setFadeIn(true); // Reset fade for animation

      // Clear inputs
      setSelectedSkill('');
      setElaboration('');
      setLevel('');
      setSelectedCategory('');
    }
  };

  return (
    <div className="skills-selector">
      <Form>
        <Form.Group controlId="skillCategory">
          <Form.Label>Select Skill Category:</Form.Label>
          <Form.Control as="select" value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select a category</option>
            {Object.keys(skillsData).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Control>
        </Form.Group>

        {selectedCategory && (
          <Form.Group controlId="specificSkill">
            <Form.Label>Select Specific Skill:</Form.Label>
            <Form.Control as="select" value={selectedSkill} onChange={handleSkillChange}>
              <option value="">Select a skill</option>
              {skillsData[selectedCategory].map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </Form.Control>
          </Form.Group>
        )}

        <Form.Group controlId="elaboration">
          <Form.Label>Elaboration:</Form.Label>
          <Form.Control
            type="text"
            value={elaboration}
            onChange={handleElaborationChange}
            placeholder="Describe your skill"
          />
        </Form.Group>

        <Form.Group controlId="level">
          <Form.Label>Level:</Form.Label>
          <Form.Control as="select" value={level} onChange={handleLevelChange}>
            <option value="">Select a level</option>
            {skillLevels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Fade in={fadeIn}>
          <Button
            variant="primary"
            onClick={handleAddSkill}
            disabled={!selectedSkill || !elaboration || !level}
            onMouseEnter={() => setFadeIn(false)} // Reset fade on hover
          >
            Add Skill
          </Button>
        </Fade>

        
      </Form>
    </div>
  );
};

export default SkillsSelector;
