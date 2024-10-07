const User = require('../models/User');

// Function to match users based on skills
const matchUsers = async (req, res) => {
    try {
        const userId = req.params.id; // Get the current user ID from the request params

        // Fetch the current user's data including additional fields
        const currentUser = await User.findById(userId).select('username skillsToLearn skillsToTeach email phoneNumber'); // Add any other fields you want

        // Check if user exists
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Log current user's skills to learn
        console.log("Current User Skills to Learn:", currentUser.skillsToLearn);

        // Create arrays of skills to teach and learn for the current user
        const skillsToTeachArray = currentUser.skillsToTeach.map(skillObj => skillObj.skill);
        const skillsToLearnArray = currentUser.skillsToLearn.map(skillObj => skillObj.skill);

        // Find matches based on skills to teach and skills to learn
        const matches = await User.find({
            _id: { $ne: userId }, // Exclude the current user
            $or: [
                { skillsToTeach: { $elemMatch: { skill: { $in: skillsToLearnArray } } } }, // Match teaching skills of others to current user's learning skills
                { skillsToLearn: { $elemMatch: { skill: { $in: skillsToTeachArray } } } } // Match learning skills of others to current user's teaching skills
            ]
        }).select('username skillsToTeach skillsToLearn email phoneNumber'); // Select fields you want to return

        // Log the matches found
        console.log("Matched Users:", matches);

        // Prepare the response with current user's information and matched users
        const response = {
            currentUser: {
                username: currentUser.username,
                skillsToTeach: currentUser.skillsToTeach,
                skillsToLearn: currentUser.skillsToLearn,
                email: currentUser.email, // Include additional fields as needed
                phoneNumber: currentUser.phoneNumber,
            },
            matchedUsers: matches, // Return matched users
        };

        res.status(200).json(response); // Return matched users along with current user info
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: "Error fetching matches", error });
    }
};

module.exports = { matchUsers };
