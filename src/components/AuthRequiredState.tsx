'use client';

import Link from 'next/link';
import { Lock, LogIn } from 'lucide-react';
import { startGoogleSignIn } from '@/lib/auth-client';

interface AuthRequiredStateProps {
  title: string;
  description: string;
}

export default function AuthRequiredState({
  title,
  description,
}: AuthRequiredStateProps) {
  const handleGoogleLogin = async () => {
    const errorMessage = await startGoogleSignIn();
    if (errorMessage) {
      window.alert(`Login Error: ${errorMessage}`);
    }
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        maxWidth: '820px',
        margin: '0 auto',
        paddingBottom: '4rem',
        textAlign: 'center',
      }}
    >
      <div className="glass" style={{ padding: '3rem', borderRadius: '1.25rem' }}>
        <div
          style={{
            width: '4rem',
            height: '4rem',
            margin: '0 auto 1.25rem',
            borderRadius: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(255, 107, 107, 0.22))',
            color: 'white',
          }}
        >
          <Lock size={24} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h2>
        <p
          style={{
            color: 'hsl(var(--muted-foreground))',
            maxWidth: '34rem',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button onClick={handleGoogleLogin} className="btn btn-primary">
            <LogIn size={18} />
            <span style={{ marginLeft: '0.5rem' }}>Login with Google</span>
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
