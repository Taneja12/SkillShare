// utils/auth.js
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json'); // Path to save token

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

// Load the token from file (if it exists)
function loadToken() {
    try {
        const token = fs.readFileSync(TOKEN_PATH);
        oauth2Client.setCredentials(JSON.parse(token));
    } catch (error) {
        console.error('Token not found. Run the auth script.');
        throw error; // Make sure to throw error if token not found
    }
}

// Save the token to a file
function saveToken(token) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

// Export the OAuth2 client and token functions
module.exports = {
    oauth2Client,
    loadToken,
    saveToken,
};
