/**
 * POST /api/rsvp/lookup
 *
 * Accepts a phone number, looks it up in the guest list, and returns the
 * household so the RSVP form can be pre-populated.
 *
 * Design decision — why not GET?
 *   We use POST because the request carries PII (a phone number). GET requests
 *   are logged by proxies and appear in browser history; POST body is not.
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/phoneUtils';
import { findHouseholdByPhone } from '@/lib/guests';
import type { LookupRequest, LookupResponse, SafeGuest, ApiError } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<LookupResponse | ApiError>> {
  try {
    const body: Partial<LookupRequest> = await request.json();

    const normalized = normalizePhone(body.phone);
    if (!normalized) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    const household = findHouseholdByPhone(normalized);
    if (!household) {
      return NextResponse.json(
        { error: "We couldn't find your invite. Please double-check your number or contact us directly." },
        { status: 404 }
      );
    }

    // Strip fields that should never reach the client (emails, phone numbers)
    const safeGuests: SafeGuest[] = household.guests.map((g) => ({
      guestId:             g.guestId,
      firstName:           g.firstName,
      lastName:            g.lastName,
      rsvpStatus:          g.rsvpStatus,
      dietaryNotes:        g.dietaryNotes,
      plusOneAllowed:      g.plusOneAllowed,
      plusOneName:         g.plusOneName,
      plusOneDietaryNotes: g.plusOneDietaryNotes,
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
