/**
 * GET /api/admin/guests
 *
 * Returns all guests and RSVP summary data for the admin dashboard.
 * Protected by HTTP Basic Auth enforced in middleware.ts — this route
 * itself does not re-check credentials (single responsibility principle).
 */

import { NextResponse } from 'next/server';
import { getAllGuests, getRsvpSummary } from '@/lib/guests';
import type { Guest, RsvpSummary } from '@/types';

export interface AdminGuestsResponse {
  guests: Guest[];
  summary: RsvpSummary;
}

export async function GET(): Promise<NextResponse<AdminGuestsResponse>> {
  const guests  = getAllGuests();
  const summary = getRsvpSummary();
  return NextResponse.json({ guests, summary });
}
