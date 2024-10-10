const User = require('../models/User');

const matchUsers = async (req, res) => {
  try {
    const userId = req.params.id; // Get the current user ID from the request params

    // Fetch the current user's data including profile picture, skills to teach, and skills to learn
    const currentUser = await User.findById(userId).select('username skillsToLearn skillsToTeach email phoneNumber profilePicture'); // Include profilePicture

    // Check if the user exists
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create arrays of skills to teach and learn for the current user
    const skillsToTeachArray = currentUser.skillsToTeach.map(skillObj => skillObj.skill);
    const skillsToLearnArray = currentUser.skillsToLearn.map(skillObj => skillObj.skill);

    // Find matches based on both conditions:
    // 1. Match teaching skills of others to current user's learning skills.
    // 2. Match learning skills of others to current user's teaching skills.
    const matches = await User.find({
      _id: { $ne: userId }, // Exclude the current user
      $or: [
        { skillsToTeach: { $elemMatch: { skill: { $in: skillsToLearnArray } } } }, // Teaching skill matches learning skill
        { skillsToLearn: { $elemMatch: { skill: { $in: skillsToTeachArray } } } }  // Learning skill matches teaching skill
      ]
    }).select('username skillsToTeach skillsToLearn email phoneNumber profilePicture'); // Include profilePicture for matched users

    // Filter the matches to ensure only valid matches (based on both users' choices)
    const validMatches = matches.filter(match => {
      const matchedTeachingSkills = match.skillsToTeach.filter(skillObj => skillsToLearnArray.includes(skillObj.skill));
      const matchedLearningSkills = match.skillsToLearn.filter(skillObj => skillsToTeachArray.includes(skillObj.skill));

      // Ensure both conditions are met: teach/learn match for both users
      return (matchedTeachingSkills.length > 0 && matchedLearningSkills.length > 0);
    });

    // Prepare the response with current user's information and valid matched users
    const response = {
      currentUser: {
        username: currentUser.username,
        profilePicture: currentUser.profilePicture, // Include profile picture in the response
        skillsToTeach: currentUser.skillsToTeach,
        skillsToLearn: currentUser.skillsToLearn,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
      },
      matchedUsers: validMatches.map(user => ({
        userId: user._id,
        username: user.username,
        profilePicture: user.profilePicture, // Include profile picture for each matched user
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        email: user.email,
        phoneNumber: user.phoneNumber,
      })),
    };

    res.status(200).json(response); // Return matched users along with current user info
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: "Error fetching matches", error });
  }
};

module.exports = { matchUsers };
