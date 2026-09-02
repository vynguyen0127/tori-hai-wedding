/**
 * lib/guests.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Data-access layer — all functions are async to match @libsql/client's API.
 */

import db, { ensureSchema } from './db';
import type { Guest, Household, RsvpResponse, RsvpSummary } from '@/types';

// ── Row type (raw DB output) ──────────────────────────────────────────────────

interface GuestRow {
  id: string;
  household_id: string;
  household_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  plus_one_allowed: number;
  rsvp_status: string;
  dietary_notes: string;
  plus_one_name: string;
  plus_one_dietary_notes: string;
  rsvp_submitted_at: string | null;
}

// ── Shared SQL ────────────────────────────────────────────────────────────────

const GUEST_SELECT = `
  SELECT
    g.id,
    g.household_id,
    h.name                                 AS household_name,
    g.first_name,
    g.last_name,
    g.phone,
    g.email,
    g.plus_one_allowed,
    COALESCE(r.status, 'pending')          AS rsvp_status,
    COALESCE(r.dietary_notes, '')          AS dietary_notes,
    COALESCE(r.plus_one_name, '')          AS plus_one_name,
    COALESCE(r.plus_one_dietary_notes, '') AS plus_one_dietary_notes,
    r.submitted_at                         AS rsvp_submitted_at
  FROM guests g
  JOIN households h ON h.id = g.household_id
  LEFT JOIN rsvps r ON r.guest_id = g.id
`;

// ── Mapper ────────────────────────────────────────────────────────────────────

function rowToGuest(row: GuestRow): Guest {
  return {
    guestId:             row.id,
    householdId:         row.household_id,
    householdName:       row.household_name,
    firstName:           row.first_name,
    lastName:            row.last_name,
    phone:               row.phone,
    email:               row.email,
    plusOneAllowed:      row.plus_one_allowed === 1,
    rsvpStatus:          (row.rsvp_status ?? 'pending') as Guest['rsvpStatus'],
    dietaryNotes:        row.dietary_notes ?? '',
    plusOneName:         row.plus_one_name ?? '',
    plusOneDietaryNotes: row.plus_one_dietary_notes ?? '',
    rsvpSubmittedAt:     row.rsvp_submitted_at ?? '',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllGuests(): Promise<Guest[]> {
  await ensureSchema();
  const result = await db.execute(`${GUEST_SELECT} ORDER BY g.household_id, g.id`);
  return (result.rows as unknown as GuestRow[]).map(rowToGuest);
}

export async function findHouseholdByPhone(normalizedPhone: string): Promise<Household | null> {
  await ensureSchema();

  // Find the matching guest first to get the household_id
  const matchResult = await db.execute({
    sql: `${GUEST_SELECT} WHERE g.phone = ?`,
    args: [normalizedPhone],
  });

  if (matchResult.rows.length === 0) return null;

  const match = matchResult.rows[0] as unknown as GuestRow;

  // Fetch all guests in that household
  const householdResult = await db.execute({
    sql: `${GUEST_SELECT} WHERE g.household_id = ? ORDER BY g.id`,
    args: [match.household_id],
  });

  return {
    householdId:   match.household_id,
    householdName: match.household_name,
    guests:        (householdResult.rows as unknown as GuestRow[]).map(rowToGuest),
  };
}

export async function getGuestById(guestId: string): Promise<Guest | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `${GUEST_SELECT} WHERE g.id = ?`,
    args: [guestId],
  });
  if (result.rows.length === 0) return null;
  return rowToGuest(result.rows[0] as unknown as GuestRow);
}

export async function submitRsvp(responses: RsvpResponse[]): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();

  // db.batch() executes all statements in a single implicit transaction —
  // all succeed or all roll back.
  await db.batch(
    responses.map((r) => ({
      sql: `
        INSERT INTO rsvps
          (guest_id, status, dietary_notes, plus_one_name, plus_one_dietary_notes, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(guest_id) DO UPDATE SET
          status                 = excluded.status,
          dietary_notes          = excluded.dietary_notes,
          plus_one_name          = excluded.plus_one_name,
          plus_one_dietary_notes = excluded.plus_one_dietary_notes,
          submitted_at           = excluded.submitted_at
      `,
      args: [r.guestId, r.status, r.dietaryNotes, r.plusOneName, r.plusOneDietaryNotes, now],
    })),
    'write'
  );
}

export async function getRsvpSummary(): Promise<RsvpSummary> {
  const guests   = await getAllGuests();
  const attending = guests.filter((g) => g.rsvpStatus === 'attending');

  return {
    total:        guests.length,
    attending:    attending.length,
    declined:     guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending:      guests.filter((g) => g.rsvpStatus === 'pending').length,
    dietaryNotes: attending.map((g) => g.dietaryNotes).filter(Boolean),
  };
}

// ── Bulk upsert (used by seed scripts) ───────────────────────────────────────

export async function upsertHousehold(id: string, name: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO households (id, name) VALUES (?, ?)
          ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
    args: [id, name],
  });
}

export async function upsertGuest(g: {
  id: string; householdId: string; firstName: string; lastName: string;
  phone: string; email: string; plusOneAllowed: number;
}): Promise<void> {
  await db.execute({
    sql: `INSERT INTO guests (id, household_id, first_name, last_name, phone, email, plus_one_allowed)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            household_id     = excluded.household_id,
            first_name       = excluded.first_name,
            last_name        = excluded.last_name,
            phone            = excluded.phone,
            email            = excluded.email,
            plus_one_allowed = excluded.plus_one_allowed`,
    args: [g.id, g.householdId, g.firstName, g.lastName, g.phone, g.email, g.plusOneAllowed],
  });
}
