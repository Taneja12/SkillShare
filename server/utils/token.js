const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET, // Your JWT secret key
    { expiresIn: '30d' } // Token expiration time
  );
};

module.exports = generateToken;
