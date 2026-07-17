/**
 * Public API Routes
 * GET endpoints - fetch public data
 * POST endpoints - form submissions
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const TeamMember = require('../models/TeamMember');
const Project = require('../models/Project');
const SiteSettings = require('../models/SiteSettings');
const { initializeGoogleAuth, appendVolunteerToSheet } = require('../utils/googleSheets');
const { cacheControl, noCacheControl, CACHE_DURATIONS } = require('../middleware/cacheControl');

const router = express.Router();
let isGoogleAuthInitialized = false;

/**
 * GET /api/team
 * Get all visible team members (cached 5 minutes)
 */
router.get('/team', cacheControl(CACHE_DURATIONS.API_GENERAL), async (req, res, next) => {
  try {
    const team = await TeamMember.find({ isVisible: true }).sort({ order: 1 });
    res.json(team);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects
 * Get all visible projects
 */
router.get('/projects', noCacheControl, async (req, res, next) => {
  try {
    const projects = await Project.find({ isVisible: true }).sort({ projectNumber: 1, order: 1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/site-settings
 * Get public site settings (contact + social links)
 */
router.get('/site-settings', noCacheControl, async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSingleton();

    res.json({
      contactPhone: settings.contactPhone || '',
      contactEmail: settings.contactEmail || '',
      contactAddress: settings.contactAddress || '',
      contactAddressSwapnalaya: settings.contactAddressSwapnalaya || '',
      socialLinks: settings.socialLinks || {},
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/register-volunteer
 * Submit volunteer registration to Google Sheets
 */
router.post(
  '/register-volunteer',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('position').trim().isLength({ min: 2 }).withMessage('Position is required'),
    body('experience').optional({ checkFalsy: true }).trim(),
    body('availability').trim().isLength({ min: 2 }).withMessage('Availability is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          details: errors.array(),
        });
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.SPREADSHEET_ID;
      if (!spreadsheetId) {
        return res.status(500).json({
          success: false,
          message: 'Google Sheet is not configured',
        });
      }

      if (!isGoogleAuthInitialized) {
        await initializeGoogleAuth();
        isGoogleAuthInitialized = true;
      }

      const volunteerData = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        position: req.body.position,
        experience: req.body.experience || '',
        availability: req.body.availability,
      };

      await appendVolunteerToSheet(spreadsheetId, volunteerData);

      return res.status(201).json({
        success: true,
        message: 'Volunteer registration submitted successfully',
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
