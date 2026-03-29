/**
 * Email Sending Module
 * Handles sending emails via Gmail
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

// Email transporter (initialized in setup)
let transporter;

/**
 * Initialize email transporter
 * @param {string} email - Gmail email address
 * @param {string} appPassword - Gmail App Password
 * @returns {Promise<void>}
 */
async function initializeEmailService(email, appPassword) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: appPassword,
            },
        });

        // Test the connection
        await transporter.verify();
        console.log('✓ Email service initialized successfully');
    } catch (error) {
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
        if (!transporter) {
            throw new Error('Email service not initialized');
        }

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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
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

        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Certificate email sent to ${to}. Message ID: ${info.messageId}`);
        return info;
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
        if (!transporter) {
            throw new Error('Email service not initialized');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
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
