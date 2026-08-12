'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

type Enrollment = { factorId: string; qrCode: string; secret: string };

export default function MfaPage() {
  const router = useRouter();
  const [mode,setMode]=useState<'loading'|'enroll'|'challenge'>('loading');
  const [enrollment,setEnrollment]=useState<Enrollment|null>(null);
  const [factorId,setFactorId]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{ void prepare(); },[]);

  async function prepare(){
    const supabase=createClient();
    const { data: claims }=await supabase.auth.getClaims();
    if(!claims?.claims?.sub){ router.replace('/auth/login'); return; }
    const { data: aal }=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if(aal?.currentLevel==='aal2'){ router.replace('/dashboard'); return; }
    const { data: factors }=await supabase.auth.mfa.listFactors();
    const verified=factors?.totp?.find((factor)=>factor.status==='verified');
    if(verified){ setFactorId(verified.id); setMode('challenge'); return; }
    const { data, error }=await supabase.auth.mfa.enroll({factorType:'totp',friendlyName:'ClearRail Authenticator'});
    if(error||!data?.totp){ setMessage(error?.message||'Unable to start MFA enrollment.'); return; }
    setFactorId(data.id); setEnrollment({factorId:data.id,qrCode:data.totp.qr_code,secret:data.totp.secret}); setMode('enroll');
  }

  async function verify(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setBusy(true); setMessage('');
    const code=String(new FormData(event.currentTarget).get('code')||'').replace(/\s/g,'');
    const supabase=createClient();
    const { data: challenge, error: challengeError }=await supabase.auth.mfa.challenge({factorId});
    if(challengeError||!challenge){ setMessage('Unable to create MFA challenge.'); setBusy(false); return; }
    const { error }=await supabase.auth.mfa.verify({factorId,challengeId:challenge.id,code});
    if(error){ setMessage('That code was not accepted. Try the newest code from your authenticator app.'); setBusy(false); return; }
    router.replace('/dashboard'); router.refresh();
  }

  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:48}}>Secure your account</h1><p className="lead">ClearRail requires authenticator-app MFA for merchant access.</p></section><div className="card">{mode==='loading'&&<p>Preparing secure sign-in…</p>}{mode==='enroll'&&enrollment&&<><h2>1. Add ClearRail to your authenticator app</h2><img src={enrollment.qrCode} alt="MFA QR code" width={220} height={220}/><p>If you cannot scan it, enter this secret manually:</p><code style={{wordBreak:'break-all'}}>{enrollment.secret}</code><h2 style={{marginTop:28}}>2. Enter the 6-digit code</h2><form onSubmit={verify}><input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/><button className="cta" style={{marginTop:16}} disabled={busy}>{busy?'Verifying…':'Verify and continue'}</button></form></>}{mode==='challenge'&&<><h2>Enter your authenticator code</h2><form onSubmit={verify}><input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/><button className="cta" style={{marginTop:16}} disabled={busy}>{busy?'Verifying…':'Verify and continue'}</button></form></>}{message&&<p>{message}</p>}</div></main>;
}
