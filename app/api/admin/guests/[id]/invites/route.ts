import { NextRequest, NextResponse } from 'next/server';
import db, { ensureSchema } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { teaCeremonyInvite, ceremonyInvite } = await req.json();

  await ensureSchema();
  await db.execute({
    sql: `UPDATE guests SET tea_ceremony_invite = ?, ceremony_invite = ? WHERE id = ?`,
    args: [teaCeremonyInvite ? 1 : 0, ceremonyInvite ? 1 : 0, id],
  });

  return NextResponse.json({ ok: true });
}
