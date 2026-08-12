import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { EmailPasswordSchema, getClientIp, hashIdentifier, isSameOrigin, SECURITY_HEADERS } from '../../../../lib/security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });

  const parsed = EmailPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400, headers: SECURITY_HEADERS });

  const supabase = await createClient();
  const keyHash = hashIdentifier(`${getClientIp(request.headers)}|${parsed.data.email}`);
  const { data: allowed, error: limitError } = await supabase.rpc('check_auth_rate_limit', {
    p_bucket: 'auth.login', p_key_hash: keyHash, p_limit: 8, p_window_seconds: 900,
  });

  if (limitError || allowed !== true) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: SECURITY_HEADERS });
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401, headers: SECURITY_HEADERS });

  return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS });
}
