/**
 * scripts/seed.ts
 * Run with:  npx tsx scripts/seed.ts
 *
 * Inserts households and guests from data/seed.json into the SQLite database.
 * Safe to re-run — uses INSERT OR IGNORE so existing rows are skipped.
 */

import db from '../lib/db';
import seedData from '../data/seed.json';

interface SeedGuest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  plusOneAllowed: boolean;
}

interface SeedHousehold {
  id: string;
  name: string;
  guests: SeedGuest[];
}

const insertHousehold = db.prepare(
  'INSERT OR IGNORE INTO households (id, name) VALUES (?, ?)'
);

const insertGuest = db.prepare(`
  INSERT OR IGNORE INTO guests
    (id, household_id, first_name, last_name, phone, email, plus_one_allowed)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const seedAll = db.transaction((households: SeedHousehold[]) => {
  for (const h of households) {
    insertHousehold.run(h.id, h.name);
    for (const g of h.guests) {
      insertGuest.run(
        g.id,
        h.id,
        g.firstName,
        g.lastName,
        g.phone,
        g.email,
        g.plusOneAllowed ? 1 : 0
      );
    }
  }
});

seedAll(seedData.households as SeedHousehold[]);

const count = (db.prepare('SELECT COUNT(*) as n FROM guests').get() as { n: number }).n;
console.log(`✓ Seeded database — ${count} guest(s) in wedding.db`);
