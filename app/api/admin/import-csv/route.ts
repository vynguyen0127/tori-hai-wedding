/**
 * POST /api/admin/import-csv
 * Accepts a multipart form upload with a single "file" field containing CSV text.
 * Protected by middleware.ts (HTTP Basic Auth).
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseCsvText, importRows } from '@/lib/csv-import';
import type { RowError } from '@/lib/csv-import';

export interface ImportCsvResponse {
  imported: number;
  errors: RowError[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ImportCsvResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ imported: 0, errors: [{ lineNumber: 0, message: 'No file uploaded.' }] }, { status: 400 });
    }

    const text = await (file as File).text();
    const { valid, errors } = parseCsvText(text);

    // Return validation errors without writing anything
    if (errors.length > 0) {
      return NextResponse.json({ imported: 0, errors });
    }

    await importRows(valid);
    return NextResponse.json({ imported: valid.length, errors: [] });
  } catch (err) {
    console.error('[/api/admin/import-csv]', err);
    return NextResponse.json(
      { imported: 0, errors: [{ lineNumber: 0, message: 'Server error. Please try again.' }] },
      { status: 500 }
    );
  }
}
