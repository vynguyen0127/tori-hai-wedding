/**
 * scripts/seed-csv.ts
 * Usage: npm run seed:csv data/guests.csv
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import db, { ensureSchema } from '../lib/db';
import { upsertHousehold, upsertGuest } from '../lib/guests';
import { normalizePhone } from '../lib/phoneUtils';

const csvPath = process.argv[2];
if (!csvPath) { console.error('Usage: npm run seed:csv <path-to-csv>'); process.exit(1); }

const resolved = path.resolve(csvPath);
if (!fs.existsSync(resolved)) { console.error(`File not found: ${resolved}`); process.exit(1); }

interface RawRow {
  lineNumber: number;
  household_id: string; household_name: string; guest_id: string;
  first_name: string; last_name: string; phone: string;
  email: string; plus_one_allowed: string;
}

interface ValidRow {
  householdId: string; householdName: string; guestId: string;
  firstName: string; lastName: string; phone: string;
  email: string; plusOneAllowed: number;
}

interface RowError { lineNumber: number; message: string; }

function parseCsvLine(line: string): string[] {
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

async function readCsv(filePath: string): Promise<RawRow[]> {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  const lines: string[] = [];
  for await (const line of rl) { if (line.trim()) lines.push(line); }

  if (lines.length < 2) { console.error('CSV must have a header row and at least one data row.'); process.exit(1); }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const required = ['first_name', 'last_name', 'phone', 'household_name', 'plus_one_allowed'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    console.error(`Missing required columns: ${missing.join(', ')}\nFound: ${headers.join(', ')}`);
    process.exit(1);
  }

  const col = (name: string) => headers.indexOf(name);
  return lines.slice(1).map((line, i): RawRow => {
    const values = parseCsvLine(line);
    const get = (name: string) => values[col(name)]?.trim() ?? '';
    return {
      lineNumber: i + 2,
      household_id: get('household_id'), household_name: get('household_name'),
      guest_id: get('guest_id'), first_name: get('first_name'), last_name: get('last_name'),
      phone: get('phone'), email: get('email'), plus_one_allowed: get('plus_one_allowed'),
    };
  });
}

function validate(rows: RawRow[]): { valid: ValidRow[]; errors: RowError[] } {
  const errors: RowError[] = [];
  const valid: ValidRow[] = [];
  const seenPhones = new Map<string, number>();
  const seenGuestIds = new Map<string, number>();

  rows.forEach((row, i) => {
    const rowErrors: string[] = [];

    if (!row.first_name)     rowErrors.push('first_name is required');
    if (!row.last_name)      rowErrors.push('last_name is required');
    if (!row.household_name) rowErrors.push('household_name is required');

    const phone = normalizePhone(row.phone);
    if (!phone) {
      rowErrors.push(`invalid phone "${row.phone}" — must contain 10 digits`);
    } else {
      const prev = seenPhones.get(phone);
      if (prev !== undefined) rowErrors.push(`duplicate phone (already on line ${prev})`);
      else seenPhones.set(phone, row.lineNumber);
    }

    const plusOneRaw = row.plus_one_allowed.toUpperCase();
    if (!['TRUE', 'FALSE', '1', '0', 'YES', 'NO', ''].includes(plusOneRaw))
      rowErrors.push(`plus_one_allowed must be TRUE or FALSE, got "${row.plus_one_allowed}"`);

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

    valid.push({
      householdId, householdName: row.household_name, guestId,
      firstName: row.first_name, lastName: row.last_name,
      phone: phone!, email: row.email,
      plusOneAllowed: ['TRUE', '1', 'YES'].includes(plusOneRaw) ? 1 : 0,
    });
  });

  return { valid, errors };
}

async function main() {
  console.log(`\nReading ${resolved}…`);
  const rawRows = await readCsv(resolved);
  console.log(`  ${rawRows.length} data row(s) found`);

  const { valid, errors } = validate(rawRows);

  if (errors.length > 0) {
    console.error(`\n✗ Import aborted — ${errors.length} error(s) found:\n`);
    errors.forEach(({ lineNumber, message }) => console.error(`  Line ${lineNumber}: ${message}`));
    console.error('\nFix the errors above and re-run.');
    process.exit(1);
  }

  await ensureSchema();

  for (const row of valid) {
    await upsertHousehold(row.householdId, row.householdName);
    await upsertGuest({
      id: row.guestId, householdId: row.householdId,
      firstName: row.firstName, lastName: row.lastName,
      phone: row.phone, email: row.email,
      plusOneAllowed: row.plusOneAllowed,
    });
  }

  const guestCount = ((await db.execute('SELECT COUNT(*) as n FROM guests')).rows[0] as unknown as { n: number }).n;
  const houseCount = ((await db.execute('SELECT COUNT(*) as n FROM households')).rows[0] as unknown as { n: number }).n;

  console.log(`\n✓ Import complete`);
  console.log(`  ${valid.length} guest(s) upserted`);
  console.log(`  Database now has ${guestCount} guest(s) across ${houseCount} household(s)\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
