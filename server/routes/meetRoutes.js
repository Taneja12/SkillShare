const express = require('express');
const { generateAuthUrl, handleGoogleCallback, generateGoogleMeetLink  } = require('../services/googleAuth');
const router = express.Router();
const { google } = require('googleapis'); 

// Step 1: Redirect to Google OAuth
router.get('/google/auth', (req, res) => {
  const url = generateAuthUrl();
  res.redirect(url);
});
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

// Step 2: Handle Google OAuth callback
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
  
    try {
      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
  
      // Generate the Google Meet link
      const meetLink = await generateGoogleMeetLink(oauth2Client);
  
      // Send the meet link back as JSON
      res.json({ meetLink });
    } catch (error) {
      console.error('Error during Google OAuth callback:', error);
      res.status(500).json({ error: 'Failed to generate Google Meet link' });
    }
  });
  
  

// Step 3: Create Google Meet link
router.post('/google/create-meet', async (req, res) => {
  const { tokens } = req.body;  // Tokens are passed from the frontend
  try {
    const meetLink = await createMeetLink(tokens);
    res.json({ meetLink });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Google Meet link' });
  }
});

module.exports = router;
