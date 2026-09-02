/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SQLite database singleton via better-sqlite3.
 *
 * Why better-sqlite3 over the async `sqlite3` package:
 *   - better-sqlite3 is synchronous, which avoids callback/Promise overhead for
 *     a low-concurrency app (a wedding has ~100–300 guests, not thousands of
 *     concurrent writers). Synchronous code is also easier to reason about and
 *     test without mocking async flows.
 *   - Next.js API routes run in an isolated Node.js process; a module-level
 *     singleton is safe and avoids reconnecting on every request.
 *
 * Schema
 * ──────
 * households  — one row per invited group (family, couple, individual)
 * guests      — one row per person; many-to-one with households
 * rsvps       — one row per guest once they respond; separate from guests so
 *               the guest record stays clean and we can upsert responses safely
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR  = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'wedding.db');

// Ensure the data directory exists (git-ignored; created at runtime)
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// WAL mode: allows concurrent reads while a write is in progress.
// Important if Next.js ever runs multiple worker processes.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS households (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guests (
    id               TEXT PRIMARY KEY,
    household_id     TEXT NOT NULL REFERENCES households(id),
    first_name       TEXT NOT NULL,
    last_name        TEXT NOT NULL,
    phone            TEXT NOT NULL,
    email            TEXT NOT NULL DEFAULT '',
    plus_one_allowed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(phone)
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    guest_id              TEXT PRIMARY KEY REFERENCES guests(id),
    status                TEXT NOT NULL
                            CHECK(status IN ('pending','attending','declined')),
    dietary_notes         TEXT NOT NULL DEFAULT '',
    plus_one_name         TEXT NOT NULL DEFAULT '',
    plus_one_dietary_notes TEXT NOT NULL DEFAULT '',
    submitted_at          TEXT NOT NULL
  );
`);

export default db;
