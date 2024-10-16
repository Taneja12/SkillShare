// matchRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Route to get matched users by user ID
router.get('/match/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Current user ID

    // Fetch current user data
    const currentUser = await User.findById(userId).select(
      'username skillsToTeach skillsToLearn email phoneNumber profilePicture tokens'
    );

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create arrays of skills and levels
    const currentTeachSkills = currentUser.skillsToTeach;
    const currentLearnSkills = currentUser.skillsToLearn;

    // Find potential matches
    const potentialMatches = await User.find({
      _id: { $ne: userId }, // Exclude current user
      'skillsToTeach.skill': { $in: currentLearnSkills.map((s) => s.skill) },
      'skillsToLearn.skill': { $in: currentTeachSkills.map((s) => s.skill) },
    }).select(
      'username skillsToTeach skillsToLearn email phoneNumber profilePicture tokens'
    );

    // Helper function to compare skill levels
    const levelToNumber = (level) => {
      const levels = { beginner: 1, intermediate: 2, expert: 3 };
      return levels[level] || 0;
    };

    // Filter and score matches
    const matchedUsers = potentialMatches
      .map((match) => {
        let matchScore = 0;
        let canTeach = false;
        let canLearn = false;

        // Check if match can teach current user
        for (let learnSkill of currentLearnSkills) {
          const matchTeachSkill = match.skillsToTeach.find(
            (s) => s.skill === learnSkill.skill
          );
          if (
            matchTeachSkill &&
            levelToNumber(matchTeachSkill.level) >= levelToNumber(learnSkill.desiredLevel)
          ) {
            canTeach = true;
            matchScore += 1; // Increase score for each valid teaching skill
          }
        }

        // Check if match can learn from current user
        for (let teachSkill of currentTeachSkills) {
          const matchLearnSkill = match.skillsToLearn.find(
            (s) => s.skill === teachSkill.skill
          );
          if (
            matchLearnSkill &&
            levelToNumber(teachSkill.level) >= levelToNumber(matchLearnSkill.desiredLevel)
          ) {
            canLearn = true;
            matchScore += 1; // Increase score for each valid learning skill
          }
        }

        if (canTeach && canLearn) {
          return {
            userId: match._id,
            username: match.username,
            profilePicture: match.profilePicture,
            skillsToTeach: match.skillsToTeach,
            skillsToLearn: match.skillsToLearn,
            email: match.email,
            phoneNumber: match.phoneNumber,
            matchScore
          };
        }
        return null;
      })
      .filter((match) => match !== null)
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by matchScore

    // Prepare the response
    const response = {
      currentUser: {
        userId:currentUser._id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        skillsToTeach: currentUser.skillsToTeach,
        skillsToLearn: currentUser.skillsToLearn,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        tokens:currentUser.tokens,
      },
      matchedUsers,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error });
  }
});


const validSkillLevels = ['beginner', 'intermediate', 'expert'];

router.put('/users/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const { skillsToTeach, skillsToLearn } = req.body;
  console.log({ skillsToTeach, skillsToLearn });
  try {
    // Validate skill levels on the server side
    const validateSkills = (skills, field) => {
      if (skills && Array.isArray(skills)) {
        for (const skill of skills) {
          if (!validSkillLevels.includes(skill[field])) {
            return false;
          }
        }
      }
      return true;
    };

    if (!validateSkills(skillsToTeach, 'level') || !validateSkills(skillsToLearn, 'level')) {
      return res.status(400).json({ message: 'Invalid skill level or desired level' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the skills based on what's sent in the request body
    if (skillsToTeach) {
      user.skillsToTeach = skillsToTeach;
    }
    if (skillsToLearn) {
      // console.log('Hello');
      user.skillsToLearn = skillsToLearn;
    }

    // Save the updated user document
    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/fetch-gemini', async (req, res) => {
  const { prompt } = req.body; // Get prompt from request body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response); // Log response for debugging
    res.json({ text: result.response.text() }); // Send the response text back to the frontend
  } catch (err) {
    console.error('Error fetching data from Gemini model:', err);
    res.status(500).json({ error: 'Failed to fetch data from the Gemini model' });
  }
});


// Update verification status of a teaching skill
router.put('/verify-teaching-skill', async (req, res) => {
    const { userId, skill } = req.body;
    console.log({ userId, skill });
    try {
        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the skill in the skillsToTeach array
        const skillToTeach = user.skillsToTeach.find(item => item.skill === skill);

        if (!skillToTeach) {
            return res.status(404).json({ message: 'Skill not found in teaching skills' });
        }

        // Update the verified_status
        skillToTeach.verified_status = 'verified';

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Teaching skill verification status updated successfully' });
    } catch (error) {
        console.error('Error updating verification status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to add tokens to a user
router.put('/add-tokens', async (req, res) => {
  const { userId, tokens } = req.body;
  console.log({userId, tokens});

  try {
    // Find the user by userId and increment their token count by the provided tokens amount
    await User.findByIdAndUpdate(userId, { $inc: { tokens: tokens } });
    res.status(200).json({ message: 'Tokens added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add tokens' });
  }
});




module.exports = router;
