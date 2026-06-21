/**
 * Normalizes a phone number to 10 digits (US).
 * Strips all non-numeric characters, then takes the last 10 digits.
 *
 * Examples:
 *   "(800) 555-1234"  → "8005551234"
 *   "+1 800 555 1234" → "8005551234"
 *   "8005551234"      → "8005551234"
 *
 * Returns null if fewer than 10 digits are present.
 */
export function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.slice(-10); // handles +1 country code gracefully
}

/**
 * Formats a normalized 10-digit phone number for display.
 * "8005551234" → "(800) 555-1234"
 */
export function formatPhone(normalized) {
  if (!normalized || normalized.length !== 10) return normalized;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}
