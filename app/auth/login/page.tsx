'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="container">
      <nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav>
      <section className="hero" style={{ paddingTop: 40 }}>
        <h1 style={{ fontSize: 52 }}>Merchant login</h1>
        <p className="lead">Secure access to your ClearRail business workspace.</p>
      </section>
      <form className="card" onSubmit={handleSubmit}>
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" required />
        <label style={{ marginTop: 16 }}>Password</label>
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
        <button className="cta" style={{ marginTop: 24 }} disabled={loading} type="submit">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {message && <p>{message}</p>}
        <p style={{ marginTop: 20 }}>New merchant? <a href="/auth/sign-up">Create an account</a></p>
      </form>
    </main>
  );
}
