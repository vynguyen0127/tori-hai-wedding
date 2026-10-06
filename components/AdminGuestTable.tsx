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
            <th>Status</th>
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
                <td>
                  <span className={`admin-badge admin-badge--${g.rsvpStatus}`}>
                    {g.rsvpStatus}
                  </span>
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
