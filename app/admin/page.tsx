import { getAllGuests, getRsvpSummary } from '@/lib/guests';
import type { Guest } from '@/types';

function StatusBadge({ status }: { status: Guest['rsvpStatus'] }) {
  const styles: Record<Guest['rsvpStatus'], string> = {
    attending: 'admin-badge admin-badge--attending',
    declined:  'admin-badge admin-badge--declined',
    pending:   'admin-badge admin-badge--pending',
  };
  return <span className={styles[status]}>{status}</span>;
}

export default async function AdminPage() {
  const [guests, summary] = await Promise.all([getAllGuests(), getRsvpSummary()]);

  const byHousehold = guests.reduce<Record<string, Guest[]>>((acc, g) => {
    (acc[g.householdId] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>RSVP Dashboard</h1>
        <p className="admin-header__subtitle">Tori &amp; Hai · May 29, 2027</p>
      </header>

      <section className="admin-summary">
        {[
          { label: 'Total Guests', value: summary.total,    mod: '' },
          { label: 'Attending',    value: summary.attending, mod: '--attending' },
          { label: 'Declined',     value: summary.declined,  mod: '--declined' },
          { label: 'Pending',      value: summary.pending,   mod: '--pending' },
        ].map(({ label, value, mod }) => (
          <div key={label} className={`admin-stat admin-stat${mod}`}>
            <span className="admin-stat__value">{value}</span>
            <span className="admin-stat__label">{label}</span>
          </div>
        ))}
      </section>

      {summary.dietaryNotes.length > 0 && (
        <section className="admin-section">
          <h2>Dietary Notes</h2>
          <ul className="admin-dietary">
            {summary.dietaryNotes.map((note, i) => <li key={i}>{note}</li>)}
          </ul>
        </section>
      )}

      <section className="admin-section">
        <h2>Guest List</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Household</th>
                <th>Name</th>
                <th>Status</th>
                <th>Dietary</th>
                <th>Plus-one</th>
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
                    <td><StatusBadge status={g.rsvpStatus} /></td>
                    <td>{g.dietaryNotes || '—'}</td>
                    <td>{g.plusOneName ? `${g.plusOneName}${g.plusOneDietaryNotes ? ` (${g.plusOneDietaryNotes})` : ''}` : '—'}</td>
                    <td>{g.rsvpSubmittedAt ? new Date(g.rsvpSubmittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
