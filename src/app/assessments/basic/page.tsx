'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
  BasicResults,
  getAssessmentStorageKey,
  removeStoredValue,
  useStoredAssessment,
  writeStoredJson,
} from '@/lib/assessment-storage';

const items = [
  { id: 1, left: 'Quiet', right: 'Talkative', trait: 'E', reverse: false },
  { id: 2, left: 'Tolerant', right: 'Critical', trait: 'A', reverse: true },
  { id: 3, left: 'Disorganized', right: 'Organized', trait: 'C', reverse: false },
  { id: 4, left: 'Tense', right: 'Calm', trait: 'ES', reverse: false },
  { id: 5, left: 'Imaginative', right: 'Conventional', trait: 'O', reverse: true },
  { id: 6, left: 'Reserved', right: 'Outgoing', trait: 'E', reverse: false },
  { id: 7, left: 'Uncooperative', right: 'Cooperative', trait: 'A', reverse: false },
  { id: 8, left: 'Dependable', right: 'Unreliable', trait: 'C', reverse: true },
  { id: 9, left: 'Insecure', right: 'Secure', trait: 'ES', reverse: false },
  { id: 10, left: 'Familiar', right: 'New', trait: 'O', reverse: false },
  { id: 11, left: 'Sociable', right: 'Loner', trait: 'E', reverse: true },
  { id: 12, left: 'Suspicious', right: 'Trusting', trait: 'A', reverse: false },
  { id: 13, left: 'Undirected', right: 'Goal-oriented', trait: 'C', reverse: false },
  { id: 14, left: 'Enthusiastic', right: 'Depressed', trait: 'ES', reverse: true },
  { id: 15, left: 'Status Quo', right: 'Change', trait: 'O', reverse: false },
] as const;

export default function BasicAssessment() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const storageKey = getAssessmentStorageKey('basic_results', session?.user?.id);
  const hasCompleted = Boolean(useStoredAssessment<BasicResults>(storageKey));

  const handleRetake = () => {
    removeStoredValue(storageKey);
    setAnswers({});
  };

  const handleSelect = (id: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < items.length) {
      window.alert('Please answer all questions before submitting.');
      return;
    }

    const scores: BasicResults = { E: 0, A: 0, C: 0, ES: 0, O: 0 };

    items.forEach((item) => {
      let score = answers[item.id];
      if (item.reverse) {
        score = 6 - score;
      }
      scores[item.trait] += score;
    });

    writeStoredJson(storageKey, scores);
    router.push('/results');
  };

  if (isPending) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (hasCompleted) {
    return (
      <div
        className="animate-slide-up"
        style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem', textAlign: 'center' }}
      >
        <div className="glass" style={{ padding: '3rem', borderRadius: '1rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Assessment Completed</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
            You have already completed the Big Five Personality assessment. Would
            you like to retake it or view your existing results?
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
          Basic Personality Assessment
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Select the number along the scale that mostly describes your preferences.
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

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              {[1, 2, 3, 4, 5].map((value) => (
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
                      width: '24px',
                      height: '24px',
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
