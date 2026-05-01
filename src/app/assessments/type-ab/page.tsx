'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import AuthRequiredState from '@/components/AuthRequiredState';
import {
  persistAssessmentResult,
  useAssessmentResults,
} from '@/lib/assessment-results-client';

const items = [
  { id: 1, left: 'Casual about appointments', right: 'Never late' },
  { id: 2, left: 'Not competitive', right: 'Very competitive' },
  { id: 3, left: 'Never feel rushed', right: 'Always feel rushed' },
  { id: 4, left: 'Take things one at a time', right: 'Try to do many things at once' },
  { id: 5, left: 'Slow doing things (eating, walking, etc.)', right: 'Fast doing things' },
  { id: 6, left: 'Express feelings', right: '"Sit on" feelings' },
  { id: 7, left: 'Many interests outside work', right: 'Few interests outside work' },
] as const;

export default function TypeABAssessment() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isRetaking, setIsRetaking] = useState(false);
  const { results, history, isLoading: isResultsLoading } = useAssessmentResults(session?.user?.id);
  const existingResults = results.typeab_results;
  const hasCompleted = Boolean(existingResults) || history.typeab_results.length > 0;

  const handleRetake = () => {
    setIsRetaking(true);
    setAnswers({});
  };

  const handleSelect = (id: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < items.length) {
      window.alert('Please answer all questions before submitting.');
      return;
    }

    let totalScore = 0;
    Object.values(answers).forEach((score) => {
      totalScore += score;
    });

    const saveError = await persistAssessmentResult('typeab_results', { total: totalScore });
    if (saveError) {
      window.alert(`We couldn't save your result to your account yet: ${saveError}. Please try again.`);
      return;
    }

    setIsRetaking(false);
    router.push('/results');
  };

  if (isPending || (session && isResultsLoading)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthRequiredState
        title="Login Required"
        description="Sign in to take the Type A vs Type B assessment and save your behavioral profile for later."
      />
    );
  }

  if (hasCompleted && !isRetaking) {
    return (
      <div
        className="animate-slide-up"
        style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem', textAlign: 'center' }}
      >
        <div className="glass" style={{ padding: '3rem', borderRadius: '1rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Assessment Completed</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
            You already have one or more Type A vs Type B results saved. Would
            you like to take it again or review your saved history?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleRetake} className="btn btn-secondary">
              Retake Assessment
            </button>
            <button onClick={() => router.push('/results')} className="btn btn-primary">
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-gradient">
          Type A vs Type B Assessment
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Select the number along the scale (1 to 8) that best describes your
          behavior.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              marginBottom: '2rem',
              paddingBottom: index !== items.length - 1 ? '1.5rem' : 0,
              borderBottom:
                index !== items.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                fontWeight: 500,
              }}
            >
              <span style={{ color: 'hsl(var(--primary))' }}>{item.left}</span>
              <span style={{ color: 'hsl(var(--primary))' }}>{item.right}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                <label
                  key={value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name={`item-${item.id}`}
                    value={value}
                    checked={answers[item.id] === value}
                    onChange={() => handleSelect(item.id, value)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: 'hsl(var(--primary))',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <span
                    style={{
                      color:
                        answers[item.id] === value
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                      fontWeight: answers[item.id] === value ? 'bold' : 'normal',
                      fontSize: '0.9rem',
                    }}
                  >
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 3rem', fontSize: '1.1rem' }}>
            View Results
          </button>
        </div>
      </form>
    </div>
  );
}
