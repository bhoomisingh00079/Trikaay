const express = require('express');
const router = express.Router();
const { appendComment, getApprovedComments } = require('../services/sheets');

// Submit a new comment with name and text
// Saves to Google Sheets with status "pending" and timestamp
router.post('/', async (req, res) => {
  try {
    const { name, text, projectId } = req.body;

    console.log('📨 Comment received:');
    console.log('  Name:', name);
    console.log('  Text:', text);
    console.log('  Project ID:', projectId);

    // Validate required fields
    if (!name || !text?.trim()) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: name, text',
      });
    }

    console.log('✅ Validation passed');

    // Append comment to Google Sheet with pending status
    await appendComment({
      name,
      text: text.trim(),
      status: 'pending',
      projectId: projectId || '',
    });

    console.log('✅ Comment successfully appended to Google Sheets');

    res.status(201).json({
      success: true,
      message: 'Comment submitted for approval',
    });
  } catch (error) {
    console.error('Comment route error:', error);
    res.status(500).json({
      error: 'Failed to submit comment',
      details: error.message,
    });
  }
});

// Get approved comments from Google Sheets
router.get('/approved', async (req, res) => {
  try {
    const comments = await getApprovedComments();

    res.status(200).json({
      message: 'Approved comments retrieved successfully',
      data: comments,
    });
  } catch (error) {
    console.error('Fetch approved comments error:', error);
    res.status(500).json({
      error: 'Failed to fetch approved comments',
      details: error.message,
    });
  }
});

// Test Google Sheets connection
router.get('/test-sheet', async (req, res) => {
  try {
    console.log('\n🧪 TEST ROUTE: Testing Google Sheets connection...\n');

    const testData = {
      name: 'TEST_USER',
      text: 'This is a test comment to verify Google Sheets API is working',
      status: 'pending',
    };

    console.log('📤 Appending test row to Comments sheet...');
    console.log('   Name:', testData.name);
    console.log('   Text:', testData.text);
    console.log('   Status:', testData.status);

    // Call appendComment to test the connection
    const result = await appendComment(testData);

    console.log('\n✅ TEST SUCCESSFUL: Row appended to Google Sheets');
    console.log('   Updated Range:', result.updates?.updatedRange);
    console.log('   Updated Rows:', result.updates?.updatedRows);
    console.log('   Updated Cells:', result.updates?.updatedCells);

    res.status(200).json({
      success: true,
      message: 'Google Sheets connection test successful',
      testData: testData,
      response: result.updates,
    });
  } catch (error) {
    console.error('\n❌ TEST FAILED: Could not connect to Google Sheets');
    console.error('Error Message:', error.message);
    console.error('Error Details:', error);

    res.status(500).json({
      success: false,
      message: 'Google Sheets connection test failed',
      error: error.message,
      details: error.toString(),
    });
  }
});

module.exports = router;
