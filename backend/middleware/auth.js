/**
 * JWT Authentication Middleware
 * Verifies access tokens and handles token expiration
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters long');
}

/**
 * Middleware to verify JWT access token
 * Expects: Authorization: Bearer <token>
 * Returns: 401 with code: 'TOKEN_EXPIRED' if token expired
 * Returns: 401 with code: 'UNAUTHORIZED' if token missing or invalid
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt,
        });
      }

      return res.status(401).json({
        error: 'Invalid token',
        code: 'UNAUTHORIZED',
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: 'Token verification failed',
      code: 'UNAUTHORIZED',
    });
  }
};

/**
 * Middleware to verify admin role
 * Must be used after verifyToken
 */
const verifyAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Insufficient permissions',
      code: 'FORBIDDEN',
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdminRole,
};
