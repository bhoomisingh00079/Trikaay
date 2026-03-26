const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

const createCertificate = ({ firstName, lastName, cause, amount, transactionId, email }) => {
  const name = `${firstName} ${lastName}`.trim();
  return {
    name,
    cause,
    amount,
    transactionId,
    email,
    message: `Dear ${name},\n\nThank you for supporting ${cause.replace('_', ' ')} with a generous donation of ₹${amount}. Your support drives our mission forward.\n\nPlease retain this certificate for tax purposes. It is eligible under 80G and 10A.\n\nWith gratitude,\nTrikay Care and Creation Association`,
    taxBenefits: 'Eligible for 80G and 10A tax exemptions (Indian income tax)',
  };
};

// ✅ Fixed: was '/donate', causing /api/donate/donate double path
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, cause, amount, transactionId, email } = req.body;

    if (!firstName || !lastName || !cause || !amount || !transactionId || !email) {
      return res.status(400).json({ error: 'Missing required donation fields' });
    }

    const cert = createCertificate({ firstName, lastName, cause, amount, transactionId, email });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #27272A;">
        <h2>Thank you for your donation!</h2>
        <p>${cert.message.replace(/\n/g, '<br />')}</p>
        <ul>
          <li><strong>Name:</strong> ${cert.name}</li>
          <li><strong>Cause:</strong> ${cert.cause}</li>
          <li><strong>Donation Amount:</strong> ₹${cert.amount}</li>
          <li><strong>Transaction ID:</strong> ${cert.transactionId}</li>
        </ul>
      </div>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Your Donation Certificate from Trikay',
        html: emailHtml,
      });
    } else {
      console.log('Email config not set. Simulating email send:', {
        to: email,
        subject: 'Your Donation Certificate from Trikay',
      });
    }

    res.status(200).json({ message: 'Donation recorded', certificate: cert });

  } catch (error) {
    console.error('Donate route error:', error);
    res.status(500).json({ error: 'Failed to process donation', details: error.message });
  }
});

module.exports = router;