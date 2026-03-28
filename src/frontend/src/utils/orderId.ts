// Charset: uppercase letters + digits, excluding confusing chars O, 0, I, 1
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars

/**
 * Encodes a numeric order ID into a 5-char alphanumeric code.
 * Deterministic but non-sequential-looking.
 */
export function formatOrderId(id: number): string {
  // Multiply by a large prime to scramble, keep as 32-bit unsigned
  let n = Math.imul(id, 2654435761) >>> 0;
  // XOR with another pattern for more mixing
  n = (n ^ (n >>> 16)) >>> 0;
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += CHARS[n % CHARS.length];
    n = Math.floor(n / CHARS.length);
  }
  return result;
}

/**
 * Tries to reverse a formatted order ID code back to a numeric ID.
 * Brute-forces up to maxId to find a match. Returns null if not found.
 */
export function decodeOrderId(code: string, maxId = 10000): number | null {
  const normalized = code.toUpperCase().trim();
  for (let id = 1; id <= maxId; id++) {
    if (formatOrderId(id) === normalized) return id;
  }
  return null;
}
