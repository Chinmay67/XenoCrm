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
  try {
    if (!req.user) {
      return res.redirect(`${config.frontend_url}/login?error=auth_failed`);
    }

    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      config.jwt_secret,
      { expiresIn: '7d' }
    );

    // Set cookie and redirect
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(config.frontend_url);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${config.frontend_url}/login?error=server_error`);
  }
};

// Endpoint to get current user info by verifying JWT
export const getCurrentUser = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    res.json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    });
  } catch (error) {
    res.clearCookie('token');
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
    })
    .json({ message: 'Logged out successfully' });
};
