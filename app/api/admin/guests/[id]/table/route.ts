import { NextRequest, NextResponse } from 'next/server';
import { setTableNumber } from '@/lib/guests';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const tableNumber = body.tableNumber === null || body.tableNumber === '' ? null : Number(body.tableNumber);

  if (tableNumber !== null && (isNaN(tableNumber) || tableNumber < 1)) {
    return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });
  }

  await setTableNumber(id, tableNumber);
  return NextResponse.json({ ok: true });
}
