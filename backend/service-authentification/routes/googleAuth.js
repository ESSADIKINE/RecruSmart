const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  googleAuthController.googleCallback
);

router.get('/google/failure', googleAuthController.googleFailure);

module.exports = router; 