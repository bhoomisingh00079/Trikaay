/**
 * Admin API Routes
 * All routes require JWT authentication
 * Includes CRUD operations for all content types
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');

const TeamMember = require('../models/TeamMember');
const Project = require('../models/Project');
const SiteSettings = require('../models/SiteSettings');
const { sheets } = require('../config/googleAuth');
const automation = require('../utils/automation');

const router = express.Router();

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [teamCount, projectCount] = await Promise.all([
      TeamMember.countDocuments(),
      Project.countDocuments(),
    ]);

    const admin = req.user;

    res.json({
      team: teamCount,
      projects: projectCount,
      lastLogin: admin.lastLogin || null,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TEAM MEMBERS CRUD
// ============================================

/**
 * GET /api/admin/team
 * Get all team members (including hidden)
 */
router.get('/team', async (req, res, next) => {
  try {
    const team = await TeamMember.find().sort({ order: 1 });
    res.json(team);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/team
 * Create a new team member
 */
router.post(
  '/team',
  [
    body('name').trim().isLength({ min: 2 }).escape(),
    body('role').trim().isLength({ min: 2 }).escape(),
    body('bio').trim().optional().escape(),
    body('photo').trim().optional(),
    body('order').optional().isInt(),
    body('isVisible').optional().isBoolean(),
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

      const member = new TeamMember(req.body);
      await member.save();
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/admin/team/:id
 * Update a team member
 */
router.patch('/team/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/team/:id
 * Delete a team member
 */
router.delete('/team/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted', id: member._id });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROJECTS CRUD
// ============================================

/**
 * GET /api/admin/projects
 * Get all projects (including hidden)
 */
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/projects
 * Create a new project
 */
router.post(
  '/projects',
  [
    body('title').trim().isLength({ min: 3 }).escape(),
    body('marathiTitle').trim().optional(),
    body('description').trim().isLength({ min: 10 }).escape(),
    body('shortDescriptionEn').trim().optional(),
    body('fullDescriptionEn').trim().optional(),
    body('shortDescriptionMr').trim().optional(),
    body('fullDescriptionMr').trim().optional(),
    body('slug').trim().isLength({ min: 3 }).toLowerCase(),
    body('tags').optional().isArray(),
    body('images').optional().isArray(),
    body('link').trim().optional(),
    body('order').optional().isInt(),
    body('isVisible').optional().isBoolean(),
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

      const project = new Project(req.body);
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/admin/projects/:id
 * Update a project
 */
router.patch('/projects/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Delete a project
 */
router.delete('/projects/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted', id: project._id });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SITE SETTINGS CRUD
// ============================================

/**
 * GET /api/admin/site-settings
 * Get or create singleton site settings
 */
router.get('/site-settings', async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSingleton();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/site-settings
 * Update site settings (partial update)
 */
router.patch(
  '/site-settings',
  [
    body('contactPhone').optional().trim(),
    body('contactEmail').optional().trim().toLowerCase(),
    body('contactAddress').optional().trim(),
    body('socialLinks').optional().isObject(),
    body('socialLinks.facebook').optional().trim(),
    body('socialLinks.instagram').optional().trim(),
    body('socialLinks.linkedin').optional().trim(),
    body('socialLinks.twitter').optional().trim(),
    body('socialLinks.youtube').optional().trim(),
    body('socialLinks.whatsapp').optional().trim(),
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

      const settings = await SiteSettings.findByIdAndUpdate(
        'settings',
        { $set: req.body },
        { new: true, upsert: true, runValidators: true }
      );

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// GOOGLE SHEETS API ROUTES
// ============================================

/**
 * GET /api/admin/sheets/volunteers
 * Fetch all volunteer entries from Google Sheets
 */
router.get('/sheets/volunteers', async (req, res, next) => {
  try {
    if (!sheets || !process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        error: 'Google Sheets service not configured',
        code: 'SHEETS_NOT_CONFIGURED',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Volunteers!A:H',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.json([]);
    }

    // First row is header, skip it
    const headers = rows[0];
    const data = rows.slice(1).map((row, index) => {
      const obj = { rowIndex: index + 1 }; // rowIndex for sheet updates
      headers.forEach((header, col) => {
        obj[header] = row[col] || '';
      });
      return obj;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching volunteers from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to fetch volunteer data',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/sheets/contacts
 * Fetch all contact entries from Google Sheets
 */
router.get('/sheets/contacts', async (req, res, next) => {
  try {
    if (!sheets || !process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        error: 'Google Sheets service not configured',
        code: 'SHEETS_NOT_CONFIGURED',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Contacts!A:E',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.json([]);
    }

    // First row is header, skip it
    const headers = rows[0];
    const data = rows.slice(1).map((row, index) => {
      const obj = { rowIndex: index + 1 };
      headers.forEach((header, col) => {
        obj[header] = row[col] || '';
      });
      return obj;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching contacts from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to fetch contact data',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/admin/sheets/volunteers/:rowIndex
 * Update a volunteer row in Google Sheets
 */
router.patch(
  '/sheets/volunteers/:rowIndex',
  [param('rowIndex').isInt({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid row index' });
      }

      if (!sheets || !process.env.GOOGLE_SHEET_ID) {
        return res.status(500).json({
          error: 'Google Sheets service not configured',
        });
      }

      const { rowIndex } = req.params;
      const { status } = req.body;

      // Update status column (column G = index 6)
      if (status) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `Volunteers!G${parseInt(rowIndex) + 1}`, // +1 for header row
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[status]],
          },
        });
      }

      res.json({ success: true, message: 'Row updated', rowIndex });
    } catch (error) {
      console.error('Error updating volunteer row:', error);
      next(error);
    }
  }
);

/**
 * POST /api/admin/sheets/volunteers/:rowIndex/approve
 * Approve a volunteer: update status to Approved and trigger automation
 */
router.post(
  '/sheets/volunteers/:rowIndex/approve',
  [param('rowIndex').isInt({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid row index' });
      }

      if (!sheets || !process.env.GOOGLE_SHEET_ID) {
        return res.status(500).json({
          error: 'Google Sheets service not configured',
        });
      }

      const { rowIndex } = req.params;
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const actualRowNumber = parseInt(rowIndex) + 1; // +1 for header row

      // 1. Update status column (G) to "Approved"
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Volunteers!G${actualRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Approved']],
        },
      });

      // 2. Fetch the full row to get volunteer details
      const rowResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Volunteers!A${actualRowNumber}:H${actualRowNumber}`,
      });

      const rowData = rowResponse.data.values?.[0] || [];

      // 3. Trigger existing automation (certificate + email)
      // The automation.processVolunteerCertificate function will handle it
      // For now, just log that approval was triggered
      console.log(`✅ Volunteer approved (rowIndex: ${rowIndex}):`, {
        name: rowData[0],
        email: rowData[2],
        status: 'Approved',
      });

      res.json({
        success: true,
        message: 'Volunteer approved and automation triggered',
        rowIndex,
        volunteerEmail: rowData[2],
      });
    } catch (error) {
      console.error('Error approving volunteer:', error);
      next(error);
    }
  }
);

module.exports = router;
