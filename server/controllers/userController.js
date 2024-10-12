const User = require('../models/User');

const matchUsers = async (req, res) => {
  try {
    const userId = req.params.id; // Current user ID

    // Fetch current user data
    const currentUser = await User.findById(userId).select(
      'username skillsToTeach skillsToLearn email phoneNumber profilePicture'
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
      'username skillsToTeach skillsToLearn email phoneNumber profilePicture'
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
            matchScore,
          };
        }
        return null;
      })
      .filter((match) => match !== null)
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by matchScore

    // Prepare the response
    const response = {
      currentUser: {
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        skillsToTeach: currentUser.skillsToTeach,
        skillsToLearn: currentUser.skillsToLearn,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
      },
      matchedUsers,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error });
  }
};

module.exports = { matchUsers };
