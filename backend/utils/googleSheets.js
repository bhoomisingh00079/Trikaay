/**
 * Google Sheets Integration Module
 * Handles authentication and data operations with Google Sheets
 */

const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets and Drive APIs
const sheets = google.sheets('v4');
const drive = google.drive('v3');

// Service account credentials from environment
let auth;

/**
 * Initialize Google authentication with service account
 * @returns {Promise<void>}
 */
async function initializeGoogleAuth() {
    try {
        const keyFile = path.join(__dirname, '../config/googleAuth.json');
        auth = new google.auth.GoogleAuth({
            keyFile: keyFile,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
            ],
        });
        console.log('✓ Google authentication initialized');
    } catch (error) {
        console.error('✗ Failed to initialize Google auth:', error.message);
        throw error;
    }
}

/**
 * Append volunteer registration to Google Sheets
 * @param {string} spreadsheetId - The spreadsheet ID
 * @param {Object} volunteerData - Volunteer registration data
 * @returns {Promise<Object>} - Response from Google Sheets API
 */
async function appendVolunteerToSheet(spreadsheetId, volunteerData) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }

        const timestamp = new Date().toISOString();

        const values = [
            [
                volunteerData.name,
                volunteerData.phone,
                volunteerData.email,
                volunteerData.position,
                volunteerData.experience || '',
                volunteerData.availability,
                'Pending', // Status (default)
                '', // Certificate ID (empty initially)
                timestamp, // Timestamp
            ],
        ];

        const resource = {
            values: values,
        };

        const response = await sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A2', // Append from row 2 (assuming row 1 is headers)
            valueInputOption: 'RAW',
            resource: resource,
        });

        console.log(`✓ Volunteer data appended to sheet. Row: ${response.data.updates.updatedRows}`);
        return response.data;
    } catch (error) {
        console.error('✗ Error appending to Google Sheets:', error.message);
        throw error;
    }
}

/**
 * Get all rows from Google Sheets
 * @param {string} spreadsheetId - The spreadsheet ID
 * @returns {Promise<Array>} - Array of row data
 */
async function getAllRows(spreadsheetId) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }

        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:I', // Get all rows and columns A-I
        });

        const rows = response.data.values || [];
        return rows;
    } catch (error) {
        console.error('✗ Error reading from Google Sheets:', error.message);
        throw error;
    }
}

/**
 * Update a specific cell in Google Sheets
 * @param {string} spreadsheetId - The spreadsheet ID
 * @param {number} rowIndex - Row number (1-based)
 * @param {number} colIndex - Column number (0-based, where A=0)
 * @param {string} value - Value to set
 * @returns {Promise<Object>} - Response from Google Sheets API
 */
async function updateCell(spreadsheetId, rowIndex, colIndex, value) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }

        // Convert column index to letter (0->A, 1->B, etc.)
        const columnLetter = String.fromCharCode(65 + colIndex);
        const cellAddress = `${columnLetter}${rowIndex}`;

        const response = await sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: `Sheet1!${cellAddress}`,
            valueInputOption: 'RAW',
            resource: {
                values: [[value]],
            },
        });

        console.log(`✓ Cell ${cellAddress} updated`);
        return response.data;
    } catch (error) {
        console.error(`✗ Error updating cell:`, error.message);
        throw error;
    }
}

/**
 * Find rows with Status "Approved" and empty Certificate ID
 * @param {string} spreadsheetId - The spreadsheet ID
 * @returns {Promise<Array>} - Array of rows matching criteria
 */
async function getRow(spreadsheetId, rowNumber) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }
        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: `Sheet1!A${rowNumber}:I${rowNumber}`,
        });
        return response.data.values?.[0] || [];
    } catch (error) {
        console.error(`✗ Error reading row ${rowNumber} from Google Sheets:`, error.message);
        throw error;
    }
}

async function findPendingCertificates(spreadsheetId) {
    try {
        const rows = await getAllRows(spreadsheetId);

        if (rows.length < 2) {
            return []; // No data rows
        }

        // Skip header row (row 0)
        const pendingRows = rows
            .map((row, index) => ({
                rowNumber: index + 1, // 1-based row number
                data: row,
            }))
            .filter((item, index) => {
                if (index === 0) return false; // Skip header
                const row = item.data;
                // Status is column 6 (index), Certificate ID is column 7 (index)
                const status = row[6] || '';
                const certId = row[7] || '';
                // Approved rows: either certificate still missing (new) or already assigned but not completed yet
                return status === 'Approved';
            });

        return pendingRows;
    } catch (error) {
        console.error('✗ Error finding pending certificates:', error.message);
        throw error;
    }
}


module.exports = {
    initializeGoogleAuth,
    appendVolunteerToSheet,
    getAllRows,
    updateCell,
    findPendingCertificates,
    getRow,
};
