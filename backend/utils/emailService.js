/**
 * Email Sending Module
 * Handles sending emails via Gmail
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

// Email transporter (initialized in setup)
let transporter;
let transporterConfig = null;

function createTransporter(email, appPassword) {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: appPassword,
        },
    });
}

function shouldRetrySend(error) {
    if (!error) return false;
    const retryableCodes = new Set(['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EPIPE']);
    if (retryableCodes.has(error.code)) return true;

    const message = String(error.message || '').toLowerCase();
    return (
        message.includes('connection closed') ||
        message.includes('socket hang up') ||
        message.includes('timeout') ||
        message.includes('greeting never received')
    );
}

async function ensureEmailServiceReady() {
    if (!transporterConfig?.email || !transporterConfig?.appPassword) {
        throw new Error('Email service credentials are not configured');
    }

    // If transporter exists, verify it's still alive
    if (transporter) {
        try {
            await transporter.verify();
            return;
        } catch (_verifyError) {
            console.warn('⚠ Existing email transporter failed verification, recreating...', _verifyError.message);
            transporter = null;
        }
    }

    // Create a fresh transporter and verify before persisting
    const newTransporter = createTransporter(transporterConfig.email, transporterConfig.appPassword);
    await newTransporter.verify();
    transporter = newTransporter;
    console.log('✓ Email transporter (re)initialized successfully');
}

/**
 * Initialize email transporter
 * @param {string} email - Gmail email address
 * @param {string} appPassword - Gmail App Password
 * @returns {Promise<void>}
 */
async function initializeEmailService(email, appPassword) {
    try {
        if (!email || !appPassword) {
            throw new Error('Email and app password are required to initialize email service');
        }

        transporterConfig = {
            email: String(email).trim(),
            appPassword: String(appPassword).trim(),
        };

        // Create and verify before persisting — if verify fails, transporter stays null
        const newTransporter = createTransporter(transporterConfig.email, transporterConfig.appPassword);
        await newTransporter.verify();
        transporter = newTransporter;

        console.log('✓ Email service initialized successfully');
    } catch (error) {
        transporter = null; // Ensure transporter is cleared on failure
        console.error('✗ Email service initialization failed:', error.message);
        throw error;
    }
}

/**
 * Send certificate email to volunteer
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.volunteerName - Volunteer name
 * @param {string} params.certificateId - Certificate ID
 * @param {string} params.certificatePath - Path to certificate PDF file
 * @returns {Promise<Object>} - Email send result
 */
async function sendCertificateEmail(params) {
    try {
        await ensureEmailServiceReady();

        const {
            to,
            volunteerName,
            certificateId,
            certificatePath,
            certificateBuffer,
            certificateFileName,
        } = params;

        const attachment = {
            filename: certificateFileName || `${certificateId}.pdf`,
        };

        if (Buffer.isBuffer(certificateBuffer)) {
            attachment.content = certificateBuffer;
        } else if (certificatePath) {
            if (!fs.existsSync(certificatePath)) {
                throw new Error(`Certificate file not found: ${certificatePath}`);
            }
            attachment.path = certificatePath;
        } else {
            throw new Error('Certificate attachment missing: provide certificateBuffer or certificatePath');
        }

        const normalizedTo = String(to || '').trim();
        if (!normalizedTo) {
            throw new Error('Recipient email is required');
        }

        const fromAddress = process.env.EMAIL_FROM || transporterConfig?.email || process.env.EMAIL_USER;

        const mailOptions = {
            from: fromAddress,
            to: normalizedTo,
            subject: 'Your Volunteer Certificate',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Dear ${volunteerName},</h2>
                    <p>Thank you for your exceptional commitment and dedication as a valued volunteer with us!</p>
                    <p>We are delighted to present you with your <strong>Certificate of Appreciation</strong> for your outstanding contributions.</p>
                    <p><strong>Your Certificate ID:</strong> ${certificateId}</p>
                    <p>Please find your certificate attached to this email. We look forward to your continued support in our mission to make a difference.</p>
                    <p>If you have any questions, feel free to reach out to us.</p>
                    <br/>
                    <p>With gratitude,</p>
                    <p><strong>Our NGO Team</strong></p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">
                        This is an automated email. Please do not reply directly to this email.
                    </p>
                </div>
            `,
            attachments: [
                attachment,
            ],
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✓ Certificate email sent to ${normalizedTo}. Message ID: ${info.messageId}`);
            return info;
        } catch (error) {
            if (!shouldRetrySend(error)) {
                throw error;
            }

            console.warn(`⚠ Email send failed (transient): ${error.message}. Reinitializing transporter and retrying once...`);
            transporter = null;
            await ensureEmailServiceReady();

            const retryInfo = await transporter.sendMail(mailOptions);
            console.log(`✓ Certificate email sent on retry to ${normalizedTo}. Message ID: ${retryInfo.messageId}`);
            return retryInfo;
        }
    } catch (error) {
        console.error('✗ Error sending certificate email:', error.message);
        throw error;
    }
}

/**
 * Send registration confirmation email
 * @param {string} to - Recipient email
 * @param {string} volunteerName - Volunteer name
 * @returns {Promise<Object>} - Email send result
 */
async function sendRegistrationConfirmation(to, volunteerName) {
    try {
        await ensureEmailServiceReady();

        const normalizedTo = String(to || '').trim();
        if (!normalizedTo) {
            throw new Error('Recipient email is required');
        }

        const fromAddress = process.env.EMAIL_FROM || transporterConfig?.email || process.env.EMAIL_USER;

        const mailOptions = {
            from: fromAddress,
            to: normalizedTo,
            subject: 'Registration Received - Volunteer Application',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hello ${volunteerName},</h2>
                    <p>Thank you for registering with us as a volunteer!</p>
                    <p>We have received your application and will review it carefully. Our team will contact you shortly with next steps.</p>
                    <p>We appreciate your interest in making a difference with our organization.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p><strong>Our NGO Team</strong></p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Registration confirmation email sent to ${to}`);
        return info;
    } catch (error) {
        console.error('✗ Error sending confirmation email:', error.message);
        // Don't throw - this is non-critical
        return null;
    }
}

module.exports = {
    initializeEmailService,
    sendCertificateEmail,
    sendRegistrationConfirmation,
};
