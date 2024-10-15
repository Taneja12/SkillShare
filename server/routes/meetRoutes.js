const express = require('express');
const { generateAuthUrl, handleGoogleCallback, generateGoogleMeetLink } = require('../services/googleAuth');
const router = express.Router();
const { google } = require('googleapis'); 

// Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

// Step 1: Redirect to Google OAuth
router.get('/google/auth', (req, res) => {
  const url = generateAuthUrl();
  res.redirect(url);
});

// Step 2: Handle Google OAuth callback
router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in session or database as needed
    // You can save the refresh_token to the user's profile if required
    console.log('Tokens received:', tokens);

    // Generate the Google Meet link
    const meetLink = await generateGoogleMeetLink(oauth2Client);

    // Send the meet link back as JSON
    res.json({ meetLink });
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    res.status(500).json({ error: 'Failed to generate Google Meet link' });
  }
});

// Step 3: Create Google Meet link (Optional Endpoint)
router.post('/google/create-meet', async (req, res) => {
  const { tokens } = req.body; // Tokens passed from the frontend

  try {
    // Ensure oauth2Client is set with valid tokens
    oauth2Client.setCredentials(tokens); // Use the tokens from the request body

    const meetLink = await generateGoogleMeetLink(oauth2Client);
    res.json({ meetLink });
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    res.status(500).json({ error: 'Failed to create Google Meet link' });
  }
});

module.exports = router;
