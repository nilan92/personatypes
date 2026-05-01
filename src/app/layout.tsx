import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Persona Atlas',
  description: 'Interactive personality assessments with visual results and reflective insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <main className="container">{children}</main>
      </body>
      {adSenseId ? (
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
          crossOrigin="anonymous"
        />
      ) : null}
    </html>
  );
}
