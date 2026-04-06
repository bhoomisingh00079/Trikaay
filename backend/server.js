/**
 * Trikaay Backend API Server
 * Express + MongoDB + JWT Authentication
 * 
 * Features:
 * - Public API endpoints for frontend content
 * - Admin Dashboard with full CRUD operations
 * - JWT authentication with refresh tokens
 * - Rate limiting and security headers
 * - Encrypted contact data at rest
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import middleware
const { verifyToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import route handlers
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const mediaRoutes = require('./routes/media');

// Import existing routers for backward compatibility
const contactRouter = require('./routes/contact');
const subscribeRouter = require('./routes/subscribe');
const commentsRouter = require('./routes/comments');
const donateRouter = require('./routes/donate');
const automationRoutes = require('./routes/automation');
const { initializeGoogleAuth } = require('./utils/googleSheets');
const { initializeEmailService } = require('./utils/emailService');

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = CLIENT_URL.split(',').map((origin) => origin.trim());
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Validate required environment variables
const requiredEnvVars = {
  MONGO_URI: 'MongoDB connection URI',
  JWT_SECRET: 'JWT access token secret (64+ characters)',
  JWT_REFRESH_SECRET: 'JWT refresh token secret (64+ characters)',
  ENCRYPTION_KEY: 'Encryption key for sensitive data (must be exactly 32 characters)',
};

const missingVars = Object.entries(requiredEnvVars).filter(([key]) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(([key, description]) => {
    console.error(`   - ${key}: ${description}`);
  });
  console.error('\n📖 See SETUP_GUIDE.md for instructions on setting up environment variables');
  process.exit(1);
}

// Validate ENCRYPTION_KEY length
if (ENCRYPTION_KEY && ENCRYPTION_KEY.length !== 32) {
  console.error('❌ ENCRYPTION_KEY must be exactly 32 characters (got ' + ENCRYPTION_KEY.length + ')');
  process.exit(1);
}

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const isDevLocalhostOrigin =
        NODE_ENV !== 'production' &&
        typeof origin === 'string' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (!origin || ALLOWED_ORIGINS.includes(origin) || isDevLocalhostOrigin) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Compression
app.use(compression());

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rate limiting
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs (stricter for auth)
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters in production only.
// In development, hot reloads and local testing can easily trigger false 429 responses.
if (NODE_ENV === 'production') {
  app.use('/api/auth/', authLimiter);
  app.use('/api/', publicLimiter);
}

// ============================================
// ROUTES SETUP
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Public API routes (no auth required)
app.use('/api', publicRoutes);

// MongoDB-backed media routes
app.use('/api/media', mediaRoutes);

// Admin routes (JWT required)
app.use('/api/admin', verifyToken, adminRoutes);

// Backward compatibility: existing routes
app.use('/api/contact', contactRouter);
app.use('/api/subscribe', subscribeRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/donate', donateRouter);
app.use('/api/automation', automationRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================

async function startServer() {
  try {
    console.log('\n🚀 Starting Trikaay API Server...\n');

    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully\n');

    // Initialize volunteer certificate automation services
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.SPREADSHEET_ID;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    const automationEnabled = process.env.AUTOMATION_ENABLED === 'true';
    const automationMode = (process.env.AUTOMATION_MODE || 'webhook').toLowerCase();

    if (automationEnabled && spreadsheetId && emailUser && emailPassword && automationMode === 'webhook') {
      try {
        await initializeGoogleAuth();
        await initializeEmailService(emailUser, emailPassword);
        console.log('✅ Volunteer certificate automation is in webhook mode (runs only on sheets event trigger)\n');
      } catch (automationError) {
        console.warn('⚠ Volunteer automation not started:', automationError.message);
      }
    } else {
      console.warn(
        '⚠ Volunteer automation disabled (set AUTOMATION_ENABLED=true, AUTOMATION_MODE=webhook and configure GOOGLE_SHEET_ID/SPREADSHEET_ID + EMAIL_USER/EMAIL_PASSWORD)'
      );
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 CORS enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
      console.log(`📝 Environment: ${NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📍 SIGTERM received, shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;
