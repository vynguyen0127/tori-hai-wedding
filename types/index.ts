// ── Domain types ──────────────────────────────────────────────────────────────

export type RsvpStatus = 'pending' | 'attending' | 'declined';

export interface Guest {
  guestId: string;
  householdId: string;
  householdName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  plusOneAllowed: boolean;
  rsvpStatus: RsvpStatus;
  dietaryNotes: string;
  plusOneName: string;
  plusOneDietaryNotes: string;
  rsvpSubmittedAt: string;
}

export interface Household {
  householdId: string;
  householdName: string;
  guests: Guest[];
}

// ── API request / response shapes ─────────────────────────────────────────────

// POST /api/rsvp/lookup
export interface LookupRequest {
  phone: string;
}

// Subset of Guest fields safe to send to the client (no phone)
export interface SafeGuest {
  guestId: string;
  firstName: string;
  lastName: string;
  rsvpStatus: RsvpStatus;
  dietaryNotes: string;
  plusOneAllowed: boolean;
  plusOneName: string;
  plusOneDietaryNotes: string;
  email: string;
}

export interface LookupResponse {
  householdId: string;
  householdName: string;
  guests: SafeGuest[];
}

// POST /api/rsvp/submit
export interface RsvpResponse {
  guestId: string;
  status: 'attending' | 'declined';
  dietaryNotes: string;
  plusOneName: string;
  plusOneDietaryNotes: string;
  email: string
  fullName: string
}

export interface SubmitRequest {
  householdId: string;
  householdName: string;
  responses: RsvpResponse[];
}

export interface SubmitResponse {
  ok: true;
}

// Generic API error shape
export interface ApiError {
  error: string;
}

// ── Admin types ───────────────────────────────────────────────────────────────

export interface RsvpSummary {
  total: number;
  attending: number;
  declined: number;
  pending: number;
  dietaryNotes: string[];
}
