export const dynamic = 'force-dynamic';

import { getSeatingChart } from '@/lib/guests';
import SeatingChart from '@/components/SeatingChart';

export const metadata = { title: 'Seating Chart · Victoria & Hai' };

export default async function SeatingPage() {
  const rows = await getSeatingChart();

  return (
    <div className="seating-page">
      <header className="seating-header">
        <p className="seating-header__eyebrow">Tori &amp; Hai</p>
        <h1 className="seating-header__title">Seating Chart</h1>
        <p className="seating-header__subtitle">Find your table below.</p>
      </header>

      <SeatingChart rows={rows} />
    </div>
  );
}
