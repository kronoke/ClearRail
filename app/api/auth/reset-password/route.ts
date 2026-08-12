import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { EmailOnlySchema, getClientIp, hashIdentifier, isSameOrigin, SECURITY_HEADERS } from '../../../../lib/security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });

  const parsed = EmailOnlySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS });

  const supabase = await createClient();
  const keyHash = hashIdentifier(`${getClientIp(request.headers)}|${parsed.data.email}`);
  const { data: allowed } = await supabase.rpc('check_auth_rate_limit', {
    p_bucket: 'auth.reset', p_key_hash: keyHash, p_limit: 4, p_window_seconds: 3600,
  });

  if (allowed === true) {
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: new URL('/auth/update-password', request.url).toString(),
    });
  }

  // Never reveal whether an email exists.
  return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS });
}
