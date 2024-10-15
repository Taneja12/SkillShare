const { google } = require('googleapis');
const { OAuth2 } = google.auth;

// Configuration for Google Login
const loginClient = new OAuth2(
  process.env.GOOGLE_PERSON_CLIENT_ID,       // Web Client 2 ID
  process.env.GOOGLE_PERSON_CLIENT_SECRET,   // Web Client 2 Secret
  process.env.GOOGLE_CALENDAR_REDIRECT_URI         // Redirect URI for login
);

// Configuration for Google Meet
const meetClient = new OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,      // Deepanshu Taneja Client ID
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,   // Deepanshu Taneja Secret
  process.env.GOOGLE_CALENDAR_REDIRECT_URI         // Redirect URI for Meet creation
);

module.exports = {
  loginClient,
  meetClient,
};
