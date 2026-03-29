/**
 * Authentication Routes
 * POST /api/auth/login - Login with email and password
 * POST /api/auth/refresh - Refresh access token using refresh cookie
 * POST /api/auth/logout - Logout and clear refresh cookie
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const AdminUser = require('../models/AdminUser');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Validate JWT secrets are set
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}

/**
 * POST /api/auth/login
 * Login endpoint - returns access token + sets refresh token cookie
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .customSanitizer((value) => value.trim().toLowerCase()),
    body('password').isLength({ min: 1 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find admin user
      const admin = await AdminUser.findOne({ email });
      if (!admin) {
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: admin._id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return access token
      res.json({
        accessToken,
        user: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh endpoint - uses refresh token cookie to issue new access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token provided',
        code: 'UNAUTHORIZED',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      // Verify admin still exists
      const admin = await AdminUser.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({
          error: 'Admin user not found',
          code: 'UNAUTHORIZED',
        });
      }

      // Issue new access token
      const newAccessToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({
        accessToken: newAccessToken,
        user: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
      }

      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'UNAUTHORIZED',
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint - clears refresh token cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({
    message: 'Logged out successfully',
  });
});

module.exports = router;
