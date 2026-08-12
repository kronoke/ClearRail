import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import LogoutButton from '../components/LogoutButton';

const demo={id:'inv_1007',customer:'Northeast Property Group',amount:'$8,450.00',status:'PAYMENT REQUEST READY',token:'demo-secure-request'};

export default async function Dashboard(){
  const supabase=await createClient();
  const {data,error}=await supabase.auth.getClaims();
  if(error||!data?.claims?.sub) redirect('/auth/login');
  const {data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal?.currentLevel!=='aal2') redirect('/security/mfa');

  return <main className="container"><nav className="nav"><a className="brand" href="/">CLEARRAIL</a><LogoutButton/></nav><section className="hero" style={{paddingTop:40}}><h1 style={{fontSize:56}}>Invoice dashboard</h1><p className="lead">MFA verified. Real payment movement remains disabled while we complete compliance and payment-provider integration.</p></section><div className="card"><div className="kv"><b>Invoice</b><span>{demo.id}</span></div><div className="kv"><b>Customer</b><span>{demo.customer}</span></div><div className="kv"><b>Amount</b><span>{demo.amount}</span></div><div className="kv"><b>Status</b><span>{demo.status}</span></div><a className="cta" href={`/pay/${demo.token}`}>Preview customer payment request</a></div></main>;
}
