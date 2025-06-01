import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    config.jwt_secret,
    { expiresIn: '7d' }
  );
};

// Called after successful Google OAuth
export const googleAuthCallback = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  const token = generateToken(req.user);

  // Send token as HTTP-only cookie or in response body
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .redirect(config.frontend_url || 'http://localhost:3000');
};

// Endpoint to get current user info by verifying JWT
export const getCurrentUser = (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = jwt.verify(token, config.jwt_secret);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
