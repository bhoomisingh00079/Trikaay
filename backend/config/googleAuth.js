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

if (missingVars.length > 0) {
  console.error('\n❌ ERROR: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease add these variables to your .env file');
  process.exit(1);
}

console.log('✅ All required environment variables found');
console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL: ✅');
console.log('   - GOOGLE_PRIVATE_KEY: ✅');
console.log('   - GOOGLE_SHEET_ID: ✅');

// Create JWT auth client using service account credentials
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

console.log('\n🔐 Google Sheets JWT Auth configured');
console.log('   Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

// Create sheets API instance (v4)
const sheets = google.sheets({ version: 'v4', auth });

console.log('✅ Google Sheets API v4 connected successfully\n');

module.exports = {
  auth,
  sheets,
};
