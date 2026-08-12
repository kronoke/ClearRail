import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(req:NextRequest){
  const res=NextResponse.next();
  res.headers.set('X-Content-Type-Options','nosniff');
  res.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.headers.set('X-Frame-Options','DENY');
  res.headers.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return res;
}
