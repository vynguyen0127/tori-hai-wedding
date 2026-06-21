/**
 * lib/sheets.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Sheets client for the wedding RSVP guest list.
 *
 * Expected sheet tab name: "guests" (configurable via GOOGLE_SHEETS_TAB)
 *
 * Column layout (Row 1 = headers, data starts at Row 2):
 *   A  guest_id          Unique ID per guest (e.g. g001, g002…)
 *   B  household_id      Groups guests into a household (e.g. h001)
 *   C  household_name    Display name (e.g. "The Nguyen Family")
 *   D  first_name
 *   E  last_name
 *   F  phone             Stored as 10 digits (e.g. 8005551234)
 *   G  email             Optional
 *   H  rsvp_status       "pending" | "attending" | "declined"
 *   I  meal_preference   e.g. "chicken" | "fish" | "vegetarian"
 *   J  dietary_notes     Free text
 *   K  song_request      Free text
 *   L  plus_one_allowed  TRUE | FALSE
 *   M  plus_one_name     Filled in when RSVP is submitted
 *   N  rsvp_submitted_at ISO timestamp
 */

import { google } from 'googleapis';

// ── Config ────────────────────────────────────────────────────────────────────

const SPREADSHEET_ID  = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME      = process.env.GOOGLE_SHEETS_TAB ?? 'guests';
const CACHE_TTL_MS    = Number(process.env.CACHE_TTL_MS ?? 60_000);

// Column indices (0-based, matching the layout above)
const COL = {
  GUEST_ID:          0,
  HOUSEHOLD_ID:      1,
  HOUSEHOLD_NAME:    2,
  FIRST_NAME:        3,
  LAST_NAME:         4,
  PHONE:             5,
  EMAIL:             6,
  RSVP_STATUS:       7,
  MEAL_PREFERENCE:   8,
  DIETARY_NOTES:     9,
  SONG_REQUEST:      10,
  PLUS_ONE_ALLOWED:  11,
  PLUS_ONE_NAME:     12,
  RSVP_SUBMITTED_AT: 13,
};

// Column letters for write operations (A=0 … N=13)
const COL_LETTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const colLetter = (idx) => COL_LETTER[idx];

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set.');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

// ── In-memory cache ───────────────────────────────────────────────────────────
// Avoids hammering the Sheets API on every page load.
// The cache is busted after CACHE_TTL_MS, or you can call getAllGuests(true).

let _cache = { rows: null, fetchedAt: 0 };

/**
 * Returns all guest rows from the sheet.
 * Each item is { guest, rowIndex } where rowIndex is the 1-based sheet row
 * (used for targeted cell updates on submit).
 *
 * @param {boolean} forceRefresh  Skip cache and re-fetch from Sheets
 */
export async function getAllGuests(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cache.rows && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.rows;
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:N`, // Row 1 is headers
  });

  const rawRows = res.data.values ?? [];

  // Map each raw row to a structured object, keeping track of its sheet row index.
  // rawRows[0] is sheet row 2 (row 1 is the header).
  const rows = rawRows
    .map((row, i) => ({
      rowIndex: i + 2, // 1-based sheet row number
      guest: rowToGuest(row),
    }))
    .filter((r) => r.guest !== null);

  _cache = { rows, fetchedAt: now };
  return rows;
}

// ── Lookup ────────────────────────────────────────────────────────────────────

/**
 * Finds the household for a normalized phone number.
 *
 * @param {string} normalizedPhone  10-digit string, e.g. "8005551234"
 * @returns {{ householdId: string, householdName: string, guests: Guest[] } | null}
 */
export async function findHouseholdByPhone(normalizedPhone) {
  const allRows = await getAllGuests();

  // Find the guest whose phone matches
  const match = allRows.find((r) => r.guest.phone === normalizedPhone);
  if (!match) return null;

  const { householdId, householdName } = match.guest;

  // Return every guest in the same household
  const householdRows = allRows.filter((r) => r.guest.householdId === householdId);
  const guests = householdRows.map((r) => r.guest);

  return { householdId, householdName, guests };
}

// ── Submit ────────────────────────────────────────────────────────────────────

/**
 * Writes RSVP responses back to the sheet.
 *
 * @param {RsvpResponse[]} responses
 *   Array of { guestId, status, mealPreference, dietaryNotes, songRequest, plusOneName }
 */
export async function submitRsvp(responses) {
  // Re-fetch (bypassing cache) to get fresh row indices before writing.
  const allRows = await getAllGuests(true);
  const rowMap = Object.fromEntries(allRows.map((r) => [r.guest.guestId, r.rowIndex]));

  const now = new Date().toISOString();
  const sheets = getSheetsClient();

  // Build a batch of value ranges — one per cell we want to update.
  const data = [];

  for (const rsvp of responses) {
    const rowIndex = rowMap[rsvp.guestId];
    if (!rowIndex) {
      console.warn(`submitRsvp: guest ${rsvp.guestId} not found in sheet, skipping.`);
      continue;
    }

    const updates = [
      { col: COL.RSVP_STATUS,       value: rsvp.status          ?? 'pending'  },
      { col: COL.MEAL_PREFERENCE,   value: rsvp.mealPreference  ?? ''         },
      { col: COL.DIETARY_NOTES,     value: rsvp.dietaryNotes    ?? ''         },
      { col: COL.SONG_REQUEST,      value: rsvp.songRequest      ?? ''         },
      { col: COL.PLUS_ONE_NAME,     value: rsvp.plusOneName      ?? ''         },
      { col: COL.RSVP_SUBMITTED_AT, value: now                                },
    ];

    for (const { col, value } of updates) {
      data.push({
        range: `${SHEET_NAME}!${colLetter(col)}${rowIndex}`,
        values: [[value]],
      });
    }
  }

  if (data.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  });

  // Bust the cache so the next lookup sees fresh data
  _cache = { rows: null, fetchedAt: 0 };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Guest
 * @property {string}  guestId
 * @property {string}  householdId
 * @property {string}  householdName
 * @property {string}  firstName
 * @property {string}  lastName
 * @property {string}  phone
 * @property {string}  email
 * @property {string}  rsvpStatus       "pending" | "attending" | "declined"
 * @property {string}  mealPreference
 * @property {string}  dietaryNotes
 * @property {string}  songRequest
 * @property {boolean} plusOneAllowed
 * @property {string}  plusOneName
 * @property {string}  rsvpSubmittedAt
 */

function rowToGuest(row) {
  const guestId = row[COL.GUEST_ID]?.trim();
  if (!guestId) return null; // skip empty rows

  return {
    guestId,
    householdId:      row[COL.HOUSEHOLD_ID]      ?? '',
    householdName:    row[COL.HOUSEHOLD_NAME]     ?? '',
    firstName:        row[COL.FIRST_NAME]         ?? '',
    lastName:         row[COL.LAST_NAME]          ?? '',
    phone:            row[COL.PHONE]              ?? '',
    email:            row[COL.EMAIL]              ?? '',
    rsvpStatus:       row[COL.RSVP_STATUS]        ?? 'pending',
    mealPreference:   row[COL.MEAL_PREFERENCE]    ?? '',
    dietaryNotes:     row[COL.DIETARY_NOTES]      ?? '',
    songRequest:      row[COL.SONG_REQUEST]       ?? '',
    plusOneAllowed:   row[COL.PLUS_ONE_ALLOWED]?.toUpperCase() === 'TRUE',
    plusOneName:      row[COL.PLUS_ONE_NAME]      ?? '',
    rsvpSubmittedAt:  row[COL.RSVP_SUBMITTED_AT]  ?? '',
  };
}
