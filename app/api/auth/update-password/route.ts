import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '../../../../lib/supabase/server';
import { isSameOrigin, SECURITY_HEADERS } from '../../../../lib/security';

const Schema = z.object({ password: z.string().min(12).max(200) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Use at least 12 characters.' }, { status: 400, headers: SECURITY_HEADERS });
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !data?.claims?.sub) return NextResponse.json({ error: 'Your reset session is invalid or expired.' }, { status: 401, headers: SECURITY_HEADERS });
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return NextResponse.json({ error: 'Unable to update password.' }, { status: 400, headers: SECURITY_HEADERS });
  return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS });
}
