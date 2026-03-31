import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/auth
 * Body: { key: string }
 *
 * Checks the provided key against the DASHBOARD_PASSWORD env variable.
 * Returns { ok: true } on match, 401 otherwise.
 */
export async function POST(req: NextRequest) {
  const body = await req.json() as { key?: string };

  const expected = process.env.DASHBOARD_PASSWORD;

  if (!expected) {
    // No password set — allow all access (development mode)
    return NextResponse.json({ ok: true, dev: true });
  }

  if (body.key === expected) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: 'Invalid access key.' },
    { status: 401 }
  );
}
