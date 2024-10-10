const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the Authorization header from the request
    const authHeader = req.header('Authorization');
  
    // Check if the header is missing
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '');
  
    // Check if the token is empty after replacing
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
  
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId }; // Assuming the decoded token contains a userId
        next();
    } catch (error) {
        console.error('Token verification failed:', error); 
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
