'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import AuthRequiredState from '@/components/AuthRequiredState';
import {
  persistAssessmentResult,
  useAssessmentResults,
} from '@/lib/assessment-results-client';
import { JungianResults } from '@/lib/assessment-storage';

const items = [
  { id: 1, text: 'I would rather', a: 'Solve anew and complicated problem.', b: 'Work on something I have done before.', mapA: 'N', mapB: 'S' },
  { id: 2, text: 'I like to', a: 'Work alone in a quiet place.', b: 'Be where the action is.', mapA: 'I', mapB: 'E' },
  { id: 3, text: 'I want a boss who', a: 'Establishes and applies criteria in decisions.', b: 'Considers individual needs and makes exceptions.', mapA: 'T', mapB: 'F' },
  { id: 4, text: 'When I work on a project, I', a: 'Like to finish it and get some closure.', b: 'Often leave it open for possible changes.', mapA: 'J', mapB: 'P' },
  { id: 5, text: 'When making a decision, the most important considerations are', a: 'Rational thoughts, ideas and data.', b: "People's feelings and values.", mapA: 'T', mapB: 'F' },
  { id: 6, text: 'On a project, I tend to', a: 'Think over and over before deciding how to proceed.', b: 'Start working on it right away, thinking about it as I go along.', mapA: 'I', mapB: 'E' },
  { id: 7, text: 'When working on a project, I', a: 'Maintain as much control as possible.', b: 'Explore various options.', mapA: 'J', mapB: 'P' },
  { id: 8, text: 'In my work, I prefer to', a: 'Work on several projects at a time, and learn as much as possible about each one.', b: 'Have one project that is challenging and keeps me busy.', mapA: 'P', mapB: 'J' },
  { id: 9, text: 'I often', a: 'Make lists and plans when I start something, and may hate to seriously alter my plans.', b: 'Avoid plans and just let things progress as I work on them.', mapA: 'J', mapB: 'P' },
  { id: 10, text: 'When discussing a problem with colleagues, it is easy for me to', a: 'See the "big picture".', b: 'Grasp the specifics of the situation.', mapA: 'N', mapB: 'S' },
  { id: 11, text: 'When the phone rings in my office or at home, I usually', a: 'Consider it an interruption.', b: 'Do not mind answering it.', mapA: 'I', mapB: 'E' },
  { id: 12, text: 'Which word describes you better?', a: 'Analytical', b: 'Empathetic', mapA: 'T', mapB: 'F' },
  { id: 13, text: 'When I am working on an assignment, I tend to', a: 'Work steadily and consistently.', b: 'Work in bursts of energy with down time in between.', mapA: 'S', mapB: 'N' },
  { id: 14, text: 'When I listen to someone talk on a subject, I usually try to', a: 'Relate it to my own experience and see if it fits.', b: 'Assess and analyse the message.', mapA: 'F', mapB: 'T' },
  { id: 15, text: 'When I come up with new ideas, I generally', a: '"Go for it".', b: 'Like to contemplate the ideas some more.', mapA: 'E', mapB: 'I' },
  { id: 16, text: 'When working on a project, I prefer to', a: 'Narrow the scope so it is clearly defined.', b: 'Broaden the scope to include related aspects.', mapA: 'S', mapB: 'N' },
  { id: 17, text: 'When I read something, I usually', a: 'Confine my thoughts to what is written there.', b: 'Read between the lines and relate the words to other ideas.', mapA: 'S', mapB: 'N' },
  { id: 18, text: 'When I have to make a decision in a hurry, I often', a: 'Feel uncomfortable and wish I had more information.', b: 'Am able to do such with available data.', mapA: 'P', mapB: 'J' },
  { id: 19, text: 'In a meeting, I tend to', a: 'Formulate my ideas as I talk about them.', b: 'Only speak after I have carefully thought the issues through.', mapA: 'E', mapB: 'I' },
  { id: 20, text: 'In work, I prefer spending a great deal of time on issues of', a: 'Ideas.', b: 'People.', mapA: 'T', mapB: 'F' },
  { id: 21, text: 'In my meetings, I am most often annoyed with people who', a: 'Come up with many sketchy ideas.', b: 'Lengthen meetings with many practical details.', mapA: 'S', mapB: 'N' },
  { id: 22, text: 'I am a', a: 'Morning person.', b: 'Night owl.', mapA: 'I', mapB: 'E' },
  { id: 23, text: 'What is your style in preparing for a meeting?', a: 'I am willing to go in and be responsive.', b: 'I like to be fully prepared and usually sketch an outline of the meeting.', mapA: 'P', mapB: 'J' },
  { id: 24, text: 'In a meeting, I would prefer for people to', a: 'Display a fuller range of emotions.', b: 'Be more task oriented.', mapA: 'F', mapB: 'T' },
  { id: 25, text: 'I would rather work for an organization where', a: 'My job was intellectually stimulating.', b: 'I was committed to its goals and mission.', mapA: 'T', mapB: 'F' },
  { id: 26, text: 'On weekends, I tend to', a: 'Plan what I do.', b: 'Just see what happens and decide as I go along.', mapA: 'J', mapB: 'P' },
  { id: 27, text: 'I am more', a: 'Outgoing.', b: 'Contemplative.', mapA: 'E', mapB: 'I' },
  { id: 28, text: 'I would rather work for a boss who is', a: 'Full of new ideas.', b: 'Practical.', mapA: 'N', mapB: 'S' },
  { id: 29, text: 'Which word appeals to you more?', a: 'Social', b: 'Theoretical', mapA: 'F', mapB: 'T' },
  { id: 30, text: 'Which word appeals to you more?', a: 'Ingenuity', b: 'Practicality', mapA: 'N', mapB: 'S' },
  { id: 31, text: 'Which word appeals to you more?', a: 'Organised', b: 'Adaptable', mapA: 'J', mapB: 'P' },
  { id: 32, text: 'Which word appeals to you more?', a: 'Active', b: 'Concentration', mapA: 'E', mapB: 'I' },
] as const;

