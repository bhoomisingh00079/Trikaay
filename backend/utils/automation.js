/**
 * Automation Process Module
 * Background task that runs every 10 seconds to process approved volunteers
 * and send certificates
 */

const googleSheets = require('./googleSheets');
const certificate = require('./certificate');
const emailService = require('./emailService');
const MediaAsset = require('../models/MediaAsset');
const mongoose = require('mongoose');

let isProcessing = false;
let automationInterval = null;

async function waitForMongoReady(timeoutMs = 15000) {
    const startedAt = Date.now();

    while (mongoose.connection.readyState !== 1) {
        if (Date.now() - startedAt > timeoutMs) {
            throw new Error(`MongoDB is not connected (readyState=${mongoose.connection.readyState})`);
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
}

/**
 * Process a single volunteer for certificate
 * @param {Object} row - Row data from Google Sheets
 * @param {number} rowNumber - Row number in spreadsheet
 * @param {string} spreadsheetId - Google Sheets ID
 * @param {string} [sheetTab] - Google Sheets tab name override
 * @returns {Promise<boolean>} - True if successfully processed
 */
async function processVolunteerCertificate(row, rowNumber, spreadsheetId, sheetTab) {
    try {
        // Re-read row to avoid race conditions
        const currentRow = await googleSheets.getRow(spreadsheetId, rowNumber, sheetTab);
        const name = currentRow[0];
        const phone = currentRow[1];
        const email = currentRow[2];
        const position = currentRow[3];
        const experience = currentRow[4];
        const availability = currentRow[5];
        const status = currentRow[6];
        let certId = currentRow[7];

        // Status must still be Approved
        if (status !== 'Approved') {
            console.log(`   Skipping row ${rowNumber}; status is not Approved (${status})`);
            return false;
        }

        if (!email) {
            console.warn(`   Skipping row ${rowNumber}; missing email`);
            return false;
        }

        console.log(`\n📝 Processing volunteer: ${name} (${email})`);

        // If no certificate ID yet, generate one and reserve it
        if (!certId) {
            certId = certificate.generateCertificateId();
            console.log(`   Assigned Certificate ID: ${certId}`);
            await googleSheets.updateCell(spreadsheetId, rowNumber, 7, certId, sheetTab); // Column H

            // Optionally mark processing status so it doesn't get picked up by another round
            await googleSheets.updateCell(spreadsheetId, rowNumber, 6, 'Processing', sheetTab); // Column G
        }

        // Determine certificate filename
        const safeName = name ? name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') : 'volunteer';
        const filename = `${certId}_${safeName}.pdf`;

        await waitForMongoReady();

        let pdfBuffer;
        const existingAsset = await MediaAsset.findOne({ originalName: filename }).lean();

        if (existingAsset?.data) {
            pdfBuffer = existingAsset.data;
            console.log(`   Certificate already exists in MongoDB: ${filename}`);
        } else {
            pdfBuffer = await certificate.generateCertificatePDF(
                { name, phone, email, position, experience, availability },
                certId,
                process.env.NGO_NAME || 'Our NGO'
            );

            await MediaAsset.findOneAndUpdate(
                { originalName: filename },
                {
                    originalName: filename,
                    kind: 'pdf',
                    category: 'certificate',
                    title: `Volunteer Certificate - ${name}`,
                    mimeType: 'application/pdf',
                    size: pdfBuffer.length,
                    data: pdfBuffer,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            console.log(`   Certificate stored in MongoDB: ${filename}`);
        }

        // Send certificate email (always use assigned certId)
        await emailService.sendCertificateEmail({
            to: email,
            volunteerName: name,
            certificateId: certId,
            certificateBuffer: pdfBuffer,
            certificateFileName: filename,
        });

        // Update status to Completed
        await googleSheets.updateCell(spreadsheetId, rowNumber, 6, 'Completed', sheetTab); // Column G

        console.log(`✓ Certificate sent to ${email} with ID ${certId}`);
        return true;
    } catch (error) {
        console.error(`✗ Error processing volunteer certificate:`, error.message);
        // If error happens after assigning certId, keep row in Approved for retry
        try {
            await googleSheets.updateCell(spreadsheetId, rowNumber, 6, 'Approved', sheetTab);
        } catch (innerError) {
            console.warn('⚠ Could not revert status after error:', innerError.message);
        }
        return false;
    }
}

/**
 * Main automation function - runs every 10 seconds
 * @param {string} spreadsheetId - Google Sheets ID
 * @returns {Promise<void>}
 */
async function runAutomation(spreadsheetId) {
    // Prevent overlapping executions
    if (isProcessing) {
        console.log('⏳ Automation already running, skipping this cycle');
        return;
    }

    isProcessing = true;

    try {
        console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Running automation process...`);

        // Find all rows with Status="Approved" and empty Certificate ID
        const pendingRows = await googleSheets.findPendingCertificates(spreadsheetId);

        if (pendingRows.length === 0) {
            console.log('   No pending certificates to process');
        } else {
            console.log(`   Found ${pendingRows.length} pending certificate(s)`);

            // Process each pending certificate
            for (const item of pendingRows) {
                await processVolunteerCertificate(item.data, item.rowNumber, spreadsheetId);
                // Add a small delay between processing to avoid rate limits
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            console.log(`✓ Automation cycle completed`);
        }
    } catch (error) {
        console.error('✗ Automation process error:', error.message);
    } finally {
        isProcessing = false;
    }
}

/**
 * Start the automation process
 * @param {string} spreadsheetId - Google Sheets ID
 * @param {number} interval - Interval in milliseconds (default 60000 = 60 seconds)
 * @returns {void}
 */
function startAutomation(spreadsheetId, interval = 60000) {
    if (automationInterval) {
        console.log('⚠ Automation already running');
        return;
    }

    console.log(`\n🚀 Starting automation process (runs every ${interval / 1000} seconds)`);

    // Run immediately on start
    runAutomation(spreadsheetId);

    // Set up interval
    automationInterval = setInterval(() => {
        runAutomation(spreadsheetId);
    }, interval);
}

/**
 * Stop the automation process
 * @returns {void}
 */
function stopAutomation() {
    if (automationInterval) {
        clearInterval(automationInterval);
        automationInterval = null;
        console.log('⏹ Automation process stopped');
    }
}

module.exports = {
    startAutomation,
    stopAutomation,
    runAutomation,
    processVolunteerCertificate,
};
