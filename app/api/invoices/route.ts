import { NextRequest, NextResponse } from 'next/server';
import { CreateInvoiceSchema, SECURITY_HEADERS } from '../../../lib/security';

export async function POST(req:NextRequest){
  const parsed = CreateInvoiceSchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:'Invalid request'}, {status:400, headers:SECURITY_HEADERS});

  // Production: authenticated merchant identity, RBAC, idempotency key,
  // server-side authorization, encrypted database write, and append-only audit event.
  const invoiceId = crypto.randomUUID();
  const requestToken = crypto.randomUUID();
  return NextResponse.json({invoiceId, requestToken, status:'draft'}, {status:201, headers:SECURITY_HEADERS});
}
