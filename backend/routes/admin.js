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
const { initializeGoogleAuth } = require('../utils/googleSheets');
const { initializeEmailService } = require('../utils/emailService');
const { processVolunteerCertificate } = require('../utils/automation');
const { noCacheControl } = require('../middleware/cacheControl');

const router = express.Router();
let automationServicesReady = false;
const SHEETS_CACHE_TTL_MS = Number(process.env.ADMIN_SHEETS_CACHE_TTL_MS || 15000);
const sheetsCache = new Map();

const VOLUNTEER_TAB_CANDIDATES = [
  process.env.VOLUNTEERS_SHEET_TAB,
  process.env.SHEET_TAB,
  process.env.SHEET_NAME,
  'Volunteers',
  'Volunteer Registrations',
  'Volunteer',
].filter(Boolean);

const CONTACT_TAB_CANDIDATES = [
  process.env.CONTACTS_SHEET_TAB,
  'Contacts',
  'Contact',
].filter(Boolean);

const COMMENTS_TAB_CANDIDATES = [
  process.env.COMMENTS_SHEET_TAB,
  'Comments',
  'Comment',
].filter(Boolean);

const SUBSCRIBERS_TAB_CANDIDATES = [
  process.env.SUBSCRIBERS_SHEET_TAB,
  'Subscribers',
  'Subscriber',
].filter(Boolean);

function toSheetRange(tabName, subRange) {
  const escapedTab = String(tabName).replace(/'/g, "\\'");
  return `'${escapedTab}'!${subRange}`;
}

async function getSpreadsheetTabTitles(spreadsheetId) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });

  return (meta.data?.sheets || [])
    .map((sheet) => sheet?.properties?.title)
    .filter(Boolean);
}

function findTabByCandidates(tabTitles, candidates) {
  const lowered = tabTitles.map((title) => ({
    original: title,
    lower: String(title).toLowerCase(),
  }));

  for (const candidate of candidates) {
    const hit = lowered.find((item) => item.lower === String(candidate).toLowerCase());
    if (hit) return hit.original;
  }

  for (const candidate of candidates) {
    const hit = lowered.find((item) => item.lower.includes(String(candidate).toLowerCase()));
    if (hit) return hit.original;
  }

  return tabTitles[0] || null;
}

async function resolveSheetTab(spreadsheetId, candidates) {
  const tabTitles = await getSpreadsheetTabTitles(spreadsheetId);
  const resolved = findTabByCandidates(tabTitles, candidates);
  if (!resolved) {
    throw new Error('No sheet tabs found in spreadsheet');
  }
  return resolved;
}

async function ensureAutomationServicesReady() {
  if (automationServicesReady) return;

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!emailUser || !emailPassword) {
    throw new Error('Email service credentials are not configured (EMAIL_USER and EMAIL_PASSWORD/EMAIL_PASS required)');
  }

  await initializeGoogleAuth();
  await initializeEmailService(emailUser, emailPassword);
  automationServicesReady = true;
}

function looksLikeHeaderRow(rowValues, expectedHeaders) {
  if (!Array.isArray(rowValues) || rowValues.length === 0) return false;

  const expectedSet = new Set(expectedHeaders.map((h) => String(h).trim().toLowerCase()));
  const normalized = rowValues.map((value) => String(value || '').trim().toLowerCase());
  const matchCount = normalized.filter((value) => expectedSet.has(value)).length;

  return matchCount >= Math.min(2, expectedHeaders.length);
}

function mapSheetRows(rows, expectedHeaders) {
  if (!rows || rows.length === 0) return [];

  const firstRowIsHeader = looksLikeHeaderRow(rows[0], expectedHeaders);
  const headers = firstRowIsHeader
    ? rows[0]
    : expectedHeaders.map((header, index) => header || `Column ${index + 1}`);
  const dataRows = firstRowIsHeader ? rows.slice(1) : rows;
  const baseRowNumber = firstRowIsHeader ? 2 : 1;

  return dataRows.map((row, index) => {
    const sheetRowNumber = baseRowNumber + index;
    const obj = {
      rowIndex: index + 1,
      rowNumber: sheetRowNumber,
    };

    headers.forEach((header, col) => {
      obj[header] = row[col] || '';
    });

    return obj;
  });
}

