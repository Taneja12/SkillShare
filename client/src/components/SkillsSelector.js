import React, { useState } from 'react';
import skillsData from './skills'; // Adjust the path based on your folder structure

const SkillsSelector = ({ onSkillsSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [elaboration, setElaboration] = useState(''); // For skill elaboration
  const [level, setLevel] = useState(''); // For skill level

  const skillLevels = ['beginner', 'intermediate', 'expert']; // Valid levels

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSkill(''); // Reset selected skill when category changes
    setElaboration(''); // Reset elaboration
    setLevel(''); // Reset level
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
      // Create an object with the required skill details
      const skillObject = {
        skill: selectedSkill,
        elaboration, // Elaboration input value
        level, // Level input value
        category: selectedCategory, // Optionally include category
      };
  
      // Debugging - log the skillObject
      console.log('Adding skill:', skillObject);
  
      onSkillsSelect(skillObject); // Pass the selected skill object to the parent
      // Clear inputs
      setSelectedSkill('');
      setElaboration('');
      setLevel('');
      setSelectedCategory(''); // Reset category after adding skill
    }
  };
  

  return (
    <div className="skills-selector">
      <div className="form-group">
        <label htmlFor="skillCategory">Select Skill Category:</label>
        <select id="skillCategory" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          {Object.keys(skillsData).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="form-group">
          <label htmlFor="specificSkill">Select Specific Skill:</label>
          <select id="specificSkill" value={selectedSkill} onChange={handleSkillChange}>
            <option value="">Select a skill</option>
            {skillsData[selectedCategory].map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="elaboration">Elaboration:</label>
        <input
          type="text"
          id="elaboration"
          value={elaboration}
          onChange={handleElaborationChange}
          placeholder="Describe your skill"
        />
      </div>

      <div className="form-group">
        <label htmlFor="level">Level:</label>
        <select id="level" value={level} onChange={handleLevelChange}>
          <option value="">Select a level</option>
          {skillLevels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      <button onClick={handleAddSkill} disabled={!selectedSkill || !elaboration || !level}>
        Add Skill
      </button>
    </div>
  );
};

export default SkillsSelector;
