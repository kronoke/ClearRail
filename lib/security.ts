import { createHash } from 'crypto';
import { z } from 'zod';

export const EmailPasswordSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(200),
});

export const EmailOnlySchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

export const CreateInvoiceSchema = z.object({
  customerEmail: z.string().email().max(254),
  amountCents: z.number().int().positive().max(10_000_000),
  currency: z.literal('USD'),
  memo: z.string().trim().min(1).max(240),
});

export function redact(value: string) {
  if (value.length <= 4) return '••••';
  return `••••${value.slice(-4)}`;
}

export function hashIdentifier(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export const SECURITY_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
