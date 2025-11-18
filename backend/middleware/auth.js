import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header in request:', req.method, req.path);
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('❌ Invalid authorization header format:', req.method, req.path);
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = parts[1].trim();
    
    if (!token) {
      console.log('❌ Empty token in authorization header:', req.method, req.path);
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found for token:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (verifyError) {
      if (verifyError.name === 'JsonWebTokenError') {
        console.log('❌ JWT verification failed - invalid token:', verifyError.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (verifyError.name === 'TokenExpiredError') {
        console.log('❌ JWT verification failed - token expired');
        return res.status(401).json({ message: 'Token expired' });
      }
      throw verifyError;
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error.name, error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

