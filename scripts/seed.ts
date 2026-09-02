import db, { ensureSchema } from '../lib/db';
import { upsertHousehold, upsertGuest } from '../lib/guests';
import seedData from '../data/seed.json';

interface SeedGuest {
  id: string; firstName: string; lastName: string;
  phone: string; email: string; plusOneAllowed: boolean;
}
interface SeedHousehold { id: string; name: string; guests: SeedGuest[]; }

async function main() {
  await ensureSchema();

  for (const h of seedData.households as SeedHousehold[]) {
    await upsertHousehold(h.id, h.name);
    for (const g of h.guests) {
      await upsertGuest({
        id: g.id, householdId: h.id, firstName: g.firstName,
        lastName: g.lastName, phone: g.phone, email: g.email,
        plusOneAllowed: g.plusOneAllowed ? 1 : 0,
      });
    }
  }

  const count = (await db.execute('SELECT COUNT(*) as n FROM guests')).rows[0] as unknown as { n: number };
  console.log(`✓ Seeded database — ${count.n} guest(s)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
