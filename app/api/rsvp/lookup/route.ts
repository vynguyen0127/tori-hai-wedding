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

    const household = await findHouseholdByPhone(normalized);
    if (!household) {
      return NextResponse.json(
        { error: "We couldn't find your invite. Please double-check your number or contact us directly." },
        { status: 404 }
      );
    }

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
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
