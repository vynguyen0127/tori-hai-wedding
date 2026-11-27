import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:data/wedding.db' });

const stmts = [
  "ALTER TABLE guests ADD COLUMN tea_ceremony_invite INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE guests ADD COLUMN ceremony_invite INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE rsvps ADD COLUMN tea_ceremony_rsvp TEXT CHECK(tea_ceremony_rsvp IN ('attending','declined'))",
  "ALTER TABLE rsvps ADD COLUMN ceremony_rsvp TEXT CHECK(ceremony_rsvp IN ('attending','declined'))",
];

async function run() {
  for (const sql of stmts) {
    try {
      await db.execute(sql);
      console.log('OK:', sql.slice(0, 60));
    } catch (e: any) {
      console.log('SKIP:', e.message.slice(0, 80));
    }
  }
}

run();
