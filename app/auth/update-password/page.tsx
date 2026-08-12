'use client';
import { FormEvent,useState } from 'react';
import { useRouter } from 'next/navigation';
export default function UpdatePassword(){
  const router=useRouter(); const [message,setMessage]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=new FormData(e.currentTarget);const response=await fetch('/api/auth/update-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:String(form.get('password')||'')})});const body=await response.json().catch(()=>({}));if(!response.ok){setMessage(body.error||'Unable to update password.');return;}router.replace('/security/mfa');router.refresh();}
  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:48}}>Choose a new password</h1></section><form className="card" onSubmit={submit}><label>New password</label><input name="password" type="password" autoComplete="new-password" minLength={12} required/><button className="cta" style={{marginTop:20}}>Update password</button>{message&&<p>{message}</p>}</form></main>;
}