async function getCachedSheetsData(cacheKey, fetcher) {
  const now = Date.now();
  const existing = sheetsCache.get(cacheKey);

  if (existing && now - existing.fetchedAt < SHEETS_CACHE_TTL_MS) {
    return existing.data;
  }

  const data = await fetcher();
  sheetsCache.set(cacheKey, { data, fetchedAt: now });
  return data;
}

function invalidateSheetsCache(keys = []) {
  if (!keys.length) {
    sheetsCache.clear();
    return;
  }

  keys.forEach((key) => sheetsCache.delete(key));
}

function slugifyText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function buildUniqueProjectSlug(baseInput, excludeId = null) {
  const baseSlug = slugifyText(baseInput) || `project-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // eslint-disable-next-line no-await-in-loop
    const exists = await Project.exists(query);
    if (!exists) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureProjectNumbers() {
  const projects = await Project.find({}).sort({ projectNumber: 1, createdAt: 1 }).select('_id projectNumber').lean();
  const bulkOps = [];

  projects.forEach((project, index) => {
    const expectedNumber = index + 1;
    if (project.projectNumber !== expectedNumber) {
      bulkOps.push({
        updateOne: {
          filter: { _id: project._id },
          update: {
            $set: {
              projectNumber: expectedNumber,
              order: expectedNumber,
            },
          },
        },
      });
    }
  });

  if (bulkOps.length > 0) {
    await Project.bulkWrite(bulkOps);
  }
}

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
router.get('/team', noCacheControl, async (req, res, next) => {
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
router.get('/projects', noCacheControl, async (req, res, next) => {
  try {
    await ensureProjectNumbers();
    const projects = await Project.find().sort({ projectNumber: 1, order: 1 });
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
    body('description').trim().optional(),
    body('shortDescriptionEn').trim().optional(),
    body('fullDescriptionEn').trim().optional(),
    body('shortDescriptionMr').trim().optional(),
    body('fullDescriptionMr').trim().optional(),
    body('tags').optional().isArray(),
    body('images').optional().isArray(),
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

      const lastProject = await Project.findOne({}).sort({ projectNumber: -1 }).select('projectNumber').lean();
      const nextProjectNumber = (lastProject?.projectNumber || 0) + 1;

      const projectPayload = {
        ...req.body,
        slug: await buildUniqueProjectSlug(req.body.slug || req.body.title),
        projectNumber: nextProjectNumber,
        order: Number.isInteger(req.body.order) ? req.body.order : nextProjectNumber,
      };

      const project = new Project(projectPayload);
      await project.save();
      await ensureProjectNumbers();
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

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatePayload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updatePayload, 'slug') || Object.prototype.hasOwnProperty.call(updatePayload, 'title')) {
      updatePayload.slug = await buildUniqueProjectSlug(updatePayload.slug || updatePayload.title || project.title, project._id);
    }

    if (Object.prototype.hasOwnProperty.call(updatePayload, 'projectNumber')) {
      delete updatePayload.projectNumber;
    }

    if (Object.prototype.hasOwnProperty.call(updatePayload, 'link')) {
      delete updatePayload.link;
    }

    Object.assign(project, updatePayload);
    await project.save();

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

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const removedProjectNumber = project.projectNumber;
    await project.deleteOne();

    // Keep numbers contiguous after deletion.
    await Project.updateMany(
      { projectNumber: { $gt: removedProjectNumber } },
      {
        $inc: {
          projectNumber: -1,
          order: -1,
        },
      }
    );

    await ensureProjectNumbers();

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
router.get('/site-settings', noCacheControl, async (req, res, next) => {
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
    body('contactEmail').optional({ checkFalsy: true }).isEmail().trim(),
    body('contactAddress').optional().trim(),
    body('contactAddressSwapnalaya').optional().trim(),
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

      const settings = await SiteSettings.getSingleton();

      if (Object.prototype.hasOwnProperty.call(req.body, 'contactPhone')) {
        settings.contactPhone = req.body.contactPhone;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'contactEmail')) {
        settings.contactEmail = req.body.contactEmail;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'contactAddress')) {
        settings.contactAddress = req.body.contactAddress;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'contactAddressSwapnalaya')) {
        settings.contactAddressSwapnalaya = req.body.contactAddressSwapnalaya;
      }
      if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
        settings.socialLinks = {
          ...settings.socialLinks,
          ...req.body.socialLinks,
        };
      }

      await settings.save();

      const freshSettings = await SiteSettings.findById('settings');

      res.json(freshSettings);
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

    const data = await getCachedSheetsData('volunteers', async () => {
      const volunteerTab = await resolveSheetTab(process.env.GOOGLE_SHEET_ID, VOLUNTEER_TAB_CANDIDATES);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: toSheetRange(volunteerTab, 'A:H'),
      });

      const rows = response.data.values || [];
      return mapSheetRows(
        rows,
        ['Name', 'Phone', 'Email', 'Position', 'Experience', 'Availability', 'Status', 'Certificate ID']
      ).reverse();
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

    const data = await getCachedSheetsData('contacts', async () => {
      const contactsTab = await resolveSheetTab(process.env.GOOGLE_SHEET_ID, CONTACT_TAB_CANDIDATES);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: toSheetRange(contactsTab, 'A:E'),
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        return [];
      }

      const headers = rows[0];
      return rows.slice(1).map((row, index) => {
        const obj = { rowIndex: index + 1 };
        headers.forEach((header, col) => {
          obj[header] = row[col] || '';
        });
        return obj;
      });
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
 * GET /api/admin/sheets/comments
 * Fetch all comments from Google Sheets for moderation
 */
router.get('/sheets/comments', async (req, res, next) => {
  try {
    if (!sheets || !process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        error: 'Google Sheets service not configured',
        code: 'SHEETS_NOT_CONFIGURED',
      });
    }

    const data = await getCachedSheetsData('comments', async () => {
      const commentsTab = await resolveSheetTab(process.env.GOOGLE_SHEET_ID, COMMENTS_TAB_CANDIDATES);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: toSheetRange(commentsTab, 'A:E'),
      });

      const rows = response.data.values || [];
      return mapSheetRows(rows, ['Name', 'Comment', 'Status', 'Timestamp', 'Project']).reverse();
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching comments from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to fetch comments data',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/sheets/subscribers
 * Fetch all subscribers from Google Sheets
 */
router.get('/sheets/subscribers', async (req, res, next) => {
  try {
    if (!sheets || !process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        error: 'Google Sheets service not configured',
        code: 'SHEETS_NOT_CONFIGURED',
      });
    }

    const data = await getCachedSheetsData('subscribers', async () => {
      const subscribersTab = await resolveSheetTab(process.env.GOOGLE_SHEET_ID, SUBSCRIBERS_TAB_CANDIDATES);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: toSheetRange(subscribersTab, 'A:B'),
      });

      const rows = response.data.values || [];
      const cleanedRows = rows.filter((row) => {
        const first = String(row?.[0] || '').trim().toLowerCase();
        const second = String(row?.[1] || '').trim().toLowerCase();

        return !(first === 'email' && (second === 'timestamp' || second === 'subscribed at' || second === 'subscribedat'));
      });

      return mapSheetRows(cleanedRows, ['Email', 'Timestamp']).reverse();
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching subscribers from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to fetch subscribers data',
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
      const volunteerTab = await resolveSheetTab(process.env.GOOGLE_SHEET_ID, VOLUNTEER_TAB_CANDIDATES);
      const rowNumber = Number.parseInt(rowIndex, 10);

      // Update status column (column G = index 6)
      if (status) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: toSheetRange(volunteerTab, `G${rowNumber}`),
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[status]],
          },
        });
        invalidateSheetsCache(['volunteers']);
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
 *
 * Deterministic flow:
 *   1. Write Status="Approved" to the sheet (the source of truth).
 *   2. Directly run processVolunteerCertificate for THIS row. No polling.
 *   3. processVolunteerCertificate is idempotent and re-entry safe; it will
 *      skip if the row is already Completed/Processing.
 *   4. Invalidate the volunteers cache on every status change.
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
      const volunteerTab = await resolveSheetTab(sheetId, VOLUNTEER_TAB_CANDIDATES);
      const actualRowNumber = Number.parseInt(rowIndex, 10);

// Update Google Sheet
await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: toSheetRange(volunteerTab, `G${actualRowNumber}`),
    valueInputOption: 'USER_ENTERED',
    requestBody: {
        values: [['Approved']],
    },
});

invalidateSheetsCache(['volunteers']);

console.log(`✓ Status updated to Approved for row ${actualRowNumber}`);


// Wait until Google Sheets actually returns Approved
let confirmed = false;

for (let i = 0; i < 20; i++) {

    const verify = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: toSheetRange(volunteerTab, `G${actualRowNumber}`),
    });

    const status = String(
        verify.data.values?.[0]?.[0] || ""
    ).trim();

    if (status === "Approved") {
        confirmed = true;
        console.log(`✓ Google Sheet confirmed Approved`);
        break;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
}

if (!confirmed) {
    throw new Error(
        `Google Sheet never confirmed approval for row ${actualRowNumber}`
    );
}

// Ensure services
await ensureAutomationServicesReady();

// Start certificate generation
const result = await processVolunteerCertificate(
    [],
    actualRowNumber,
    sheetId,
    volunteerTab
);

      invalidateSheetsCache(['volunteers']);

      if (result && result.success) {
        return res.json({
          success: true,
          message: 'Volunteer approved, certificate generated, stored in MongoDB, and email sent',
          rowIndex,
          skipped: !!result.skipped,
          reason: result.reason || null,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Volunteer marked approved, but certificate generation/email did not complete',
        rowIndex,
        reason: (result && result.reason) || 'unknown',
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [approve] error:`, error);
      if (error && error.stack) console.error(error.stack);
      return next(error);
    }
  }
);

