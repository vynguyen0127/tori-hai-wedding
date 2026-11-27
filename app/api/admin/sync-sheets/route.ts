import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { parseCsvText, importRows } from '@/lib/csv-import';

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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({ error: 'Sheet is empty or has no data rows.' }, { status: 400 });
    }

    // Convert 2D array to CSV text so we can reuse the existing parser/validator
    const csvText = rows
      .map((row) =>
        row.map((cell: string) => {
          const s = String(cell ?? '');
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        }).join(',')
      )
      .join('\n');

    const { valid, errors } = parseCsvText(csvText);

    if (valid.length === 0 && errors.length > 0) {
      return NextResponse.json({ error: 'All rows failed validation.', errors }, { status: 400 });
    }

    await importRows(valid);

    return NextResponse.json({
      ok: true,
      imported: valid.length,
      skipped: errors.length,
      errors,
    });
  } catch (err) {
    console.error('[/api/admin/sync-sheets]', err);
    return NextResponse.json({ error: 'Sync failed. Check server logs.' }, { status: 500 });
  }
}
