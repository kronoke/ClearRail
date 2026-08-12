'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function SignUpPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (password.length < 12) {
      setMessage('Use at least 12 characters for your password.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to verify your account before signing in.');
    }
    setLoading(false);
  }

  return (
    <main className="container">
      <nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav>
      <section className="hero" style={{ paddingTop: 40 }}>
        <h1 style={{ fontSize: 52 }}>Create merchant account</h1>
        <p className="lead">Email verification is required before access.</p>
      </section>
      <form className="card" onSubmit={handleSubmit}>
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" required />
        <label style={{ marginTop: 16 }}>Password</label>
        <input name="password" type="password" autoComplete="new-password" minLength={12} required />
        <button className="cta" style={{ marginTop: 24 }} disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        {message && <p>{message}</p>}
        <p style={{ marginTop: 20 }}>Already registered? <a href="/auth/login">Sign in</a></p>
      </form>
    </main>
  );
}
