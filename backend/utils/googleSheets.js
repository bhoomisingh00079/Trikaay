/**
 * Google Sheets Integration Module
 * Handles authentication and data operations with Google Sheets
 */

const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets and Drive APIs
const sheets = google.sheets('v4');
const drive = google.drive('v3');

// Target Google Sheet tab name (space-safe quoted when needed)
const SHEET_TAB = process.env.SHEET_TAB || process.env.SHEET_NAME || 'Volunteer Registrations';

function getSheetRange(subRange, tabOverride) {
    const tab = tabOverride || process.env.VOLUNTEERS_SHEET_TAB || SHEET_TAB;
    const needsQuotes = /\s|[^A-Za-z0-9_]/.test(tab);
    const tabName = needsQuotes ? `'${String(tab).replace(/'/g, "\\'")}'` : tab;
    return `${tabName}!${subRange}`;
}

// Service account credentials from environment
let auth;

/**
 * Initialize Google authentication with service account
 * @returns {Promise<void>}
 */
async function initializeGoogleAuth() {
    try {
        // Correct long-term method using environment variables directly
        auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
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
async function appendVolunteerToSheet(spreadsheetId, volunteerData, tabName) {
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

        const sheetRange = getSheetRange('A2', tabName);
        console.log(`📝 Appending to sheet - Range: ${sheetRange}`);

        const response = await sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: sheetRange,
            valueInputOption: 'RAW',
            resource: resource,
        });

        console.log(`✓ Volunteer data appended to sheet. Row: ${response.data.updates.updatedRows}`);
        return response.data;
    } catch (error) {
        console.error('✗ Error appending to Google Sheets:', error.message);
        console.error('   Full error:', error);
        throw error;
    }
}

/**
 * Get all rows from Google Sheets
 * @param {string} spreadsheetId - The spreadsheet ID
 * @returns {Promise<Array>} - Array of row data
 */
async function getAllRows(spreadsheetId, tabName) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }

        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: getSheetRange('A:J', tabName), // Get all rows and columns A-J (including registration date)
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
async function updateCell(spreadsheetId, rowIndex, colIndex, value, tabName) {
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
            range: getSheetRange(cellAddress, tabName),
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
async function getRow(spreadsheetId, rowNumber, tabName) {
    try {
        if (!auth) {
            throw new Error('Google auth not initialized');
        }
        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: getSheetRange(`A${rowNumber}:J${rowNumber}`, tabName),
        });
        return response.data.values?.[0] || [];
    } catch (error) {
        console.error(`✗ Error reading row ${rowNumber} from Google Sheets:`, error.message);
        throw error;
    }
}

async function findPendingCertificates(spreadsheetId, tabName) {
    try {
        const rows = await getAllRows(spreadsheetId, tabName);

        if (rows.length < 2) {
            return []; // No data rows
        }

        // Skip header row (row 0). Only return rows that are strictly "Approved"
        // with NO certificate ID assigned yet. Rows already in "Processing" or
        // "Completed" (or with a certId) must be ignored here so the
        // /sheets-event webhook cannot double-send email.
        const pendingRows = rows
            .map((row, index) => ({
                rowNumber: index + 1, // 1-based row number
                data: row,
            }))
            .filter((item, index) => {
                if (index === 0) return false; // Skip header
                const row = item.data;
                const status = String(row[6] || '').trim();
                const certId = String(row[7] || '').trim();
                return status === 'Approved' && !certId;
            });

        return pendingRows;
    } catch (error) {
        console.error('✗ Error finding pending certificates:', error);
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
