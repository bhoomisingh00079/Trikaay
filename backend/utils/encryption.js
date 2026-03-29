/**
 * Encryption Utility for Sensitive Data
 * Uses crypto-js for AES encryption at rest
 */

const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters for AES-256');
}

/**
 * Encrypt a string value
 * @param {string} plaintext - Value to encrypt
 * @returns {string} - Encrypted value
 */
function encrypt(plaintext) {
  if (!plaintext) return '';
  try {
    return CryptoJS.AES.encrypt(String(plaintext), ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param {string} ciphertext - Encrypted value
 * @returns {string} - Decrypted value
 */
function decrypt(ciphertext) {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

module.exports = {
  encrypt,
  decrypt,
};
