/**
 * POST /api/rsvp/submit
 *
 * Validates and persists RSVP responses for a household.
 *
 * Security: we re-fetch each guestId from the DB and verify it belongs
 * to the claimed householdId before writing. This prevents a guest from
 * submitting RSVPs on behalf of someone outside their household.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGuestById, submitRsvp } from '@/lib/guests';
import type { SubmitRequest, SubmitResponse, RsvpResponse, ApiError } from '@/types';

const VALID_STATUSES = new Set<string>(['attending', 'declined']);

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitResponse | ApiError>> {
  try {
    const body: Partial<SubmitRequest> = await request.json();
    const { householdId, responses } = body;

    if (!householdId || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. householdId and responses are required.' },
        { status: 400 }
      );
    }

    // Validate each response and verify household ownership
    const sanitized: RsvpResponse[] = [];
    for (const r of responses) {
      if (!r.guestId) {
        return NextResponse.json(
          { error: 'Each response must include a guestId.' },
          { status: 400 }
        );
      }
      if (!VALID_STATUSES.has(r.status)) {
        return NextResponse.json(
          { error: `Invalid status "${r.status}". Must be "attending" or "declined".` },
          { status: 400 }
        );
      }

      const guest = getGuestById(r.guestId);
      if (!guest || guest.householdId !== householdId) {
        return NextResponse.json(
          { error: 'One or more guest IDs do not belong to the provided household.' },
          { status: 400 }
        );
      }

      // Strip plus-one fields if not allowed — defense in depth against a
      // manipulated client payload
      sanitized.push({
        guestId:             r.guestId,
        status:              r.status as 'attending' | 'declined',
        dietaryNotes:        r.dietaryNotes ?? '',
        plusOneName:         guest.plusOneAllowed ? (r.plusOneName ?? '') : '',
        plusOneDietaryNotes: guest.plusOneAllowed ? (r.plusOneDietaryNotes ?? '') : '',
      });
    }

    submitRsvp(sanitized);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/rsvp/submit]', err);
    return NextResponse.json(
      { error: 'Something went wrong saving your RSVP. Please try again.' },
      { status: 500 }
    );
  }
}
