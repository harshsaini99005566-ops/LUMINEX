/**
 * Token Encryption Utility
 * Provides secure encryption/decryption for sensitive tokens
 * Using AES-256-GCM for authenticated encryption
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';


/**
 * Derive encryption key from master secret
 */
const deriveKey = (salt = 'instagram-tokens') => {
  const masterSecret = process.env.TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!masterSecret) {
    throw new Error('TOKEN_ENCRYPTION_KEY or JWT_SECRET must be set');
  }
  return crypto.scryptSync(masterSecret, salt, 32);
};

/**
 * Encrypt sensitive token
 * @param {string} token - The token to encrypt
 * @returns {string} Encrypted token in format: iv:authTag:encryptedData
 */
const encryptToken = (token) => {
  try {
    if (!token) return null;

    const key = deriveKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    logger.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
};

/**
 * Decrypt sensitive token
 * @param {string} encryptedToken - The encrypted token
 * @returns {string} Decrypted token
 */
const decryptToken = (encryptedToken) => {
  try {
    if (!encryptedToken || !encryptedToken.includes(':')) {
      return null;
    }

    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted token format');
    }

    const key = deriveKey();
    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Token decryption failed:', error);
    return null;
  }
};

/**
 * Encrypt multiple tokens
 * @param {Object} tokens - Object with token keys and values
 * @returns {Object} Encrypted tokens
 */
const encryptTokens = (tokens) => {
  const encrypted = {};
  for (const [key, value] of Object.entries(tokens)) {
    encrypted[key] = encryptToken(value);
  }
  return encrypted;
};

/**
 * Decrypt multiple tokens
 * @param {Object} encryptedTokens - Object with encrypted token keys and values
 * @returns {Object} Decrypted tokens
 */
const decryptTokens = (encryptedTokens) => {
  const decrypted = {};
  for (const [key, value] of Object.entries(encryptedTokens)) {
    decrypted[key] = decryptToken(value);
  }
  return decrypted;
};

/**
 * Hash token for comparison (without ability to decrypt)
 * Used for storing hashes of tokens for validation
 * @param {string} token - The token to hash
 * @returns {string} SHA-256 hash of token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify token against hash
 * @param {string} token - The token to verify
 * @param {string} hash - The hash to compare against
 * @returns {boolean} True if token matches hash
 */
const verifyTokenHash = (token, hash) => {
  return hashToken(token) === hash;
};

module.exports = {
  encryptToken,
  decryptToken,
  encryptTokens,
  decryptTokens,
  hashToken,
  verifyTokenHash,
  deriveKey,
};
