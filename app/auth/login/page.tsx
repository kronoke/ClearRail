'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(form.get('email') || ''), password: String(form.get('password') || '') }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.error || 'Unable to sign in.'); setLoading(false); return; }
    router.replace('/dashboard'); router.refresh();
  }

  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:52}}>Merchant login</h1><p className="lead">Protected merchant access with mandatory MFA.</p></section><form className="card" onSubmit={handleSubmit}><label>Email</label><input name="email" type="email" autoComplete="email" required/><label style={{marginTop:16}}>Password</label><input name="password" type="password" autoComplete="current-password" minLength={12} required/><button className="cta" style={{marginTop:24}} disabled={loading}>{loading?'Signing in…':'Sign in'}</button>{message&&<p>{message}</p>}<p style={{marginTop:20}}><a href="/auth/forgot-password">Forgot password?</a></p><p>New merchant? <a href="/auth/sign-up">Create an account</a></p></form></main>;
}
