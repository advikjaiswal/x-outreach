const crypto = require('crypto');

// Ensure you set a strong, 32-byte key in your .env file
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('A 32-byte ENCRYPTION_KEY is required in your environment variables. Generate one with `crypto.randomBytes(16).toString(\'hex\')`');
}

const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a piece of text.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text, formatted as iv:encryptedData
 */
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a piece oftext.
 * @param {string} text - The encrypted text (iv:encryptedData).
 * @returns {string} - The decrypted text.
 */
function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };