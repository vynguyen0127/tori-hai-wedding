'use client';

import { useState } from 'react';
import type {
  LookupResponse,
  SafeGuest,
  RsvpResponse,
  SubmitRequest,
  ApiError,
} from '@/types';

// ── Local state shape for each guest while the form is being filled ───────────

interface GuestFormState {
  guestId: string;
  status: 'attending' | 'declined' | '';
  dietaryNotes: string;
  plusOneName: string;
  plusOneDietaryNotes: string;
}

// ── Step 1: Phone lookup ──────────────────────────────────────────────────────

interface PhoneLookupProps {
  onFound: (household: LookupResponse) => void;
}

function PhoneLookup({ onFound }: PhoneLookupProps) {
  const [phone, setPhone]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/rsvp/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data: LookupResponse | ApiError = await res.json();
      if (!res.ok) {
        setError((data as ApiError).error ?? 'Something went wrong.');
        return;
      }
      onFound(data as LookupResponse);
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rsvp-step rsvp-step--lookup">
      <h2 className="rsvp-step__title">Find your invitation</h2>
      <p className="rsvp-step__subtitle">
        Enter the phone number we have on file for your household.
      </p>
      <form onSubmit={handleSubmit}>
        <label className="rsvp-form__label" htmlFor="phone">Phone number</label>
        <input
          id="phone"
          type="tel"
          className="rsvp-form__input"
          placeholder="(555) 867-5309"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="rsvp-form__error">{error}</p>}
        <button
          type="submit"
          className="rsvp-form__btn rsvp-form__btn--primary"
          disabled={loading || !phone.trim()}
        >
          {loading ? 'Looking up…' : 'Find my invite →'}
        </button>
      </form>
      <p className="rsvp-step__help">
        Don&apos;t see your invite?{' '}
        <a href="mailto:tori@example.com">Contact us</a> and we&apos;ll sort it out.
      </p>
    </div>
  );
}

// ── Step 2: Household RSVP form ───────────────────────────────────────────────

interface HouseholdFormProps {
  household: LookupResponse;
  onSubmitted: (responses: GuestFormState[]) => void;
}

