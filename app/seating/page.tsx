export const dynamic = 'force-dynamic';

import SeatingChart from '@/components/SeatingChart';
import type { SeatingRow } from '@/types';

export const metadata = { title: 'Seating Chart · Victoria & Hai' };

const MOCK_ROWS: SeatingRow[] = [
  { name: 'Victoria Nguyen',   tableNumber: 1 },
  { name: 'Hai Tran',          tableNumber: 1 },
  { name: 'Linda Nguyen',      tableNumber: 1 },
  { name: 'James Tran',        tableNumber: 1 },
  { name: 'Sophie Chen',       tableNumber: 2 },
  { name: 'Michael Chen',      tableNumber: 2 },
  { name: 'Anh Pham',          tableNumber: 2 },
  { name: 'Kevin Pham',        tableNumber: 2 },
  { name: 'Rachel Kim',        tableNumber: 3 },
  { name: 'David Kim',         tableNumber: 3 },
  { name: 'Jessica Lee',       tableNumber: 3 },
  { name: 'Brian Lee',         tableNumber: 3 },
  { name: 'Mia Johnson',       tableNumber: 4 },
  { name: 'Tyler Johnson',     tableNumber: 4 },
  { name: 'Chloe Williams',    tableNumber: 4 },
  { name: 'Nathan Williams',   tableNumber: 4 },
  { name: 'Emma Davis',        tableNumber: 5 },
  { name: 'Ethan Davis',       tableNumber: 5 },
  { name: 'Olivia Martinez',   tableNumber: 5 },
  { name: 'Carlos Martinez',   tableNumber: 5 },
];

export default async function SeatingPage() {
  const rows = MOCK_ROWS;

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
