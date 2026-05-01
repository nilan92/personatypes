'use client';

import { useSession } from '@/lib/auth-client';
import { useAssessmentResults } from '@/lib/assessment-results-client';
import AuthRequiredState from '@/components/AuthRequiredState';
import { motion } from 'framer-motion';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const basicTraitLabels = [
  { key: 'E', label: 'Extraversion' },
  { key: 'A', label: 'Agreeableness' },
  { key: 'C', label: 'Conscientiousness' },
  { key: 'ES', label: 'Emotional Stability' },
  { key: 'O', label: 'Openness' },
] as const;

function formatTakenAt(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : 'Saved locally on this device';
}

function getBigFiveSummary(result: {
  E: number;
  A: number;
  C: number;
  ES: number;
  O: number;
}) {
  const sortedTraits = basicTraitLabels
    .map((trait) => ({
      label: trait.label,
      value: result[trait.key],
    }))
    .sort((left, right) => right.value - left.value);

  return `${sortedTraits[0]?.label} ${sortedTraits[0]?.value}/15, ${sortedTraits[1]?.label} ${sortedTraits[1]?.value}/15`;
}

function getJungianDescription(type: string) {
  const descriptions: Record<string, string> = {
    INTJ: 'Architect: Imaginative and strategic thinkers, with a plan for everything.',
    INTP: 'Logician: Innovative inventors with an unquenchable thirst for knowledge.',
    ENTJ: 'Commander: Bold, imaginative and strong-willed leaders, always finding a way or making one.',
    ENTP: 'Debater: Smart and curious thinkers who cannot resist an intellectual challenge.',
    INFJ: 'Advocate: Quiet and mystical, yet very inspiring and tireless idealists.',
    INFP: 'Mediator: Poetic, kind and altruistic people, always eager to help a good cause.',
    ENFJ: 'Protagonist: Charismatic and inspiring leaders, able to mesmerize their listeners.',
    ENFP: 'Campaigner: Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.',
    ISTJ: 'Logistician: Practical and fact-minded individuals, whose reliability cannot be doubted.',
    ISFJ: 'Defender: Very dedicated and warm protectors, always ready to defend their loved ones.',
    ESTJ: 'Executive: Excellent administrators, unsurpassed at managing things or people.',
    ESFJ: 'Consul: Extraordinarily caring, social and popular people, always eager to help.',
    ISTP: 'Virtuoso: Bold and practical experimenters, masters of all kinds of tools.',
    ISFP: 'Adventurer: Flexible and charming artists, always ready to explore and experience something new.',
    ESTP: 'Entrepreneur: Smart, energetic and very perceptive people, who truly enjoy living on the edge.',
    ESFP: 'Entertainer: Spontaneous, energetic and enthusiastic people. Life is never boring around them.',
  };
  return descriptions[type] || 'Personality type calculated based on your preferences.';
}

function getTypeABDescription(score: number) {
  if (score >= 32) {
    return {
      title: 'Type A Personality',
      desc: 'You tend to be competitive, time-urgent, and ambitious. You may often feel a sense of time pressure and a strong drive to achieve.',
      color: 'hsl(0, 84%, 60%)',
    };
  }

  return {
    title: 'Type B Personality',
    desc: 'You tend to be relaxed, patient, and easygoing. You are more likely to work at a steady pace and value quality of life over aggressive achievement.',
    color: 'hsl(210, 100%, 50%)',
  };
}

