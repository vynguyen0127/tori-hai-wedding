/**
 * POST /api/rsvp/submit
 * ─────────────────────────────────────────────────────────────────────────────
 * Writes RSVP responses back to the Google Sheet.
 *
 * Request body:
 *   {
 *     "householdId": "h001",
 *     "responses": [
 *       {
 *         "guestId": "g001",
 *         "status": "attending",        // "attending" | "declined"
 *         "mealPreference": "chicken",  // only required when attending
 *         "dietaryNotes": "",
 *         "songRequest": "September - Earth Wind & Fire",
 *         "plusOneName": "Alex Smith"   // only if plusOneAllowed
 *       }
 *     ]
 *   }
 *
 * Success response (200):
 *   { "ok": true }
 *
 * Error responses:
 *   400  Missing or malformed body
 *   500  Server error
 */

import { NextResponse } from 'next/server';
import { submitRsvp, findHouseholdByPhone, getAllGuests } from '@/lib/sheets';

const VALID_STATUSES = new Set(['attending', 'declined']);

export async function POST(request) {
  try {
    const body = await request.json();
    const { householdId, responses } = body ?? {};

    // ── Validate input ──────────────────────────────────────────────────────
    if (!householdId || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. householdId and responses are required.' },
        { status: 400 }
      );
    }

    for (const r of responses) {
      if (!r.guestId) {
        return NextResponse.json({ error: 'Each response must include a guestId.' }, { status: 400 });
      }
      if (!VALID_STATUSES.has(r.status)) {
        return NextResponse.json(
          { error: `Invalid status "${r.status}". Must be "attending" or "declined".` },
          { status: 400 }
        );
      }
    }

    // ── Security: verify all guestIds belong to the claimed household ───────
    // This prevents a guest from submitting RSVPs for guests outside their group.
    const allRows  = await getAllGuests();
    const allGuests = allRows.map((r) => r.guest);

    for (const r of responses) {
      const guest = allGuests.find((g) => g.guestId === r.guestId);
      if (!guest || guest.householdId !== householdId) {
        return NextResponse.json(
          { error: 'One or more guest IDs do not belong to the provided household.' },
          { status: 400 }
        );
      }
      // Prevent plus-one submission if not allowed
      if (r.plusOneName && !guest.plusOneAllowed) {
        r.plusOneName = ''; // silently strip
      }
    }

    // ── Write to sheet ──────────────────────────────────────────────────────
    await submitRsvp(responses);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/rsvp/submit]', err);
    return NextResponse.json(
      { error: 'Something went wrong saving your RSVP. Please try again.' },
      { status: 500 }
    );
  }
}
