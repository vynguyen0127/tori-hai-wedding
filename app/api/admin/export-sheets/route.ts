import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAllGuests } from '@/lib/guests';

export async function POST() {
  try {
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!credentialsJson || !sheetId) {
      return NextResponse.json({ error: 'Google Sheets not configured.' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch current sheet to find header row and guest_id column
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:ZZ',
    });

    const rows = readRes.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({ error: 'Sheet is empty.' }, { status: 400 });
    }

    const headers = rows[0].map((h: string) => h.toLowerCase().replace(/\s+/g, '_'));

    const col = (name: string) => headers.indexOf(name);
    const guestIdCol   = col('guest_id');
    const rsvpCol      = col('rsvp_status');
    const teaRsvpCol   = col('tea_ceremony_rsvp');
    const ceremRsvpCol = col('ceremony_rsvp');
    const dietaryCol   = col('dietary_notes');
    const plusOneCol   = col('plus_one_name');

    if (guestIdCol === -1) {
      return NextResponse.json({ error: 'Sheet has no guest_id column.' }, { status: 400 });
    }

    // Build a map of guest_id → row index (1-based, header is row 1)
    const idToRowIndex = new Map<string, number>();
    for (let i = 1; i < rows.length; i++) {
      const id = rows[i][guestIdCol]?.trim();
      if (id) idToRowIndex.set(id, i + 1); // +1 because Sheets rows are 1-based
    }

    const guests = await getAllGuests();

    // Build batch update data
    const data: { range: string; values: string[][] }[] = [];

    function colLetter(colIndex: number): string {
      let letter = '';
      let n = colIndex + 1;
      while (n > 0) {
        const rem = (n - 1) % 26;
        letter = String.fromCharCode(65 + rem) + letter;
        n = Math.floor((n - 1) / 26);
      }
      return letter;
    }

    function cellRange(rowNum: number, colIndex: number): string {
      return `${colLetter(colIndex)}${rowNum}`;
    }

    let updated = 0;

    for (const guest of guests) {
      const rowNum = idToRowIndex.get(guest.guestId);
      if (!rowNum) continue;

      const updates: { col: number; value: string }[] = [];

      if (rsvpCol !== -1)      updates.push({ col: rsvpCol,      value: guest.rsvpStatus });
      if (teaRsvpCol !== -1)   updates.push({ col: teaRsvpCol,   value: guest.teaCeremonyRsvp ?? '' });
      if (ceremRsvpCol !== -1) updates.push({ col: ceremRsvpCol, value: guest.ceremonyRsvp ?? '' });
      if (dietaryCol !== -1)   updates.push({ col: dietaryCol,   value: guest.dietaryNotes });
      if (plusOneCol !== -1)   updates.push({ col: plusOneCol,   value: guest.plusOneName });

      for (const { col: colIdx, value } of updates) {
        data.push({
          range: cellRange(rowNum, colIdx),
          values: [[value]],
        });
      }

      updated++;
    }

    if (data.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, message: 'No matching guests found in sheet.' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data,
      },
    });

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error('[/api/admin/export-sheets]', err);
    return NextResponse.json({ error: 'Export failed. Check server logs.' }, { status: 500 });
  }
}
