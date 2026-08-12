import { NextResponse } from 'next/server';
import { CreateInvoiceSchema, isSameOrigin, SECURITY_HEADERS } from '../../../lib/security';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS });

  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
    return NextResponse.json({ error: 'Valid Idempotency-Key required' }, { status: 400, headers: SECURITY_HEADERS });
  }

  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS });

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== 'aal2') return NextResponse.json({ error: 'MFA required' }, { status: 403, headers: SECURITY_HEADERS });

  const { data: claimed } = await supabase.rpc('claim_idempotency_key', { p_scope: 'invoice.create', p_key: idempotencyKey });
  if (claimed !== true) return NextResponse.json({ error: 'Duplicate request' }, { status: 409, headers: SECURITY_HEADERS });

  const parsed = CreateInvoiceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: SECURITY_HEADERS });

  // Still a non-money-moving MVP. A real write will be added after merchant onboarding/KYB is implemented.
  return NextResponse.json({ invoiceId: crypto.randomUUID(), status: 'draft' }, { status: 201, headers: SECURITY_HEADERS });
}
