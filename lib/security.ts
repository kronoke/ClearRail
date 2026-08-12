import { z } from 'zod';

export const CreateInvoiceSchema = z.object({
  merchantId: z.string().uuid(),
  customerEmail: z.string().email().max(254),
  amountCents: z.number().int().positive().max(10_000_000),
  currency: z.literal('USD'),
  memo: z.string().trim().min(1).max(240),
});

export function redact(value:string){
  if (value.length <= 4) return '••••';
  return `••••${value.slice(-4)}`;
}

export const SECURITY_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
