const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

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
  async (req, res) => {
    try {
      // Extract tokens and user info from the user object
      const { accessToken, refreshToken, email, id } = req.user;
      
      // Create JWT token for authenticated routes
      const token = jwt.sign({ id: id }, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Log tokens and userId for debugging
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
      console.log('User ID:', id);
      console.log('JWT Token:', token);
      
      // Redirect to index.html with all tokens
      res.redirect(
        `/index.html?accessToken=${accessToken}&refreshToken=${refreshToken}&email=${email}&userId=${id}&token=${token}`
      );
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('/login');
    }
  }
);

// Add new signup route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const newUser = new User({ email, password });
        await newUser.save();
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'your_jwt_secret');
        res.status(201).json({
            token,
            email: newUser.email,
            userId: newUser.id,
            userName: newUser.userName
        });
    } catch (error) {
        res.status(400).send('Error creating user: ' + error.message);
    }
});

// Add new login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret');
        res.json({
            token,
            email: user.email,
            userId: user.id,
            userName: user.userName
        });
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});

module.exports = router;


