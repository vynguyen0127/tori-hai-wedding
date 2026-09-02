/**
 * lib/csv-import.ts
 * Shared CSV parsing, validation, and import logic used by both the
 * seed-csv CLI script and the /api/admin/import-csv API route.
 */

import { normalizePhone } from './phoneUtils';
import { upsertHousehold, upsertGuest } from './guests';
import { ensureSchema } from './db';

export interface ImportRow {
  householdId: string;
  householdName: string;
  guestId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  plusOneAllowed: number;
}

export interface RowError {
  lineNumber: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  errors: RowError[];
}

// ── CSV parser ────────────────────────────────────────────────────────────────

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim()); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Validate + parse raw CSV text ─────────────────────────────────────────────

export function parseCsvText(csvText: string): { valid: ImportRow[]; errors: RowError[] } {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    return { valid: [], errors: [{ lineNumber: 1, message: 'CSV must have a header row and at least one data row.' }] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const required = ['first_name', 'last_name', 'phone', 'household_name', 'plus_one_allowed'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    return {
      valid: [],
      errors: [{ lineNumber: 1, message: `Missing required columns: ${missing.join(', ')}` }],
    };
  }

  const col = (name: string) => headers.indexOf(name);
  const errors: RowError[] = [];
  const valid: ImportRow[] = [];
  const seenPhones = new Map<string, number>();
  const seenGuestIds = new Map<string, number>();

  lines.slice(1).forEach((line, i) => {
    const lineNumber = i + 2;
    const values = parseCsvLine(line);
    const get = (name: string) => values[col(name)]?.trim() ?? '';

    const rowErrors: string[] = [];
    const firstName    = get('first_name');
    const lastName     = get('last_name');
    const householdName = get('household_name');
    const plusOneRaw   = get('plus_one_allowed').toUpperCase();

    if (!firstName)     rowErrors.push('first_name is required');
    if (!lastName)      rowErrors.push('last_name is required');
    if (!householdName) rowErrors.push('household_name is required');

    const phone = normalizePhone(get('phone'));
    if (!phone) {
      rowErrors.push(`invalid phone "${get('phone')}" — must contain 10 digits`);
    } else {
      const prev = seenPhones.get(phone);
      if (prev !== undefined) rowErrors.push(`duplicate phone (already on line ${prev})`);
      else seenPhones.set(phone, lineNumber);
    }

    if (!['TRUE', 'FALSE', '1', '0', 'YES', 'NO', ''].includes(plusOneRaw)) {
      rowErrors.push(`plus_one_allowed must be TRUE or FALSE, got "${get('plus_one_allowed')}"`);
    }

    const householdId = get('household_id') || `h-${i + 1}`;
    const guestId     = get('guest_id')     || `g-${i + 1}`;

    if (seenGuestIds.has(guestId)) {
      rowErrors.push(`duplicate guest_id "${guestId}" (already on line ${seenGuestIds.get(guestId)})`);
    } else {
      seenGuestIds.set(guestId, lineNumber);
    }

    if (rowErrors.length > 0) {
      errors.push({ lineNumber, message: rowErrors.join('; ') });
      return;
    }

    valid.push({
      householdId,
      householdName,
      guestId,
      firstName,
      lastName,
      phone: phone!,
      email: get('email'),
      plusOneAllowed: ['TRUE', '1', 'YES'].includes(plusOneRaw) ? 1 : 0,
    });
  });

  return { valid, errors };
}

// ── Write to DB ───────────────────────────────────────────────────────────────

export async function importRows(rows: ImportRow[]): Promise<void> {
  await ensureSchema();
  for (const row of rows) {
    await upsertHousehold(row.householdId, row.householdName);
    await upsertGuest({
      id: row.guestId, householdId: row.householdId,
      firstName: row.firstName, lastName: row.lastName,
      phone: row.phone, email: row.email,
      plusOneAllowed: row.plusOneAllowed,
    });
  }
}
