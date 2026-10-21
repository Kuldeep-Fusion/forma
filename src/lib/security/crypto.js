import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (hex string).
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} Hex encoded token
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hashes a token using SHA-256 for secure database storage.
 * @param {string} token - The raw token
 * @returns {string} Hex encoded SHA-256 hash
 */
export function hashToken(token) {
  if (!token) return "";
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

/**
 * Securely compares two strings in constant time to prevent timing attacks.
 */
export function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
