/**
 * POST /api/rsvp/lookup — unit tests
 *
 * Strategy: we mock the data-access layer (lib/guests) so the route
 * tests cover HTTP logic (validation, status codes, response shape)
 * without needing a real database. The data-access layer has its own
 * separate tests that use an in-memory SQLite database.
 *
 * This mirrors the separation a real team would use: route tests verify
 * HTTP concerns; integration tests verify database correctness.
 */

import { NextRequest } from 'next/server';

// Mock the guests module before importing the route
jest.mock('@/lib/guests', () => ({
  findHouseholdByPhone: jest.fn(),
}));

import { findHouseholdByPhone } from '@/lib/guests';
import { POST } from '@/app/api/rsvp/lookup/route';
import type { Household } from '@/types';

const mockFind = findHouseholdByPhone as jest.MockedFunction<typeof findHouseholdByPhone>;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/rsvp/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_HOUSEHOLD: Household = {
  householdId:   'h001',
  householdName: 'The Smiths',
  guests: [
    {
      guestId:             'g001',
      householdId:         'h001',
      householdName:       'The Smiths',
      firstName:           'Jane',
      lastName:            'Smith',
      phone:               '8005551234',
      email:               'jane@example.com',
      plusOneAllowed:      true,
      rsvpStatus:          'pending',
      dietaryNotes:        '',
      plusOneName:         '',
      plusOneDietaryNotes: '',
      rsvpSubmittedAt:     '',
    },
  ],
};

describe('POST /api/rsvp/lookup', () => {
  beforeEach(() => {
    mockFind.mockReset();
  });

  it('returns 400 if phone is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/valid 10-digit/i);
  });

  it('returns 400 if phone is too short', async () => {
    const res = await POST(makeRequest({ phone: '123' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 if phone is not in the guest list', async () => {
    mockFind.mockReturnValue(null);
    const res = await POST(makeRequest({ phone: '8005559999' }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 200 with household and safe guest fields on success', async () => {
    mockFind.mockReturnValue(MOCK_HOUSEHOLD);
    const res = await POST(makeRequest({ phone: '(800) 555-1234' })); // formatted input
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.householdId).toBe('h001');
    expect(body.householdName).toBe('The Smiths');
    expect(body.guests).toHaveLength(1);

    const guest = body.guests[0];
    expect(guest.guestId).toBe('g001');
    expect(guest.firstName).toBe('Jane');

    // Phone and email must NOT be present in the response (PII)
    expect(guest.phone).toBeUndefined();
    expect(guest.email).toBeUndefined();
  });

  it('normalizes formatted phone numbers before lookup', async () => {
    mockFind.mockReturnValue(MOCK_HOUSEHOLD);
    await POST(makeRequest({ phone: '+1 (800) 555-1234' }));
    expect(mockFind).toHaveBeenCalledWith('8005551234');
  });
});
