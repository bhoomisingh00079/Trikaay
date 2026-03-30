const express = require('express');
const multer = require('multer');
const { body, param, validationResult } = require('express-validator');

const MediaAsset = require('../models/MediaAsset');
const { cacheControl, CACHE_DURATIONS } = require('../middleware/cacheControl');
const { verifyToken } = require('../middleware/auth');

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow PDFs and images
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

const router = express.Router();

// List PDFs with 5-minute cache
router.get('/docs', cacheControl(CACHE_DURATIONS.API_GENERAL), async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { kind: 'pdf' };
    if (category) query.category = category;

    const docs = await MediaAsset.find(query)
      .select('originalName category title size updatedAt')
      .sort({ title: 1, originalName: 1 })
      .lean();

    return res.json(docs);
  } catch (error) {
    return next(error);
  }
});

// List images with 5-minute cache
router.get('/images', cacheControl(CACHE_DURATIONS.API_GENERAL), async (req, res, next) => {
  try {
    const images = await MediaAsset.find({ kind: 'image' })
      .select('originalName title size updatedAt')
      .sort({ originalName: 1 })
      .lean();

    return res.json(images);
  } catch (error) {
    return next(error);
  }
});

// Stream file with 1-month cache (media files are static)
router.get('/file/:fileName', cacheControl(CACHE_DURATIONS.MEDIA), async (req, res, next) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    const asset = await MediaAsset.findOne({ originalName: fileName })
      .select('originalName mimeType size data')
      .exec();

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Ensure payload is sent as raw binary bytes, not a serialized object/string.
    const binaryData = Buffer.isBuffer(asset.data)
      ? asset.data
      : Buffer.from(asset.data?.buffer || asset.data || '');

    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Length', binaryData.length);
    // Cache-Control header already set by middleware
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    return res.send(binaryData);
  } catch (error) {
    return next(error);
  }
});

// ============================================
// MEDIA MANAGEMENT (Protected Routes)
// ============================================

/**
 * POST /api/media/upload
 * Upload a new media file (PDF or image)
 * Requires JWT authentication
 */
router.post(
  '/upload',
  verifyToken,
  upload.single('file'),
  [
    body('title').trim().isLength({ min: 1 }),
    body('category')
      .isIn(['org', 'csr', 'project', 'general', 'certificate'])
      .escape(),
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

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { title, category } = req.body;
      const { originalname, mimetype, buffer, size } = req.file;

      // Determine kind (pdf or image)
      const kind = mimetype === 'application/pdf' ? 'pdf' : 'image';

      // Create MediaAsset document
      const mediaAsset = new MediaAsset({
        originalName: originalname,
        kind,
        category: category || 'general',
        title: title || originalname,
        mimeType: mimetype,
        size,
        data: buffer,
      });

      await mediaAsset.save();

      res.status(201).json({
        _id: mediaAsset._id,
        title: mediaAsset.title,
        category: mediaAsset.category,
        size: mediaAsset.size,
        kind: mediaAsset.kind,
        createdAt: mediaAsset.createdAt,
        uploadedBy: req.user?.email,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/media/:id
 * Delete a media file by MongoDB _id
 * Requires JWT authentication
 */
router.delete(
  '/:id',
  verifyToken,
  [param('id').isMongoId()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const media = await MediaAsset.findByIdAndDelete(req.params.id);

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.json({ message: 'Media deleted', id: media._id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;