require('dotenv').config();
const { google } = require('googleapis');

// Create JWT auth client
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create sheets API instance
const sheets = google.sheets({ version: 'v4', auth });

module.exports = {
  auth,
  sheets,
};
