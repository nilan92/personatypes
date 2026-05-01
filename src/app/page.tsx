'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  Compass,
  Sparkles,
  TimerReset,
} from 'lucide-react';
import { useSession, startGoogleSignIn } from '@/lib/auth-client';
import GoogleAd from '@/components/GoogleAd';

const assessments = [
  {
    href: '/assessments/basic',
    image: '/images/basic_assessment_1777401801429.png',
    alt: 'Big Five',
    title: 'Big Five Personality',
    description:
      'Assess your openness, conscientiousness, extraversion, agreeableness, and neuroticism (OCEAN).',
    eyebrow: 'Trait map',
    accent: 'Sunburst',
    icon: BrainCircuit,
  },
  {
    href: '/assessments/jungian',
    image: '/images/mbti_assessment_1777401822201.png',
    alt: 'Jungian 16-type',
    title: 'Jungian 16-Type',
    description:
      'Discover your cognitive preferences across 4 dichotomies, precursor to the widely known MBTI framework.',
    eyebrow: 'Type finder',
    accent: 'Prism',
    icon: Compass,
  },
  {
    href: '/assessments/type-ab',
    image: '/images/type_ab_assessment_1777401956113.png',
    alt: 'Type A vs B',
    title: 'Type A vs Type B',
    description:
      'Evaluate your stress responses, urgency, and competitiveness based on the Robbins and Judge framework.',
    eyebrow: 'Energy pulse',
    accent: 'Velocity',
    icon: TimerReset,
  },
] as const;

const highlights = [
  { label: 'Profiles', value: '3' },
  { label: 'Visual results', value: 'Live' },
  { label: 'Style', value: 'Fun' },
] as const;

export default function Home() {
  const { data: session } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const errorMessage = await startGoogleSignIn();

    if (errorMessage) {
      setAuthError(errorMessage);
    }
  };

  return (
    <div className="home-shell animate-slide-up">
      <section className="hero-stage">
        <div className="hero-copy">
          <motion.div
            className="hero-kicker"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>Personality exploration for curious minds</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {session ? (
              <>
                Welcome back,{' '}
                <span className="text-gradient">
                  {session.user.name?.split(' ')[0] || 'User'}
                </span>
                . Ready for your next pattern?
              </>
            ) : (
              <>
                Explore your <span className="text-gradient">personality atlas</span>{' '}
                with more color, motion, and insight.
              </>
            )}
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            A playful set of personality assessments designed to reveal work style,
            temperament, and decision-making patterns through visual, approachable
            feedback.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="#assessments" className="btn btn-primary hero-primary-button">
              <span>Start Exploring</span>
              <ArrowRight size={18} />
            </Link>

            {!session ? (
              <button
                onClick={handleGoogleLogin}
                className="btn hero-secondary-button"
              >
                <Sparkles size={18} />
                <span>Save My Progress</span>
              </button>
            ) : (
              <Link href="/results" className="btn hero-secondary-button">
                <BrainCircuit size={18} />
                <span>View My Results</span>
              </Link>
            )}
          </motion.div>

          <motion.div
            className="hero-highlights"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            {highlights.map((highlight) => (
              <div key={highlight.label} className="hero-highlight-pill glass">
                <span className="hero-highlight-value">{highlight.value}</span>
                <span className="hero-highlight-label">{highlight.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-float-card hero-float-card-top glass">
            <span className="hero-float-label">Mood map</span>
            <span className="hero-float-value">Balanced + bright</span>
          </div>
          <div className="hero-float-card hero-float-card-bottom glass">
            <span className="hero-float-label">Session vibe</span>
            <span className="hero-float-value">Insight in motion</span>
          </div>
          <div className="hero-image-frame glass">
            <div className="hero-image-aura" />
            <div className="hero-image-wrap">
              <Image
                src="/images/landing_hero_1777401570423.png"
                alt="Human personality and minds"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                className="hero-fit-image"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section id="assessments" className="assessment-section">
        <div className="section-heading">
          <span className="section-kicker">Choose your route</span>
          <h2 className="section-title">Three ways to read your inner weather</h2>
          <p className="section-description">
            Pick a format that matches your curiosity, whether you want broad
            traits, psychological type, or a fast-paced behavioral profile.
          </p>
        </div>

        {authError ? (
          <div className="glass home-alert">
            Google sign-in could not be started. {authError}
          </div>
        ) : null}

        <GoogleAd style={{ maxWidth: '728px', margin: '0 auto 3rem auto' }} />

        <motion.div
          className="assessment-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {assessments.map((assessment, index) => {
            const Icon = assessment.icon;

            return (
              <motion.article
                key={assessment.href}
                variants={itemVariants}
                className="assessment-card glass"
                style={{ rotate: index === 1 ? 0 : index % 2 === 0 ? -1 : 1 }}
              >
                <div className="assessment-card-top">
                  <div className="assessment-meta">
                    <span className="assessment-eyebrow">{assessment.eyebrow}</span>
                    <span className="assessment-accent">{assessment.accent}</span>
                  </div>
                  <div className="assessment-icon-badge">
                    <Icon size={18} />
                  </div>
                </div>

                <div className="assessment-image-shell">
                  <div className="assessment-image-glow" />
                  <div className="assessment-image-wrap">
                    <Image
                      src={assessment.image}
                      alt={assessment.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="fit-image"
                    />
                  </div>
                </div>

                <div className="assessment-copy">
                  <h3 className="assessment-title">{assessment.title}</h3>
                  <p className="assessment-description">{assessment.description}</p>
                </div>

                {session ? (
                  <Link href={assessment.href} className="btn assessment-button">
                    <span>Take Assessment</span>
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <button onClick={handleGoogleLogin} className="btn assessment-button">
                    <span>Login to Begin</span>
                    <ArrowRight size={17} />
                  </button>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
