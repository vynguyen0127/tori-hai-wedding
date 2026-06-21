/**
 * POST /api/rsvp/lookup
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts a phone number, looks it up in the guest list, and returns the
 * full household group so the RSVP form can be pre-populated.
 *
 * Request body:
 *   { "phone": "800-555-1234" }   (any format — normalized server-side)
 *
 * Success response (200):
 *   {
 *     "householdId": "h001",
 *     "householdName": "The Nguyen Family",
 *     "guests": [
 *       {
 *         "guestId": "g001",
 *         "firstName": "Nhi",
 *         "lastName": "Nguyen",
 *         "rsvpStatus": "pending",
 *         "mealPreference": "",
 *         "dietaryNotes": "",
 *         "songRequest": "",
 *         "plusOneAllowed": true,
 *         "plusOneName": ""
 *       },
 *       ...
 *     ]
 *   }
 *
 * Error responses:
 *   400  Missing or invalid phone number
 *   404  Phone not found in guest list
 *   500  Server error
 */

import { NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/phoneUtils';
import { findHouseholdByPhone } from '@/lib/sheets';

export async function POST(request) {
  try {
    const body = await request.json();
    const raw = body?.phone;

    // ── Validate input ──────────────────────────────────────────────────────
    const normalized = normalizePhone(raw);
    if (!normalized) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // ── Look up household ───────────────────────────────────────────────────
    const household = await findHouseholdByPhone(normalized);

    if (!household) {
      return NextResponse.json(
        {
          error:
            'We couldn\'t find your invite. Please double-check your number or contact Nhi & Hai directly.',
        },
        { status: 404 }
      );
    }

    // ── Return only what the client needs (no emails) ───────────────────────
    const safeGuests = household.guests.map((g) => ({
      guestId:         g.guestId,
      firstName:       g.firstName,
      lastName:        g.lastName,
      rsvpStatus:      g.rsvpStatus,
      mealPreference:  g.mealPreference,
      dietaryNotes:    g.dietaryNotes,
      songRequest:     g.songRequest,
      plusOneAllowed:  g.plusOneAllowed,
      plusOneName:     g.plusOneName,
    }));

    return NextResponse.json({
      householdId:   household.householdId,
      householdName: household.householdName,
      guests:        safeGuests,
    });
  } catch (err) {
    console.error('[/api/rsvp/lookup]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
