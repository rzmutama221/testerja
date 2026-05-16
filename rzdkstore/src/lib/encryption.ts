import crypto from 'crypto';

/**
 * Encryption utilities for sensitive data in database.
 * Menggunakan AES-256-GCM dengan key dari environment variable ENCRYPTION_KEY.
 *
 * Digunakan untuk enkripsi:
 * - Password akun Netflix/ChatGPT head
 * - Stok digital (product_stock_items.content)
 * - Info fulfillment (order_fulfillments.content)
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY harus diset di .env dan minimal 32 karakter'
    );
  }
  // Ambil 32 byte pertama sebagai key
  return Buffer.from(key.slice(0, 32), 'utf-8');
}

/**
 * Encrypt plaintext menggunakan AES-256-GCM.
 * Output format: iv:authTag:ciphertext (semua hex)
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt ciphertext yang dienkripsi dengan encrypt().
 * Input format: iv:authTag:ciphertext (semua hex)
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Format encrypted text tidak valid');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
