'use client';
import { FormEvent,useState } from 'react';
export default function ForgotPassword(){
  const [message,setMessage]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=new FormData(e.currentTarget);await fetch('/api/auth/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:String(form.get('email')||'')})});setMessage('If that email is registered, a reset link is on the way.');}
  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:48}}>Reset password</h1></section><form className="card" onSubmit={submit}><label>Email</label><input name="email" type="email" required/><button className="cta" style={{marginTop:20}}>Send reset link</button>{message&&<p>{message}</p>}</form></main>;
}
