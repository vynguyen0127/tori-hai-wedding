'use client';

import { useState } from 'react';
import type { Guest } from '@/types';

export default function AdminGuestTable({ guests }: { guests: Guest[] }) {
  const byHousehold = guests.reduce<Record<string, Guest[]>>((acc, g) => {
    (acc[g.householdId] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Household</th>
            <th>Name</th>
            <th title="Tea Ceremony Invite">Tea Invite</th>
            <th title="Tea Ceremony RSVP">Tea RSVP</th>
            <th title="Ceremony Invite">Ceremony Invite</th>
            <th title="Ceremony RSVP">Ceremony RSVP</th>
            <th title="Reception RSVP">Reception RSVP</th>
            <th>Dietary</th>
            <th>Plus-one</th>
            <th>Table #</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byHousehold).map(([, hGuests]) =>
            hGuests.map((g, i) => (
              <tr key={g.guestId}>
                {i === 0 && (
                  <td rowSpan={hGuests.length} className="admin-table__household">
                    {g.householdName}
                  </td>
                )}
                <td>{g.firstName} {g.lastName}</td>
                <td className="admin-table__center">
                  <InviteCheckbox
                    guestId={g.guestId}
                    field="teaCeremonyInvite"
                    initial={g.teaCeremonyInvite}
                    sibling={g.ceremonyInvite}
                  />
                </td>
                <td className="admin-table__center">
                  {g.teaCeremonyInvite
                    ? <RsvpBadge status={g.teaCeremonyRsvp} />
                    : <span className="admin-table__na">—</span>}
                </td>
                <td className="admin-table__center">
                  <InviteCheckbox
                    guestId={g.guestId}
                    field="ceremonyInvite"
                    initial={g.ceremonyInvite}
                    sibling={g.teaCeremonyInvite}
                  />
                </td>
                <td className="admin-table__center">
                  {g.ceremonyInvite
                    ? <RsvpBadge status={g.ceremonyRsvp} />
                    : <span className="admin-table__na">—</span>}
                </td>
                <td className="admin-table__center">
                  <RsvpBadge status={g.rsvpStatus} />
                </td>
                <td>{g.dietaryNotes || '—'}</td>
                <td>
                  {g.plusOneName
                    ? `${g.plusOneName}${g.plusOneDietaryNotes ? ` (${g.plusOneDietaryNotes})` : ''}`
                    : '—'}
                </td>
                <td>
                  <TableInput guestId={g.guestId} initial={g.tableNumber} />
                </td>
                <td>
                  {g.rsvpSubmittedAt
                    ? new Date(g.rsvpSubmittedAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RsvpBadge({ status }: { status: string | null }) {
  const s = status ?? 'pending';
  return <span className={`admin-badge admin-badge--${s}`}>{s}</span>;
}

function InviteCheckbox({
  guestId, field, initial, sibling,
}: {
  guestId: string;
  field: 'teaCeremonyInvite' | 'ceremonyInvite';
  initial: boolean;
  sibling: boolean;
}) {
  const [checked, setChecked] = useState(initial);
  const [saving, setSaving]   = useState(false);

  async function toggle(next: boolean) {
    setChecked(next);
    setSaving(true);
    await fetch(`/api/admin/guests/${guestId}/invites`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teaCeremonyInvite: field === 'teaCeremonyInvite' ? next : sibling,
        ceremonyInvite:    field === 'ceremonyInvite'    ? next : sibling,
      }),
    });
    setSaving(false);
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={saving}
      onChange={(e) => toggle(e.target.checked)}
      className="admin-table-checkbox"
    />
  );
}

function TableInput({ guestId, initial }: { guestId: string; initial: number | null }) {
  const [value, setValue] = useState(initial?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  async function save(newValue: string) {
    setSaving(true);
    await fetch(`/api/admin/guests/${guestId}/table`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber: newValue === '' ? null : Number(newValue) }),
    });
    setSaving(false);
  }

  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => save(e.target.value)}
      placeholder="—"
      disabled={saving}
      className="admin-table-input"
    />
  );
}
