/**
 * Normalizes a phone number to 10 digits (US).
 * Strips all non-numeric characters, then takes the last 10 digits.
 * Returns null if fewer than 10 digits are present.
 */
export function normalizePhone(raw: unknown): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.slice(-10); // handles +1 country code gracefully
}

export function formatPhone(normalized: string): string {
  if (normalized.length !== 10) return normalized;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}
