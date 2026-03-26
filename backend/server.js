/**
 * Volunteer Registration Backend
 * Express server for handling volunteer registrations
 * Integrates with Google Sheets and handles certificate automation
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import existing routers
const contactRouter = require('./routes/contact');
const subscribeRouter = require('./routes/subscribe');
const commentsRouter = require('./routes/comments');

// Import utility modules for volunteer feature
const googleSheets = require('./utils/googleSheets');
const emailService = require('./utils/emailService');
const automation = require('./utils/automation');

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * INPUT VALIDATION
 */

/**
 * Validate volunteer registration data
 * @param {Object} data - Data to validate
 * @returns {Object} - {valid: boolean, errors: array}
 */
function validateVolunteerData(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    // Phone validation
    if (!data.phone || !/^[\d\s+\-()]+$/.test(data.phone) || data.phone.length < 10) {
        errors.push('Phone must be a valid number with at least 10 digits');
    }

    // Email validation
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Email must be a valid email address');
    }

    // Position validation
    if (!data.position || typeof data.position !== 'string' || data.position.trim().length < 2) {
        errors.push('Position must be at least 2 characters');
    }

    // Experience optional but if provided must be string
    if (data.experience && typeof data.experience !== 'string') {
        errors.push('Experience must be a string');
    }

    // Availability validation
    const validAvailability = ['Full-time', 'Part-time', 'Weekend'];
    if (!data.availability || !validAvailability.includes(data.availability)) {
        errors.push('Availability must be one of: Full-time, Part-time, Weekend');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * ROUTES - Existing routes
 */
app.use('/api/contact', contactRouter);
app.use('/api/subscribe', subscribeRouter);
app.use('/api/comments', commentsRouter);

/**
 * ROUTES - Volunteer Registration
 */

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Volunteer registration system is running',
    });
});

/**
 * Register volunteer endpoint
 * POST /api/register-volunteer
 * Accepts volunteer registration data and stores in Google Sheets
 */
app.post('/api/register-volunteer', async (req, res) => {
    try {
        // Validate input
        const validation = validateVolunteerData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors,
            });
        }

        // Check Google Sheets ID is configured
        if (!SPREADSHEET_ID) {
            console.error('✗ SPREADSHEET_ID not configured in environment');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error',
            });
        }

        // Append to Google Sheets
        await googleSheets.appendVolunteerToSheet(SPREADSHEET_ID, req.body);

        // Send registration confirmation email (non-blocking)
        emailService.sendRegistrationConfirmation(req.body.email, req.body.name).catch((error) => {
            console.warn('Warning: Could not send confirmation email:', error.message);
        });

        console.log(`✓ Volunteer registered: ${req.body.name} (${req.body.email})`);

        return res.status(201).json({
            success: true,
            message: 'Registration successful! We will review your application and contact you.',
        });
    } catch (error) {
        console.error('✗ Registration endpoint error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration',
            error: error.message,
        });
    }
});

/**
 * Get registration status endpoint
 * GET /api/registrations/count
 * Returns count of registrations
 */
app.get('/api/registrations/count', async (req, res) => {
    try {
        if (!SPREADSHEET_ID) {
            return res.status(500).json({
                success: false,
                message: 'Spreadsheet not configured',
            });
        }

        const rows = await googleSheets.getAllRows(SPREADSHEET_ID);
        const count = Math.max(0, rows.length - 1); // Subtract header row

        return res.json({
            success: true,
            count: count,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('✗ Count endpoint error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving registration count',
        });
    }
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
    });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
    console.error('✗ Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

/**
 * SERVER INITIALIZATION
 */

async function initializeServer() {
    try {
        console.log('\n🚀 Initializing Volunteer Registration System...\n');

        // Initialize Google Sheets
        console.log('📊 Initializing Google Sheets...');
        await googleSheets.initializeGoogleAuth();

        // Initialize Email Service
        console.log('📧 Initializing Email Service...');
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        if (!emailUser || !emailPassword) {
            console.warn('⚠ Email credentials not configured - email functionality disabled');
        } else {
            await emailService.initializeEmailService(emailUser, emailPassword);
        }

        // Check Spreadsheet ID
        if (!SPREADSHEET_ID) {
            console.error('✗ SPREADSHEET_ID is required in .env file');
            process.exit(1);
        }

        // Start automation process
        console.log('🤖 Starting automation process...');
        automation.startAutomation(SPREADSHEET_ID, 10000); // Run every 10 seconds

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n✅ Server is running on http://localhost:${PORT}`);
            console.log(`📝 Register: POST http://localhost:${PORT}/api/register-volunteer`);
            console.log(`📊 Health: GET http://localhost:${PORT}/api/health`);
            console.log(`📈 Count: GET http://localhost:${PORT}/api/registrations/count\n`);
        });
    } catch (error) {
        console.error('✗ Failed to initialize server:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹ Shutting down gracefully...');
    automation.stopAutomation();
    process.exit(0);
});

// Start the server
initializeServer();

module.exports = app;
