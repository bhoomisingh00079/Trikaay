const express = require('express');
const MediaAsset = require('../models/MediaAsset');
const { cacheControl, CACHE_DURATIONS } = require('../middleware/cacheControl');

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

module.exports = router;