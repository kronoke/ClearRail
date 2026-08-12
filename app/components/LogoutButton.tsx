'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton(){
  const router=useRouter();
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); router.replace('/auth/login'); router.refresh(); }
  return <button className="badge" onClick={logout} type="button">Sign out</button>;
}
