'use client';

import { useState, useMemo } from 'react';
import type { SeatingRow } from '@/types';

const UNASSIGNED = -1;

export default function SeatingChart({ rows }: { rows: SeatingRow[] }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Group ALL rows by table first
  const allTables = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const r of rows) {
      const key = r.tableNumber ?? UNASSIGNED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r.name);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === UNASSIGNED) return 1;
      if (b === UNASSIGNED) return -1;
      return a - b;
    });
  }, [rows]);

  // When searching: only show tables that contain at least one match
  const tables = useMemo(() => {
    if (!q) return allTables;
    return allTables.filter(([, names]) =>
      names.some((name) => name.toLowerCase().includes(q))
    );
  }, [allTables, q]);

  const noResults = q !== '' && tables.length === 0;

  return (
    <div className="seating-wrap">
      <div className="seating-search-bar">
        <input
          type="search"
          className="seating-search"
          placeholder="Search your name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search guests"
        />
      </div>

      {noResults ? (
        <p className="seating-empty">We couldn&apos;t find that name.</p>
      ) : (
        <div className="seating-tables">
          {tables.map(([tableNumber, names]) => (
            <div key={tableNumber} className="seating-table">
              <h2 className="seating-table__number">
                {tableNumber === UNASSIGNED ? 'Unassigned' : `Table ${tableNumber}`}
              </h2>
              <ul className="seating-table__guests">
                {names.map((name) => (
                  <li
                    key={name}
                    className={
                      q && name.toLowerCase().includes(q)
                        ? 'seating-table__guest seating-table__guest--match'
                        : 'seating-table__guest'
                    }
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