/**
 * POST /api/admin/sheets/volunteers/:rowIndex/retry-certificate
 * Retry certificate generation/email for an already approved volunteer row
 */
router.post(
  '/sheets/volunteers/:rowIndex/retry-certificate',
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
      const volunteerTab = await resolveSheetTab(sheetId, VOLUNTEER_TAB_CANDIDATES);
      const actualRowNumber = Number.parseInt(rowIndex, 10);

      // Ensure the row is at least "Approved" so the processor can claim it.
      // The processor is idempotent: it will skip rows already Completed.
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: toSheetRange(volunteerTab, `G${actualRowNumber}`),
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Approved']],
        },
      });
      invalidateSheetsCache(['volunteers']);

      await ensureAutomationServicesReady();
      const result = await processVolunteerCertificate(
        [],
        actualRowNumber,
        sheetId,
        volunteerTab
      );

      invalidateSheetsCache(['volunteers']);

      if (result && result.success) {
        return res.json({
          success: true,
          message: 'Certificate retry successful. Certificate saved to MongoDB and email sent.',
          rowIndex,
          skipped: !!result.skipped,
          reason: result.reason || null,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Retry failed. Volunteer remains in Approved status for another retry.',
        rowIndex,
        reason: (result && result.reason) || 'unknown',
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [retry] error:`, error);
      if (error && error.stack) console.error(error.stack);
      return next(error);
    }
  }
);

/**
 * POST /api/admin/sheets/comments/:rowNumber/approve
 * Approve a comment by setting its status column to Approved
 */
router.post(
  '/sheets/comments/:rowNumber/approve',
  [param('rowNumber').isInt({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid row number' });
      }

      if (!sheets || !process.env.GOOGLE_SHEET_ID) {
        return res.status(500).json({
          error: 'Google Sheets service not configured',
        });
      }

      const { rowNumber } = req.params;
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const commentsTab = await resolveSheetTab(sheetId, COMMENTS_TAB_CANDIDATES);

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: toSheetRange(commentsTab, `C${Number.parseInt(rowNumber, 10)}`),
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Approved']],
        },
      });

      invalidateSheetsCache(['comments']);

      res.json({
        success: true,
        message: 'Comment approved',
        rowNumber,
      });
    } catch (error) {
      console.error('Error approving comment:', error);
      next(error);
    }
  }
);

module.exports = router;
