/**
 * Global Error Handler Middleware
 * Catches and processes all errors in Express
 */

const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error in development
  if (isDevelopment) {
    console.error('\n❌ Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    code = 'DUPLICATE_FIELD';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    code,
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = errorHandler;
