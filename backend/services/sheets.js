const { sheets } = require('../config/googleAuth');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

console.log('📊 Google Sheets Service Initialized');
console.log('  Sheet ID:', SHEET_ID ? '✅ Loaded' : '❌ NOT FOUND');

const isSheetsAvailable = sheets && SHEET_ID;

if (!isSheetsAvailable) {
  console.warn('⚠️ Google Sheets SDK not configured. All Sheets operations will use console mock mode.');
}

const noOp = async (payload) => {
  console.warn('🟡 Mock Google Sheets append called:', payload);
  return { mock: true, payload };
};

const noOpGet = async () => {
  console.warn('🟡 Mock Google Sheets get called');
  return { values: [] };
};

async function appendContact({ name, phone, email, subject }) {
  if (!isSheetsAvailable) {
    return noOp({ name, phone, email, subject, at: new Date().toISOString() });
  }
  // existing code below
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
}

async function appendSubscriber({ email }) {
  if (!isSheetsAvailable) {
    return noOp({ email, at: new Date().toISOString() });
  }
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
}

async function appendComment({ name, text, status = 'pending', projectId = '' }) {
  if (!isSheetsAvailable) {
    return noOp({ name, text, status, projectId, at: new Date().toISOString() });
  }
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
}

async function getApprovedComments() {
  if (!isSheetsAvailable) {
    return [];
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Comments!A:E',
  });

  const rows = response.data.values || [];

  const comments = rows
    .slice(1)
    .filter((row) => row[2]?.toLowerCase() === 'approved')
    .map((row) => ({
      name: row[0],
      text: row[1],
      status: row[2],
      timestamp: row[3],
      projectId: row[4] || null,
    }));

  return comments;
}

// Get current timestamp in readable format
function getCurrentTimestamp() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
}

module.exports = {
  appendContact,
  appendSubscriber,
  appendComment,
  getApprovedComments,
};
