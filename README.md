# Tori & Hai — Wedding Website

Full-stack wedding RSVP platform built with Next.js, TypeScript, and SQLite. Guests look up their household by phone number and submit RSVPs; the couple receives email notifications and manages the guest list through a protected admin dashboard.

**Live site:** [tori-hai-wedding.vercel.app](https://tori-hai-wedding.vercel.app)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | SQLite via Turso (libSQL) |
| Email | Resend |
| Auth | HTTP Basic Auth (Next.js middleware) |
| Hosting | Vercel |
| Tests | Jest + React Testing Library |

---

## Architecture

**Frontend** — React server components for data-heavy pages (admin dashboard fetches on the server, sends finished HTML). Client components only where interactivity is needed (RSVP form wizard, CSV uploader).

**API routes** — Four serverless endpoints:
- `POST /api/rsvp/lookup` — finds a household by phone number; strips PII from the response
- `POST /api/rsvp/submit` — validates household ownership, writes RSVPs atomically via `db.batch()`, fires confirmation emails
- `GET /api/admin/guests` — returns full guest list and RSVP summary stats
- `POST /api/admin/import-csv` — accepts a CSV file upload, validates all rows before writing

**Auth** — `middleware.ts` intercepts all `/admin` and `/api/admin/*` traffic before it reaches any route handler. Returns `401` with a `WWW-Authenticate` header if credentials are missing or wrong.

**Database** — Single SQLite file locally (`file:data/wedding.db`), Turso hosted instance in production. Swapped by environment variable — no code changes between environments. Schema bootstrapped automatically on first request via `ensureSchema()`.

**Email** — On RSVP submission, `sendRsvpNotification()` builds guest HTML once and sends two emails in parallel via `Promise.all`: an admin notification to the couple and a confirmation to the guest. Fired with `void` + `.catch` so a failed send never blocks the guest's response.

**Types** — All domain and API types defined once in `types/index.ts` and imported across frontend, backend, and tests. Schema changes surface as TypeScript errors everywhere they break.

---

## Key Files

```
app/
  api/rsvp/lookup/route.ts      Phone lookup endpoint
  api/rsvp/submit/route.ts      RSVP submission + email trigger
  api/admin/guests/route.ts     Admin guest list
  api/admin/import-csv/route.ts CSV bulk import
  admin/page.tsx                Admin dashboard (server component)
  rsvp/RsvpFlow.tsx             3-step RSVP wizard (client component)
lib/
  db.ts                         Turso client singleton + schema bootstrap
  guests.ts                     Data access layer (all DB queries)
  email.ts                      Email sending logic
  emailTemplates.ts             HTML email templates
  csv-import.ts                 Shared CSV parsing + validation
  phoneUtils.ts                 Phone normalization
middleware.ts                   HTTP Basic Auth
types/index.ts                  Shared domain types
```

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.local.example .env.local

# Run dev server
npm run dev
```

`.env.local` variables:

```
TURSO_DB_URL=file:data/wedding.db
TURSO_AUTH_TOKEN=                   # leave blank for local file DB
ADMIN_USER=admin
ADMIN_PASS=changeme
RESEND_API_KEY=
ADMIN_EMAIL=
```

Seed local database:

```bash
npx ts-node --skip-project --compiler-options '{"resolveJsonModule":true,"module":"commonjs","baseUrl":".","paths":{"@/*":["*"]}}' scripts/seed.ts
```

---

## Tests

```bash
npm test
```

Two Jest environments: `jsdom` for React component tests, `node` for API route tests. Backend tests mock the DB layer so no real database is needed.
