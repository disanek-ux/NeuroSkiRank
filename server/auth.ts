import crypto from "crypto";

/**
 * Hash a password using PBKDF2 with SHA-256.
 * This is a simple, built-in approach without external dependencies.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keylen = 64;
  const digest = "sha256";

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString("hex");

  // Format: salt$hash
  return `${salt}$${hash}`;
}

/**
 * Verify a password against a hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split("$");
  if (!salt || !storedHash) return false;

  const iterations = 100000;
  const keylen = 64;
  const digest = "sha256";

  const computedHash = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString("hex");

  return computedHash === storedHash;
}

/**
 * Generate a secure random token for email verification or password reset.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format (basic check).
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 * Requirements: at least 8 characters, at least one uppercase, one lowercase, one number.
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
