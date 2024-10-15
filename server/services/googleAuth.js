const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI  // Redirect URI from .env
);

// Generate Google OAuth URL with explicit redirect_uri
function generateAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI  // Ensure redirect_uri is included here
  });
}

// Exchange code for tokens
async function handleGoogleCallback(code) {
  const { tokens } = await oauth2Client.getToken({
    code,
    redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI  // Explicitly pass the redirect_uri here as well
  });
  oauth2Client.setCredentials(tokens);
  return tokens;
}

async function generateGoogleMeetLink(auth) {
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
        summary: 'Google Meet Meeting',
        description: 'Meeting created via the EcoSwap app',
        start: {
            dateTime: new Date().toISOString(), // Start time of the meeting
            timeZone: 'America/Los_Angeles',
        },
        end: {
            dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // End time (1 hour later)
            timeZone: 'America/Los_Angeles',
        },
        conferenceData: {
            createRequest: {
                requestId: 'some-random-string',
                conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                },
            },
        },
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
    });

    return response.data.hangoutLink; // Return the Google Meet link
}



module.exports = {
  generateAuthUrl,
  handleGoogleCallback,
  generateGoogleMeetLink
};
