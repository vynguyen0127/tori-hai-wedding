/**
 * lib/guests.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Data-access layer for the guest list and RSVP submissions.
 *
 * All functions are synchronous (better-sqlite3 is sync). This keeps
 * the API routes simple — no async/await boilerplate in the query layer.
 *
 * Separation of concerns: this module knows about the DB schema.
 * The API routes know about HTTP — they call these functions and
 * translate results into NextResponse objects.
 */

import db from './db';
import type { Guest, Household, RsvpResponse, RsvpSummary } from '@/types';

// ── Row types (raw DB output) ─────────────────────────────────────────────────

interface GuestRow {
  id: string;
  household_id: string;
  household_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  plus_one_allowed: number; // SQLite stores booleans as 0/1
  rsvp_status: string | null;
  dietary_notes: string | null;
  plus_one_name: string | null;
  plus_one_dietary_notes: string | null;
  rsvp_submitted_at: string | null;
}

// ── Queries ───────────────────────────────────────────────────────────────────

const selectAllGuests = db.prepare<[], GuestRow>(`
  SELECT
    g.id,
    g.household_id,
    h.name AS household_name,
    g.first_name,
    g.last_name,
    g.phone,
    g.email,
    g.plus_one_allowed,
    COALESCE(r.status, 'pending')   AS rsvp_status,
    COALESCE(r.dietary_notes, '')   AS dietary_notes,
    COALESCE(r.plus_one_name, '')   AS plus_one_name,
    COALESCE(r.plus_one_dietary_notes, '') AS plus_one_dietary_notes,
    r.submitted_at                  AS rsvp_submitted_at
  FROM guests g
  JOIN households h ON h.id = g.household_id
  LEFT JOIN rsvps r ON r.guest_id = g.id
  ORDER BY g.household_id, g.id
`);

const selectByPhone = db.prepare<[string], GuestRow>(`
  SELECT
    g.id,
    g.household_id,
    h.name AS household_name,
    g.first_name,
    g.last_name,
    g.phone,
    g.email,
    g.plus_one_allowed,
    COALESCE(r.status, 'pending')   AS rsvp_status,
    COALESCE(r.dietary_notes, '')   AS dietary_notes,
    COALESCE(r.plus_one_name, '')   AS plus_one_name,
    COALESCE(r.plus_one_dietary_notes, '') AS plus_one_dietary_notes,
    r.submitted_at                  AS rsvp_submitted_at
  FROM guests g
  JOIN households h ON h.id = g.household_id
  LEFT JOIN rsvps r ON r.guest_id = g.id
  WHERE g.phone = ?
`);

const selectHouseholdGuests = db.prepare<[string], GuestRow>(`
  SELECT
    g.id,
    g.household_id,
    h.name AS household_name,
    g.first_name,
    g.last_name,
    g.phone,
    g.email,
    g.plus_one_allowed,
    COALESCE(r.status, 'pending')   AS rsvp_status,
    COALESCE(r.dietary_notes, '')   AS dietary_notes,
    COALESCE(r.plus_one_name, '')   AS plus_one_name,
    COALESCE(r.plus_one_dietary_notes, '') AS plus_one_dietary_notes,
    r.submitted_at                  AS rsvp_submitted_at
  FROM guests g
  JOIN households h ON h.id = g.household_id
  LEFT JOIN rsvps r ON r.guest_id = g.id
  WHERE g.household_id = ?
  ORDER BY g.id
`);

const selectGuestById = db.prepare<[string], GuestRow>(`
  SELECT g.*, h.name AS household_name
  FROM guests g
  JOIN households h ON h.id = g.household_id
  WHERE g.id = ?
`);

const upsertRsvp = db.prepare(`
  INSERT INTO rsvps
    (guest_id, status, dietary_notes, plus_one_name, plus_one_dietary_notes, submitted_at)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(guest_id) DO UPDATE SET
    status                 = excluded.status,
    dietary_notes          = excluded.dietary_notes,
    plus_one_name          = excluded.plus_one_name,
    plus_one_dietary_notes = excluded.plus_one_dietary_notes,
    submitted_at           = excluded.submitted_at
`);

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToGuest(row: GuestRow): Guest {
  return {
    guestId:            row.id,
    householdId:        row.household_id,
    householdName:      row.household_name,
    firstName:          row.first_name,
    lastName:           row.last_name,
    phone:              row.phone,
    email:              row.email,
    plusOneAllowed:     row.plus_one_allowed === 1,
    rsvpStatus:         (row.rsvp_status ?? 'pending') as Guest['rsvpStatus'],
    dietaryNotes:       row.dietary_notes ?? '',
    plusOneName:        row.plus_one_name ?? '',
    plusOneDietaryNotes: row.plus_one_dietary_notes ?? '',
    rsvpSubmittedAt:    row.rsvp_submitted_at ?? '',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllGuests(): Guest[] {
  return selectAllGuests.all().map(rowToGuest);
}

export function findHouseholdByPhone(normalizedPhone: string): Household | null {
  const match = selectByPhone.get(normalizedPhone);
  if (!match) return null;

  const householdRows = selectHouseholdGuests.all(match.household_id);
  return {
    householdId:   match.household_id,
    householdName: match.household_name,
    guests:        householdRows.map(rowToGuest),
  };
}

export function getGuestById(guestId: string): Guest | null {
  const row = selectGuestById.get(guestId);
  return row ? rowToGuest(row) : null;
}

/**
 * Upserts RSVP responses for a household.
 * Wrapped in a transaction so all guests in a household succeed or fail together.
 */
export const submitRsvp = db.transaction((responses: RsvpResponse[]) => {
  const now = new Date().toISOString();
  for (const r of responses) {
    upsertRsvp.run(
      r.guestId,
      r.status,
      r.dietaryNotes,
      r.plusOneName,
      r.plusOneDietaryNotes,
      now
    );
  }
});

export function getRsvpSummary(): RsvpSummary {
  const guests = getAllGuests();
  const attending = guests.filter((g) => g.rsvpStatus === 'attending');
  const dietaryNotes = attending
    .map((g) => g.dietaryNotes)
    .filter(Boolean);

  return {
    total:       guests.length,
    attending:   attending.length,
    declined:    guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending:     guests.filter((g) => g.rsvpStatus === 'pending').length,
    dietaryNotes,
  };
}
