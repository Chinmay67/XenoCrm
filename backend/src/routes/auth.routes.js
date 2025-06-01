import express from 'express';
import passport from '../config/passport.js';
import { googleAuthCallback, getCurrentUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  googleAuthCallback
);

router.get('/me', getCurrentUser);

export default router;
