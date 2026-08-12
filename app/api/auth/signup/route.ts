import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { EmailPasswordSchema, getClientIp, hashIdentifier, isSameOrigin, SECURITY_HEADERS } from '../../../../lib/security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });

  const parsed = EmailPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Use a valid email and a 12+ character password.' }, { status: 400, headers: SECURITY_HEADERS });

  const supabase = await createClient();
  const keyHash = hashIdentifier(`${getClientIp(request.headers)}|${parsed.data.email}`);
  const { data: allowed } = await supabase.rpc('check_auth_rate_limit', {
    p_bucket: 'auth.signup', p_key_hash: keyHash, p_limit: 5, p_window_seconds: 3600,
  });

  if (allowed !== true) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: SECURITY_HEADERS });

  const redirectTo = new URL('/security/mfa', request.url).toString();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) return NextResponse.json({ error: 'Unable to create account right now.' }, { status: 400, headers: SECURITY_HEADERS });
  return NextResponse.json({ ok: true, message: 'Check your email to continue.' }, { headers: SECURITY_HEADERS });
}
