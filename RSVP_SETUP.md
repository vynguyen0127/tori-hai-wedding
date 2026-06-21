# RSVP System — Setup Guide

## 1. Google Sheet structure

Create a new Google Sheet. Name the first tab exactly **`guests`** (lowercase).

Add these headers in **Row 1**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guest_id | household_id | household_name | first_name | last_name | phone | email | rsvp_status | meal_preference | dietary_notes | song_request | plus_one_allowed | plus_one_name | rsvp_submitted_at |

**Sample data (Row 2+):**

```
g001  h001  The Nguyen Family  Nhi     Nguyen  8005551234  nhi@email.com  pending   …  …  …  FALSE  …  …
g002  h001  The Nguyen Family  Ba      Nguyen  9005559876  ba@email.com   pending   …  …  …  FALSE  …  …
g003  h002  The Tran Family    Minh    Tran    7775554321  minh@email.com pending   …  …  …  TRUE   …  …
```

**Rules:**
- `guest_id` must be unique per row (g001, g002, …)
- `household_id` must match across all members of the same household
- `phone` stored as 10 digits, no formatting (strips happen in code)
- `rsvp_status` starts as `pending`; code writes `attending` or `declined`
- `plus_one_allowed` is `TRUE` or `FALSE` (uppercase)

---

## 2. Google Cloud service account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or select an existing one)
3. **APIs & Services → Enable APIs** → search for **Google Sheets API** → Enable
4. **APIs & Services → Credentials → Create Credentials → Service Account**
   - Name it `wedding-rsvp` (or anything)
   - Skip role assignment
5. Click the service account → **Keys → Add Key → JSON**
   - A `.json` file downloads — keep it safe, never commit it
6. Copy the service account email (looks like `wedding-rsvp@your-project.iam.gserviceaccount.com`)

---

## 3. Share the sheet with the service account

In your Google Sheet: **Share → paste the service account email → Editor**.

This lets the server read and write the sheet without OAuth.

---

## 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Sheet ID from the URL: /spreadsheets/d/[THIS]/edit
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Compact the JSON key to a single line first:
#   cat service-account.json | python3 -m json.tool --compact
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

---

## 5. Install & run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000/rsvp](http://localhost:3000/rsvp)

---

## How it works

```
Guest enters phone number
        ↓
POST /api/rsvp/lookup
  → normalizes phone to 10 digits
  → loads guest list from Sheets (cached 60s)
  → finds matching phone → returns household
        ↓
RSVP form renders (one card per household member)
        ↓
POST /api/rsvp/submit
  → validates all statuses & meals
  → verifies guestIds belong to claimed householdId
  → writes attending/declined, meal, dietary, song, plus-one back to sheet
  → busts cache
        ↓
Confirmation screen
```

---

## Managing the guest list (for Nhi)

You can edit the Google Sheet directly at any time:
- **Add a new household:** add rows with a new `household_id` and `household_name`
- **Add a guest to an existing household:** add a row with the same `household_id`
- **Change their phone number:** just edit the `phone` cell
- **The site picks up changes within 60 seconds** (cache TTL)

No code changes needed to update the guest list.
