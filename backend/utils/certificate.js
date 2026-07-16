/**
 * Certificate Generation Module
 * Generates PDF certificates for approved volunteers
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Certificate ID tracking file
const CERT_ID_FILE = path.join(__dirname, '../certId.json');

/**
 * Load the last certificate ID from file
 * @returns {number} - Last certificate ID number
 */
function getLastCertificateId() {
    try {
        if (fs.existsSync(CERT_ID_FILE)) {
            const data = fs.readFileSync(CERT_ID_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            return parsed.lastId || 0;
        }
    } catch (error) {
        console.warn('⚠ Could not read cert ID file:', error.message);
    }
    return 0;
}

/**
 * Save the certificate ID to file
 * @param {number} id - Certificate ID number
 * @returns {void}
 */
function saveLastCertificateId(id) {
    try {
        const dir = path.dirname(CERT_ID_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CERT_ID_FILE, JSON.stringify({ lastId: id }), 'utf-8');
    } catch (error) {
        console.error('✗ Error saving cert ID:', error.message);
    }
}

let certIdQueue = Promise.resolve();

/**
 * Generate the next certificate ID in format CERT-XXXX
 * @returns {Promise<string>} - Next certificate ID
 */
async function generateCertificateId() {
    const prev = certIdQueue;
    let release;
    certIdQueue = new Promise(resolve => { release = resolve; });
    await prev;
    try {
        const lastId = getLastCertificateId();
        const nextId = lastId + 1;
        saveLastCertificateId(nextId);
        return `CERT-${String(nextId).padStart(4, '0')}`;
    } finally {
        release();
    }
}

/**
 * Generate a PDF certificate for a volunteer
 * @param {Object} volunteerData - Volunteer information
 * @param {string} volunteerData.name - Volunteer name
 * @param {string} certificateId - Certificate ID
 * @param {string} ngoName - NGO organization name
 * @returns {Promise<Buffer>} - PDF buffer
 */
function generateCertificatePDF(volunteerData, certificateId, ngoName = 'Our NGO') {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            let pdfBuffer = Buffer.alloc(0);

            // Collect PDF data
            doc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });

            doc.on('end', () => {
                resolve(pdfBuffer);
            });

            doc.on('error', (error) => {
                reject(error);
            });

            // Add decorative border
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const margin = 30;

            // Draw border
            doc.lineWidth(3)
                .strokeColor('#1f2937')
                .rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
                .stroke();

            // Add inner decorative border
            doc.lineWidth(1)
                .strokeColor('#3b82f6')
                .rect(margin + 10, margin + 10, pageWidth - 2 * (margin + 10), pageHeight - 2 * (margin + 10))
                .stroke();

            // Add title
            doc.fontSize(40)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text('Certificate of Appreciation', { align: 'center' })
                .moveDown(0.5);

            // Add subtitle
            doc.fontSize(14)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('This is proudly presented to', { align: 'center' })
                .moveDown(1);

            // Volunteer name
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text(volunteerData.name, { align: 'center', underline: true })
                .moveDown(1);

            // Certificate message
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#374151')
                .text('In recognition of your outstanding commitment and dedication', { align: 'center' })
                .text('as a valued volunteer with', { align: 'center' })
                .moveDown(0.5);

            // NGO name
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text(ngoName, { align: 'center' })
                .moveDown(1.5);

            // Details section
            doc.fontSize(11)
                .font('Helvetica')
                .fillColor('#374151');

            const leftMargin = 100;
            const detailsY = doc.y;

            // Date
            const today = new Date();
            const dateStr = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            doc.text(`Date: ${dateStr}`, leftMargin, detailsY);
            doc.moveDown(1.5);

            // Certificate ID
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text(`Certificate ID: ${certificateId}`, leftMargin, doc.y);

            // Add signature line
            doc.moveDown(3);
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Authorized Signature', leftMargin, doc.y, { align: 'center' })
                .moveTo(leftMargin - 20, doc.y - 20)
                .lineTo(leftMargin + 20, doc.y - 20)
                .stroke();

            // Finalize PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Save certificate PDF to file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} filename - Filename to save as
 * @returns {Promise<string>} - Full file path
 */
async function saveCertificateToFile(pdfBuffer, filename) {
    try {
        const certificatesDir = path.join(__dirname, '../certificates');

        // Create certificates directory if it doesn't exist
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }

        const filePath = path.join(certificatesDir, filename);
        fs.writeFileSync(filePath, pdfBuffer);

        console.log(`✓ Certificate saved: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('✗ Error saving certificate:', error.message);
        throw error;
    }
}

module.exports = {
    generateCertificateId,
    generateCertificatePDF,
    saveCertificateToFile,
    getLastCertificateId,
};
