const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/database');
const uuidv4 = require('uuid').v4;
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Users WHERE email = ? OR google_id = ?',
        [profile.emails[0].value, profile.id]
      );

      let user;
      if (rows.length > 0) {
        user = rows[0];
        // Update google_id if not set
        if (!user.google_id) {
          await pool.query(
            'UPDATE Users SET google_id = ? WHERE user_id = ?',
            [profile.id, user.user_id]
          );
        }
      } else {
        // Create new user
        const username = profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(-4);
        const userId = uuidv4();
        await pool.query(
          'INSERT INTO Users (user_id, username, email, full_name, google_id, avatar_url) VALUES (?,?,?,?,?,?)',
          [userId, username, profile.emails[0].value, profile.displayName, profile.id, profile.photos[0]?.value]
        );
        const [newUser] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
        user = newUser[0];
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Initialize passport
router.use(passport.initialize());

// Route to start Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback after Google authenticates
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user;
    
    // Update user's online status
    await pool.query(
      'UPDATE Users SET is_online = true WHERE user_id = ?',
      [user.user_id]
    );
    
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '5d' }
    );

    res.redirect(`${process.env.UI_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;

