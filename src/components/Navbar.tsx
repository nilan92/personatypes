'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useSession, signOut, startGoogleSignIn } from '../lib/auth-client';

const navLinks = [
  { name: 'Big Five', path: '/assessments/basic' },
  { name: 'Jungian 16', path: '/assessments/jungian' },
  { name: 'Type A/B', path: '/assessments/type-ab' },
  { name: 'Results', path: '/results' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleGoogleLogin = async () => {
    const errorMessage = await startGoogleSignIn();
    if (errorMessage) {
      window.alert(`Login Error: ${errorMessage}`);
    }
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="nav-shell glass"
    >
      <div className="nav-top-row">
        <Link href="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
          <div className="nav-brand-mark">PA</div>
          <div className="nav-brand-copy">
            <span className="nav-brand-title text-gradient">Persona Atlas</span>
            <span className="nav-brand-subtitle">Profiles, patterns, perspective</span>
          </div>
        </Link>

        <button
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className={`nav-content ${mobileOpen ? 'is-open' : ''}`}>
        <div className="nav-links-panel">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {isActive ? <motion.span layoutId="nav-active-pill" className="nav-link-pill" /> : null}
                <span className="nav-link-label">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          {isPending ? (
            <div className="nav-skeleton" />
          ) : session ? (
            <div className="nav-user-panel">
              <div className="nav-user-card">
                <div className="nav-user-avatar">
                  {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="nav-user-copy">
                  <span className="nav-user-name">
                    {session.user.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="nav-user-role">Explorer</span>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="nav-ghost-button"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-cta-panel">
              <div className="nav-cta-copy">
                <span className="nav-cta-eyebrow">Start your profile</span>
                <span className="nav-cta-text">Sign in to save results and compare assessments.</span>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="btn btn-primary nav-login-button"
              >
                <LogIn size={18} />
                <span>Login with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
