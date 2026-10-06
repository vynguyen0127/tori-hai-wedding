export const dynamic = 'force-dynamic';

import { getAllGuests, getRsvpSummary } from '@/lib/guests';
import CsvUpload from '@/components/CsvUpload';
import AdminGuestTable from '@/components/AdminGuestTable';

export default async function AdminPage() {
  const [guests, summary] = await Promise.all([getAllGuests(), getRsvpSummary()]);

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
        <h2>Import Guest List</h2>
        <CsvUpload />
      </section>

      <section className="admin-section">
        <h2>Guest List</h2>
        <AdminGuestTable guests={guests} />
      </section>
    </div>
  );
}