export default function JungianAssessment() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [isRetaking, setIsRetaking] = useState(false);
  const { results, history, isLoading: isResultsLoading } = useAssessmentResults(session?.user?.id);
  const existingResults = results.jungian_results;
  const hasCompleted = Boolean(existingResults) || history.jungian_results.length > 0;

  const handleRetake = () => {
    setIsRetaking(true);
    setAnswers({});
  };

  const handleSelect = (id: number, value: 'A' | 'B') => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const saveError = await persistAssessmentResult('jungian_results', { scores, type });
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
        description="Sign in to access the Jungian type assessment and keep your type results linked to your profile."
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
            You already have one or more Jungian 16-Type results saved. Would
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-gradient">
          Jungian 16-Type Assessment
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          32 forced-choice questions to identify your 4-letter personality type.
        </p>
      </div>

      {/* How-to guidance */}
      <div
        className="glass"
        style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderLeft: '3px solid hsl(var(--primary))' }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.9rem' }}>How to answer</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            'Each question has two options — select whichever feels more natural to you, even slightly.',
            'If both apply, go with your first gut reaction. Overthinking often nudges you toward who you want to be, not who you are.',
            "Answer based on your natural tendencies, not your job role or what's expected of you.",
            'There are no good or bad types — every combination has genuine strengths.',
          ].map((tip, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.83rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
              <span style={{ color: 'hsl(var(--primary))', fontWeight: 700, flexShrink: 0 }}>·</span>
              {tip}
            </li>
          ))}
        </ul>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.75rem', marginBottom: 0 }}>
          <strong style={{ color: 'hsl(var(--foreground))' }}>What this measures:</strong>{' '}
          Based on Carl Jung&apos;s theory of psychological types, the 16-type model maps your preferences across four dimensions: Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving. Your result is a 4-letter code (e.g. INTJ, ENFP) with a detailed profile.
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