export default function ResultsDashboard() {
  const { data: session, isPending } = useSession();
  const { results, history, isLoading: isResultsLoading } = useAssessmentResults(session?.user?.id);
  const basicResults = results.basic_results;
  const jungianResults = results.jungian_results;
  const typeabResults = results.typeab_results;
  const latestBasicEntry = history.basic_results[0];
  const latestJungianEntry = history.jungian_results[0];
  const latestTypeabEntry = history.typeab_results[0];

  const basicChartData = basicResults
    ? basicTraitLabels.map((trait) => ({
        subject: trait.label,
        A: basicResults[trait.key],
        fullMark: 15,
      }))
    : [];

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
        description="Sign in to view your saved assessment dashboard and compare your personality results in one place."
      />
    );
  }

  const totalAttempts =
    history.basic_results.length +
    history.jungian_results.length +
    history.typeab_results.length;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-gradient">
          Your Personality Profile
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Review your latest results, compare your trait values, and revisit your test history over time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {basicResults ? (
          <motion.div
            className="glass"
            style={{ padding: '2rem', gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>
                  Big Five Traits
                </h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                  Latest attempt: {formatTakenAt(latestBasicEntry?.takenAt ?? null)}
                </p>
              </div>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  minWidth: '180px',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>
                  Attempts saved
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {history.basic_results.length}
                </div>
              </div>
            </div>

            <div style={{ height: '380px', width: '100%', marginBottom: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="78%" data={basicChartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {basicTraitLabels.map((trait) => (
                <div
                  key={trait.key}
                  style={{
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                    {trait.label}
                  </div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>
                    {basicResults[trait.key]}
                    <span style={{ fontSize: '0.95rem', color: 'hsl(var(--muted-foreground))', marginLeft: '0.35rem' }}>
                      / 15
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}

        {jungianResults ? (
          <motion.div
            className="glass"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'hsl(var(--primary))' }}>
              Jungian Type
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 0, marginBottom: '1rem' }}>
              Latest attempt: {formatTakenAt(latestJungianEntry?.takenAt ?? null)}
            </p>
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <span className="text-gradient" style={{ fontSize: '4rem', fontWeight: 'bold', letterSpacing: '4px' }}>
                {jungianResults.type}
              </span>
            </div>
            <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, textAlign: 'center', marginBottom: '1rem' }}>
              {getJungianDescription(jungianResults.type)}
            </p>
            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
              Saved attempts: {history.jungian_results.length}
            </div>
          </motion.div>
        ) : null}

        {typeabResults ? (
          <motion.div
            className="glass"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'hsl(var(--primary))' }}>
              Behavioral Type
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 0, marginBottom: '1rem' }}>
              Latest attempt: {formatTakenAt(latestTypeabEntry?.takenAt ?? null)}
            </p>

            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: getTypeABDescription(typeabResults.total).color,
                  marginBottom: '0.5rem',
                }}
              >
                {getTypeABDescription(typeabResults.total).title}
              </div>
              <div style={{ fontSize: '1.2rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                Score: {typeabResults.total} / 56
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(typeabResults.total / 56) * 100}%`,
                  background: 'linear-gradient(90deg, hsl(210, 100%, 50%), hsl(0, 84%, 60%))',
                }}
              />
            </div>

            <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, textAlign: 'center', marginBottom: '1rem' }}>
              {getTypeABDescription(typeabResults.total).desc}
            </p>
            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
              Saved attempts: {history.typeab_results.length}
            </div>
          </motion.div>
        ) : null}

        {!basicResults && !jungianResults && !typeabResults ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }} className="glass">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Data Found</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              You haven&apos;t completed any assessments yet. Head back to the home
              page to start one.
            </p>
          </div>
        ) : null}
      </div>

      {totalAttempts > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Assessment History</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>
              Every retake is kept, so you can see how your results change over time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'hsl(var(--primary))' }}>Big Five History</h3>
              {history.basic_results.length > 0 ? history.basic_results.map((entry, index) => (
                <details
                  key={entry.id ?? `basic-${index}`}
                  style={{
                    padding: '1rem 0',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          Attempt {history.basic_results.length - index}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                          {getBigFiveSummary(entry.result)}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                        {formatTakenAt(entry.takenAt)}
                      </span>
                    </div>
                  </summary>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', marginTop: '0.9rem' }}>
                    {basicTraitLabels.map((trait) => (
                      <div key={`${entry.id ?? index}-${trait.key}`} style={{ fontSize: '0.92rem' }}>
                        {trait.label}: <strong>{entry.result[trait.key]}</strong>
                      </div>
                    ))}
                  </div>
                </details>
              )) : <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>No Big Five attempts yet.</p>}
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'hsl(var(--primary))' }}>Jungian History</h3>
              {history.jungian_results.length > 0 ? history.jungian_results.map((entry, index) => (
                <details
                  key={entry.id ?? `jungian-${index}`}
                  style={{
                    padding: '1rem 0',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{entry.result.type}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                        {formatTakenAt(entry.takenAt)}
                      </span>
                    </div>
                  </summary>
                  <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 0, marginTop: '0.9rem' }}>
                    {getJungianDescription(entry.result.type)}
                  </p>
                </details>
              )) : <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>No Jungian attempts yet.</p>}
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'hsl(var(--primary))' }}>Behavioral History</h3>
              {history.typeab_results.length > 0 ? history.typeab_results.map((entry, index) => (
                <details
                  key={entry.id ?? `typeab-${index}`}
                  style={{
                    padding: '1rem 0',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{getTypeABDescription(entry.result.total).title}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                        {formatTakenAt(entry.takenAt)}
                      </span>
                    </div>
                  </summary>
                  <div style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.9rem' }}>
                    Score: {entry.result.total} / 56
                  </div>
                </details>
              )) : <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>No behavioral attempts yet.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
