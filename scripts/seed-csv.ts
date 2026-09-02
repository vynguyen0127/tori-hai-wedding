/**
 * scripts/seed-csv.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports a guest list from a CSV file into the SQLite database.
 *
 * Usage:
 *   npm run seed:csv data/guests.csv
 *
 * Rules:
 *   - Uses UPSERT (INSERT OR REPLACE) for guests and households, so re-running
 *     after edits is safe — existing RSVP responses are never touched.
 *   - Validates every row before writing anything. If any row is invalid the
 *     entire import is aborted with a clear error report.
 *   - phone is normalized to 10 digits (strips formatting). Duplicates within
 *     the file are flagged as errors.
 *   - guest_id and household_id may be omitted — they will be auto-generated
 *     as "h-<index>" / "g-<index>" if blank.
 *
 * Required columns (order doesn't matter, names are case-insensitive):
 *   household_id, household_name, guest_id,
 *   first_name, last_name, phone, plus_one_allowed
 *
 * Optional columns:
 *   email
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import db from '../lib/db';
import { normalizePhone } from '../lib/phoneUtils';

// ── CLI arg ───────────────────────────────────────────────────────────────────

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npm run seed:csv <path-to-csv>');
  process.exit(1);
}

const resolved = path.resolve(csvPath);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawRow {
  lineNumber: number;
  household_id: string;
  household_name: string;
  guest_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  plus_one_allowed: string;
}

interface ValidRow {
  householdId: string;
  householdName: string;
  guestId: string;
  firstName: string;
  lastName: string;
  phone: string; // normalized 10 digits
  email: string;
  plusOneAllowed: number; // 0 | 1 for SQLite
}

interface RowError {
  lineNumber: number;
  message: string;
}

// ── CSV parser ────────────────────────────────────────────────────────────────
// We use Node's readline instead of a third-party CSV library to keep
// dependencies minimal. Handles quoted fields with commas inside them.

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function readCsv(filePath: string): Promise<RawRow[]> {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const lines: string[] = [];
  for await (const line of rl) {
    if (line.trim()) lines.push(line);
  }

  if (lines.length < 2) {
    console.error('CSV must have a header row and at least one data row.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));

  const required = ['first_name', 'last_name', 'phone', 'household_name', 'plus_one_allowed'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    console.error(`Missing required columns: ${missing.join(', ')}`);
    console.error(`Found columns: ${headers.join(', ')}`);
    process.exit(1);
  }

  const col = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line, i): RawRow => {
    const values = parseCsvLine(line);
    const get = (name: string) => values[col(name)]?.trim() ?? '';
    return {
      lineNumber:       i + 2, // +2: 1-based + skip header
      household_id:     get('household_id'),
      household_name:   get('household_name'),
      guest_id:         get('guest_id'),
      first_name:       get('first_name'),
      last_name:        get('last_name'),
      phone:            get('phone'),
      email:            get('email'),
      plus_one_allowed: get('plus_one_allowed'),
    };
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(rows: RawRow[]): { valid: ValidRow[]; errors: RowError[] } {
  const errors: RowError[] = [];
  const valid: ValidRow[]  = [];
  const seenPhones         = new Map<string, number>(); // phone → lineNumber
  const seenGuestIds       = new Map<string, number>();

  rows.forEach((row, i) => {
    const rowErrors: string[] = [];

    // Required text fields
    if (!row.first_name) rowErrors.push('first_name is required');
    if (!row.last_name)  rowErrors.push('last_name is required');
    if (!row.household_name) rowErrors.push('household_name is required');

    // Phone normalization
    const phone = normalizePhone(row.phone);
    if (!phone) {
      rowErrors.push(`invalid phone "${row.phone}" — must contain 10 digits`);
    } else {
      const prev = seenPhones.get(phone);
      if (prev !== undefined) {
        rowErrors.push(`duplicate phone (already on line ${prev})`);
      } else {
        seenPhones.set(phone, row.lineNumber);
      }
    }

    // plus_one_allowed
    const plusOneRaw = row.plus_one_allowed.toUpperCase();
    if (!['TRUE', 'FALSE', '1', '0', 'YES', 'NO', ''].includes(plusOneRaw)) {
      rowErrors.push(`plus_one_allowed must be TRUE or FALSE, got "${row.plus_one_allowed}"`);
    }

    // Auto-generate IDs if omitted
    const householdId = row.household_id || `h-${i + 1}`;
    const guestId     = row.guest_id     || `g-${i + 1}`;

    if (seenGuestIds.has(guestId)) {
      rowErrors.push(`duplicate guest_id "${guestId}" (already on line ${seenGuestIds.get(guestId)})`);
    } else {
      seenGuestIds.set(guestId, row.lineNumber);
    }

    if (rowErrors.length > 0) {
      errors.push({ lineNumber: row.lineNumber, message: rowErrors.join('; ') });
      return;
    }

    const plusOneAllowed = ['TRUE', '1', 'YES'].includes(plusOneRaw) ? 1 : 0;

    valid.push({
      householdId,
      householdName: row.household_name,
      guestId,
      firstName:     row.first_name,
      lastName:      row.last_name,
      phone:         phone!,
      email:         row.email,
      plusOneAllowed,
    });
  });

  return { valid, errors };
}

// ── Database write ────────────────────────────────────────────────────────────

const upsertHousehold = db.prepare(`
  INSERT INTO households (id, name) VALUES (?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name
`);

const upsertGuest = db.prepare(`
  INSERT INTO guests
    (id, household_id, first_name, last_name, phone, email, plus_one_allowed)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    household_id     = excluded.household_id,
    first_name       = excluded.first_name,
    last_name        = excluded.last_name,
    phone            = excluded.phone,
    email            = excluded.email,
    plus_one_allowed = excluded.plus_one_allowed
`);

const importAll = db.transaction((rows: ValidRow[]) => {
  for (const row of rows) {
    upsertHousehold.run(row.householdId, row.householdName);
    upsertGuest.run(
      row.guestId,
      row.householdId,
      row.firstName,
      row.lastName,
      row.phone,
      row.email,
      row.plusOneAllowed
    );
  }
});

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nReading ${resolved}…`);
  const rawRows = await readCsv(resolved);
  console.log(`  ${rawRows.length} data row(s) found`);

  const { valid, errors } = validate(rawRows);

  if (errors.length > 0) {
    console.error(`\n✗ Import aborted — ${errors.length} error(s) found:\n`);
    errors.forEach(({ lineNumber, message }) => {
      console.error(`  Line ${lineNumber}: ${message}`);
    });
    console.error('\nFix the errors above and re-run.');
    process.exit(1);
  }

  importAll(valid);

  // Summary
  const guestCount = (db.prepare('SELECT COUNT(*) as n FROM guests').get() as { n: number }).n;
  const houseCount = (db.prepare('SELECT COUNT(*) as n FROM households').get() as { n: number }).n;

  console.log(`\n✓ Import complete`);
  console.log(`  ${valid.length} guest(s) upserted from CSV`);
  console.log(`  Database now has ${guestCount} guest(s) across ${houseCount} household(s)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
