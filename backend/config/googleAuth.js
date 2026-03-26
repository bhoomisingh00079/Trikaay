require('dotenv').config();
const { google } = require('googleapis');

// Validate required environment variables
console.log('\n🔍 Validating Google Sheets environment variables...');

const requiredEnvVars = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

let auth = null;
let sheets = null;

if (missingVars.length > 0) {
  console.warn('\n⚠️ WARNING: Missing required Google Sheets environment variables:');
  missingVars.forEach(varName => {
    console.warn(`   - ${varName}`);
  });
  console.warn('\nGoogle Sheets features will fallback to console-only mode.');
  console.warn('Set these variables in your .env file when you want full sheet support.');

  module.exports = {
    auth,
    sheets,
  };
} else {
  console.log('✅ All required environment variables found');
  console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL: ✅');
  console.log('   - GOOGLE_PRIVATE_KEY: ✅');
  console.log('   - GOOGLE_SHEET_ID: ✅');

  // Create JWT auth client using service account credentials
  auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('\n🔐 Google Sheets JWT Auth configured');
  console.log('   Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

  // Create sheets API instance (v4)
  sheets = google.sheets({ version: 'v4', auth });

  console.log('✅ Google Sheets API v4 connected successfully\n');

  module.exports = {
    auth,
    sheets,
  };
}


