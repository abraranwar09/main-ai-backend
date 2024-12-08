const express = require('express');
const passport = require('passport');

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile', 
    'email', 
    'https://www.googleapis.com/auth/calendar', 
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Extract tokens and userId from the user object
    const { accessToken, refreshToken, email, id } = req.user;
    
    // Log tokens and userId for debugging
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('User ID:', id);
    
    // Redirect to index.html with tokens and userId as query parameters
    res.redirect(`/index.html?accessToken=${accessToken}&refreshToken=${refreshToken}&email=${email}&userId=${id}`);
  }
);

module.exports = router;
