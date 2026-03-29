const express = require('express');
const { initializeGoogleAuth } = require('../utils/googleSheets');
const { initializeEmailService } = require('../utils/emailService');
const { runAutomation } = require('../utils/automation');

const router = express.Router();

let servicesReady = false;

async function ensureServicesReady() {
  if (servicesReady) return;

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  await initializeGoogleAuth();
  await initializeEmailService(emailUser, emailPassword);
  servicesReady = true;
}

router.post('/sheets-event', async (req, res, next) => {
  try {
    const automationEnabled = process.env.AUTOMATION_ENABLED === 'true';
    const automationMode = (process.env.AUTOMATION_MODE || 'webhook').toLowerCase();

    if (!automationEnabled || automationMode !== 'webhook') {
      return res.status(403).json({
        success: false,
        message: 'Automation webhook is disabled',
      });
    }

    const configuredToken = process.env.AUTOMATION_WEBHOOK_TOKEN;
    if (configuredToken) {
      const incomingToken = req.get('x-automation-token');
      if (incomingToken !== configuredToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid automation token',
        });
      }
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      return res.status(500).json({
        success: false,
        message: 'Spreadsheet ID is not configured',
      });
    }

    await ensureServicesReady();
    await runAutomation(spreadsheetId);

    return res.json({
      success: true,
      message: 'Automation run completed',
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
