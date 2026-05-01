'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
  JungianResults,
  getAssessmentStorageKey,
  removeStoredValue,
  useStoredAssessment,
  writeStoredJson,
} from '@/lib/assessment-storage';

const items = [
  { id: 1, text: 'I would rather', a: 'Solve anew and complicated problem.', b: 'Work on something I have done before.', mapA: 'N', mapB: 'S' },
  { id: 2, text: 'I like to', a: 'Work alone in a quiet place.', b: 'Be where the action is.', mapA: 'I', mapB: 'E' },
  { id: 3, text: 'I want a boss who', a: 'Establishes and applies criteria in decisions.', b: 'Considers individual needs and makes exceptions.', mapA: 'T', mapB: 'F' },
  { id: 4, text: 'When I work on a project, I', a: 'Like to finish it and get some closure.', b: 'Often leave it open for possible changes.', mapA: 'J', mapB: 'P' },
  { id: 5, text: 'When making a decision, the most important considerations are', a: 'Rational thoughts, ideas and data.', b: "People's feelings and values.", mapA: 'T', mapB: 'F' },
  { id: 6, text: 'On a project, I tend to', a: 'Think over and over before deciding how to proceed.', b: 'Start working on it right away, thinking about it as I go along.', mapA: 'I', mapB: 'E' },
  { id: 7, text: 'When working on a project, I', a: 'Maintain as much control as possible.', b: 'Explore various options.', mapA: 'J', mapB: 'P' },
  { id: 8, text: 'In my work, I prefer to', a: 'Work on several projects at a time, and learn as much as possible about each one.', b: 'Have one project that is challenging and keeps me busy.', mapA: 'P', mapB: 'J' },
] as const;

export default function JungianAssessment() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const storageKey = getAssessmentStorageKey('jungian_results', session?.user?.id);
  const hasCompleted = Boolean(useStoredAssessment<JungianResults>(storageKey));

  const handleRetake = () => {
    removeStoredValue(storageKey);
    setAnswers({});
  };

  const handleSelect = (id: number, value: 'A' | 'B') => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < items.length) {
      window.alert('Please answer all questions before submitting.');
      return;
    }

    const scores: JungianResults['scores'] = {
      I: 0,
      E: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0,
    };

    items.forEach((item) => {
      const answer = answers[item.id];
      const trait = answer === 'A' ? item.mapA : item.mapB;
      scores[trait] += 1;
    });

    const type = [
      scores.I > scores.E ? 'I' : 'E',
      scores.S > scores.N ? 'S' : 'N',
      scores.T > scores.F ? 'T' : 'F',
      scores.J > scores.P ? 'J' : 'P',
    ].join('');

    writeStoredJson(storageKey, { scores, type });
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
            You have already completed the Jungian 16-Type assessment. Would you
            like to retake it or view your existing results?
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
          Jungian 16-Type Assessment
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          For each item, select either A or B. If you feel both are true, decide
          which one is more like you.
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {item.id}. {item.text}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background:
                    answers[item.id] === 'A'
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${answers[item.id] === 'A' ? 'hsl(var(--primary))' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name={`item-${item.id}`}
                  value="A"
                  checked={answers[item.id] === 'A'}
                  onChange={() => handleSelect(item.id, 'A')}
                  style={{ accentColor: 'hsl(var(--primary))', width: '18px', height: '18px' }}
                />
                <span>A. {item.a}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background:
                    answers[item.id] === 'B'
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${answers[item.id] === 'B' ? 'hsl(var(--primary))' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name={`item-${item.id}`}
                  value="B"
                  checked={answers[item.id] === 'B'}
                  onChange={() => handleSelect(item.id, 'B')}
                  style={{ accentColor: 'hsl(var(--primary))', width: '18px', height: '18px' }}
                />
                <span>B. {item.b}</span>
              </label>
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
