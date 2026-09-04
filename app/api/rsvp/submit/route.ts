import { NextRequest, NextResponse } from 'next/server';
import { getGuestById, submitRsvp } from '@/lib/guests';
import type { SubmitRequest, SubmitResponse, RsvpResponse, ApiError } from '@/types';
import { sendRsvpNotification } from '@/lib/email';

const VALID_STATUSES = new Set<string>(['attending', 'declined']);

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitResponse | ApiError>> {
  try {
    const body: Partial<SubmitRequest> = await request.json();
    const { householdId, householdName, responses } = body;

    if (!householdId || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. householdId and responses are required.' },
        { status: 400 }
      );
    }

    const sanitized: RsvpResponse[] = [];
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

      const guest = await getGuestById(r.guestId);
      if (!guest || guest.householdId !== householdId) {
        return NextResponse.json(
          { error: 'One or more guest IDs do not belong to the provided household.' },
          { status: 400 }
        );
      }

      sanitized.push({
        guestId:             r.guestId,
        status:              r.status as 'attending' | 'declined',
        dietaryNotes:        r.dietaryNotes ?? '',
        plusOneName:         guest.plusOneAllowed ? (r.plusOneName ?? '') : '',
        plusOneDietaryNotes: guest.plusOneAllowed ? (r.plusOneDietaryNotes ?? '') : '',
        email:               guest.email,
        fullName:            guest.firstName + " " + guest.lastName
      });
    }

    await submitRsvp(sanitized);

    void sendRsvpNotification(sanitized, householdName!).catch(err =>
      console.error('failed to send RSVP notification', err)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/rsvp/submit]', err);
    return NextResponse.json(
      { error: 'Something went wrong saving your RSVP. Please try again.' },
      { status: 500 }
    );
  }
}
