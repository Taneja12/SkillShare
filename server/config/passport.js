const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_PEOPLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_PEOPLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],  // Request calendar access
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value,
      });
      await user.save();
    }

    user.accessToken = accessToken; // Store accessToken if needed
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));
