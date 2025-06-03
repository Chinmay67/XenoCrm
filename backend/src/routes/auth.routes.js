import express from 'express';
import passport from '../config/passport.js';
import { googleAuthCallback, getCurrentUser, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Remove /api prefix since it's added in app.js
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  googleAuthCallback
);

router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
