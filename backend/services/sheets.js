const { sheets } = require('../config/googleAuth');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

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

module.exports = {
  appendContact,
  appendSubscriber,
};
