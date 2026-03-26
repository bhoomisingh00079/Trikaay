const express = require('express');
const router = express.Router();
const { appendSubscriber } = require('../services/sheets');

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email field exists
    if (!email) {
      return res.status(400).json({
        error: 'Missing required field: email',
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Append to Google Sheet
    await appendSubscriber({ email });

    res.status(200).json({
      message: 'Subscription successful',
      data: { email },
    });
  } catch (error) {
    console.error('Subscribe route error:', error);
    res.status(500).json({
      error: 'Failed to subscribe',
      details: error.message,
    });
  }
});

module.exports = router;
