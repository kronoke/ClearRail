import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isSameOrigin, SECURITY_HEADERS } from '../../../../lib/security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS });
}