function HouseholdForm({ household, onSubmitted }: HouseholdFormProps) {
  const [responses, setResponses] = useState<GuestFormState[]>(() =>
    household.guests.map((g: SafeGuest) => ({
      guestId:             g.guestId,
      status:              (['attending', 'declined'] as const).includes(g.rsvpStatus as 'attending' | 'declined')
                             ? (g.rsvpStatus as 'attending' | 'declined')
                             : '',
      dietaryNotes:        g.dietaryNotes,
      plusOneName:         g.plusOneName,
      plusOneDietaryNotes: g.plusOneDietaryNotes,
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  function update<K extends keyof GuestFormState>(
    guestId: string,
    field: K,
    value: GuestFormState[K]
  ) {
    setResponses((prev) =>
      prev.map((r) => r.guestId === guestId ? { ...r, [field]: value } : r)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (responses.some((r) => !r.status)) {
      setError('Please select attending or not attending for every guest.');
      return;
    }

    const payload: SubmitRequest = {
      householdId: household.householdId,
      responses: responses.map((r): RsvpResponse => ({
        guestId:             r.guestId,
        status:              r.status as 'attending' | 'declined',
        dietaryNotes:        r.dietaryNotes,
        plusOneName:         r.plusOneName,
        plusOneDietaryNotes: r.plusOneDietaryNotes,
      })),
    };

    setSubmitting(true);
    try {
      const res  = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: { ok: true } | ApiError = await res.json();
      if (!res.ok) {
        setError((data as ApiError).error ?? 'Something went wrong. Please try again.');
        return;
      }
      onSubmitted(responses);
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rsvp-step rsvp-step--form">
      <h2 className="rsvp-step__title">{household.householdName}</h2>
      <p className="rsvp-step__subtitle">Please RSVP for each person in your group.</p>

      <form onSubmit={handleSubmit}>
        {household.guests.map((guest: SafeGuest, i: number) => {
          const r = responses[i];
          return (
            <div key={guest.guestId} className="guest-card">
              <h3 className="guest-card__name">{guest.firstName} {guest.lastName}</h3>

              <fieldset className="guest-card__fieldset">
                <legend className="guest-card__legend">Will you be joining us?</legend>
                <label className="guest-card__radio-label">
                  <input type="radio" name={`status-${guest.guestId}`} value="attending"
                    checked={r.status === 'attending'}
                    onChange={() => update(guest.guestId, 'status', 'attending')} />
                  Joyfully accepts ♡
                </label>
                <label className="guest-card__radio-label">
                  <input type="radio" name={`status-${guest.guestId}`} value="declined"
                    checked={r.status === 'declined'}
                    onChange={() => update(guest.guestId, 'status', 'declined')} />
                  Regretfully declines
                </label>
              </fieldset>

              {r.status === 'attending' && (
                <div className="guest-card__details">
                  <label className="guest-card__label" htmlFor={`dietary-${guest.guestId}`}>
                    Dietary restrictions or allergies
                  </label>
                  <input id={`dietary-${guest.guestId}`} type="text" className="guest-card__input"
                    placeholder="e.g. nut allergy, gluten-free"
                    value={r.dietaryNotes}
                    onChange={(e) => update(guest.guestId, 'dietaryNotes', e.target.value)} />

                  {guest.plusOneAllowed && (
                    <>
                      <label className="guest-card__label" htmlFor={`plus-${guest.guestId}`}>
                        Plus-one name
                      </label>
                      <input id={`plus-${guest.guestId}`} type="text" className="guest-card__input"
                        placeholder="Guest's full name"
                        value={r.plusOneName}
                        onChange={(e) => update(guest.guestId, 'plusOneName', e.target.value)} />

                      <label className="guest-card__label" htmlFor={`plus-dietary-${guest.guestId}`}>
                        Plus-one dietary restrictions or allergies
                      </label>
                      <input id={`plus-dietary-${guest.guestId}`} type="text" className="guest-card__input"
                        placeholder="e.g. nut allergy, gluten-free"
                        value={r.plusOneDietaryNotes}
                        onChange={(e) => update(guest.guestId, 'plusOneDietaryNotes', e.target.value)} />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {error && <p className="rsvp-form__error">{error}</p>}
        <button type="submit" className="rsvp-form__btn rsvp-form__btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  );
}

// ── Step 3: Confirmation ──────────────────────────────────────────────────────

interface ConfirmationProps {
  responses: GuestFormState[];
}

function Confirmation({ responses }: ConfirmationProps) {
  const attending = responses.filter((r) => r.status === 'attending');
  const declined  = responses.filter((r) => r.status === 'declined');

  return (
    <div className="rsvp-step rsvp-step--confirmation">
      <div className="rsvp-confirmation__icon">✦</div>
      {attending.length > 0 ? (
        <>
          <h2 className="rsvp-step__title">We can&apos;t wait to celebrate with you!</h2>
          <p className="rsvp-step__subtitle">
            Your RSVP has been saved. We&apos;ll be in touch as the big day gets closer.
          </p>
        </>
      ) : (
        <>
          <h2 className="rsvp-step__title">We&apos;ll miss you!</h2>
          <p className="rsvp-step__subtitle">
            Thank you for letting us know. You&apos;ll be with us in spirit. ♡
          </p>
        </>
      )}
      <div className="rsvp-confirmation__summary">
        {attending.length > 0 && (
          <p><strong>Attending:</strong> {attending.length} guest{attending.length > 1 ? 's' : ''}</p>
        )}
        {declined.length > 0 && (
          <p><strong>Unable to attend:</strong> {declined.length} guest{declined.length > 1 ? 's' : ''}</p>
        )}
      </div>
      <p className="rsvp-confirmation__note">
        Need to make a change?{' '}
        <a href="mailto:tori@example.com">Email us</a> and we&apos;ll update it.
      </p>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

type Step = 'lookup' | 'form' | 'done';

export default function RsvpFlow() {
  const [step, setStep]           = useState<Step>('lookup');
  const [household, setHousehold] = useState<LookupResponse | null>(null);
  const [finalRsvps, setFinalRsvps] = useState<GuestFormState[]>([]);

  return (
    <div className="rsvp-container">
      <div className="rsvp-progress" aria-label="Progress">
        {(['lookup', 'form', 'done'] as Step[]).map((s, i) => (
          <div key={s} className={[
            'rsvp-progress__dot',
            step === s ? 'rsvp-progress__dot--active' : '',
            (['lookup', 'form', 'done'] as Step[]).indexOf(step) > i ? 'rsvp-progress__dot--complete' : '',
          ].join(' ')} />
        ))}
      </div>

      {step === 'lookup' && (
        <PhoneLookup onFound={(data) => { setHousehold(data); setStep('form'); }} />
      )}
      {step === 'form' && household && (
        <HouseholdForm
          household={household}
          onSubmitted={(r) => { setFinalRsvps(r); setStep('done'); }}
        />
      )}
      {step === 'done' && <Confirmation responses={finalRsvps} />}
    </div>
  );
}
