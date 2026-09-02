import { NextResponse } from 'next/server';
import { getAllGuests, getRsvpSummary } from '@/lib/guests';
import type { Guest, RsvpSummary } from '@/types';

export interface AdminGuestsResponse {
  guests: Guest[];
  summary: RsvpSummary;
}

export async function GET(): Promise<NextResponse<AdminGuestsResponse>> {
  const [guests, summary] = await Promise.all([getAllGuests(), getRsvpSummary()]);
  return NextResponse.json({ guests, summary });
}
