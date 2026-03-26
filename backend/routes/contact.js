const express = require('express');
const router = express.Router();
const { appendContact } = require('../services/sheets');

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: name, phone, email, subject',
      });
    }

    // Append to Google Sheet
    await appendContact({ name, phone, email, subject });

    res.status(200).json({
      message: 'Contact submitted successfully',
      data: { name, phone, email, subject },
    });
  } catch (error) {
    console.error('Contact route error:', error);
    res.status(500).json({
      error: 'Failed to submit contact',
      details: error.message,
    });
  }
});

module.exports = router;
