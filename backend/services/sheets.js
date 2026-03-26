const { sheets } = require('../config/googleAuth');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

console.log('📊 Google Sheets Service Initialized');
console.log('  Sheet ID:', SHEET_ID ? '✅ Loaded' : '❌ NOT FOUND');

// Get current timestamp in readable format
function getCurrentTimestamp() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Append a new contact to the Contacts sheet
 * @param {Object} contact - { name, phone, email, subject }
 */
async function appendContact({ name, phone, email, subject }) {
  try {
    const timestamp = getCurrentTimestamp();
    const values = [[name, phone, email, subject, timestamp]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Contacts!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending contact:', error);
    throw error;
  }
}

/**
 * Append a new subscriber to the Subscribers sheet
 * @param {Object} subscriber - { email }
 */
async function appendSubscriber({ email }) {
  try {
    const timestamp = getCurrentTimestamp();
    const values = [[email, timestamp]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Subscribers!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending subscriber:', error);
    throw error;
  }
}

/**
 * Append a new comment with name, text, status, and timestamp
 * @param {Object} comment - { name, text, status }
 */
async function appendComment({ name, text, status = 'pending', projectId = '' }) {
  try {
    const timestamp = getCurrentTimestamp();
    const values = [[name, text, status, timestamp, projectId]];

    console.log('\n📝 ==== APPENDING COMMENT TO GOOGLE SHEETS ====');
    console.log('Request Data:');
    console.log('  Name:', name);
    console.log('  Comment:', text);
    console.log('  Status:', status);
    console.log('  Timestamp:', timestamp);
    console.log('  Project ID:', projectId);
    console.log('\nSheet Configuration:');
    console.log('  Spreadsheet ID:', SHEET_ID);
    console.log('  Range:', 'Comments!A:E');
    console.log('  Value Input Option:', 'USER_ENTERED');
    console.log('  Row to Append:', values[0]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Comments!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('\n✅ ==== GOOGLE SHEETS API SUCCESS ====');
    console.log('Response Details:');
    console.log('  Spreadsheet ID:', response.data.spreadsheetId);
    console.log('  Updated Range:', response.data.updates.updatedRange);
    console.log('  Updated Rows:', response.data.updates.updatedRows);
    console.log('  Updated Cells:', response.data.updates.updatedCells);
    console.log('  Table Range:', response.data.spreadsheetProperties?.title || 'N/A');
    console.log('====================================\n');

    return response.data;
  } catch (error) {
    console.error('\n❌ ==== ERROR APPENDING COMMENT ====');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code || 'N/A');
    console.error('Error Status:', error.status || 'N/A');
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    console.error('====================================\n');
    throw error;
  }
}

/**
 * Get approved comments from the Comments sheet
 * @returns {Array} Array of approved comments with name, text, status, timestamp
 */
async function getApprovedComments() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Comments!A:E',
    });

    const rows = response.data.values || [];

    // Filter rows where status (column C, index 2) is "approved"
    // Skip header row if present
    const comments = rows
      .slice(1) // Skip first row (header)
      .filter((row) => row[2]?.toLowerCase() === 'approved') // Status in column C
      .map((row) => ({
        name: row[0],
        text: row[1],
        status: row[2],
        timestamp: row[3],
        projectId: row[4] || null,
      }));

    return comments;
  } catch (error) {
    console.error('Error fetching approved comments:', error);
    throw error;
  }
}

module.exports = {
  appendContact,
  appendSubscriber,
  appendComment,
  getApprovedComments,
};
