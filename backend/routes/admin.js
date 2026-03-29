/**
 * Admin API Routes
 * All routes require JWT authentication
 * Includes CRUD operations for all content types
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');

const TeamMember = require('../models/TeamMember');
const Project = require('../models/Project');

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

module.exports = router;
