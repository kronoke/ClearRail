'use client';

import { FormEvent, useState } from 'react';

export default function SignUpPage() {
  const [message,setMessage]=useState(''); const [loading,setLoading]=useState(false);
  async function handleSubmit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setLoading(true); setMessage(''); const form=new FormData(event.currentTarget);
    const response=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:String(form.get('email')||''),password:String(form.get('password')||'')})});
    const body=await response.json().catch(()=>({})); setMessage(response.ok?(body.message||'Check your email to continue.'):(body.error||'Unable to create account.')); setLoading(false);
  }
  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:52}}>Create merchant account</h1><p className="lead">Email verification and authenticator-app MFA are required.</p></section><form className="card" onSubmit={handleSubmit}><label>Email</label><input name="email" type="email" autoComplete="email" required/><label style={{marginTop:16}}>Password</label><input name="password" type="password" autoComplete="new-password" minLength={12} required/><button className="cta" style={{marginTop:24}} disabled={loading}>{loading?'Creating…':'Create account'}</button>{message&&<p>{message}</p>}<p style={{marginTop:20}}>Already registered? <a href="/auth/login">Sign in</a></p></form></main>;
}
