/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Turso / libSQL client singleton.
 *
 * Local dev:  TURSO_DB_URL=file:data/wedding.db  (no auth token needed)
 * Production: TURSO_DB_URL=libsql://your-db.turso.io
 *             TURSO_AUTH_TOKEN=<token from Turso dashboard>
 *
 * Why libsql over better-sqlite3 for production?
 *   better-sqlite3 writes to the local filesystem. On Vercel, the filesystem
 *   is ephemeral — it resets on every deploy, wiping the database. Turso is
 *   a hosted SQLite service with a persistent remote file, so data survives
 *   deploys. The SQL dialect is identical; the only difference is the client
 *   API is async (returns Promises) instead of synchronous.
 */

import { createClient, type Client } from '@libsql/client';

function makeClient(): Client {
  const url = process.env.TURSO_DB_URL ?? 'file:data/wedding.db';
  const authToken = process.env.TURSO_AUTH_TOKEN; // undefined is fine for file://
  return createClient({ url, authToken });
}

// Module-level singleton — one connection shared across requests in the same
// worker process (Next.js reuses workers across requests).
const db = makeClient();

// ── Schema bootstrap ──────────────────────────────────────────────────────────
// Creates tables on first use if they don't exist. Safe to call many times.
// Using a promise so concurrent first-requests don't race to create tables.

let _schemaReady: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!_schemaReady) {
    _schemaReady = db.executeMultiple(`
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
        guest_id               TEXT PRIMARY KEY REFERENCES guests(id),
        status                 TEXT NOT NULL
                                 CHECK(status IN ('pending','attending','declined')),
        dietary_notes          TEXT NOT NULL DEFAULT '',
        email                  TEXT NOT NULL DEFAULT '',
        plus_one_name          TEXT NOT NULL DEFAULT '',
        plus_one_dietary_notes TEXT NOT NULL DEFAULT '',
        submitted_at           TEXT NOT NULL
      );
    `);
  }
  return _schemaReady;
}

export default db;
