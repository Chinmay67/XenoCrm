import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import apiError from '../utils/apiError.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      throw new apiError(401, 'Authentication required');
    }

    try {
      const decoded = jwt.verify(token, config.jwt_secret);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        res.clearCookie('token');
        throw new apiError(401, 'Token expired');
      }
      throw new apiError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};