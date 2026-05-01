import type { Metadata } from 'next';
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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
