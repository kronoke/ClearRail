import './globals.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ClearRail — Secure bank payments', description: 'Secure check-replacement payment request MVP' };

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
