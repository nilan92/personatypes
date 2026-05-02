'use client';

import { useSession } from '@/lib/auth-client';
import { useAssessmentResults } from '@/lib/assessment-results-client';
import AuthRequiredState from '@/components/AuthRequiredState';
import PdfExportButton from '@/components/PdfExportButton';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

// ─── Big Five ────────────────────────────────────────────────────────────────

// CEOEA order: Conscientiousness, Extraversion, Openness, Emotional Stability, Agreeableness
const basicTraitLabels = [
  { key: 'C', label: 'Conscientiousness' },
  { key: 'E', label: 'Extraversion' },
  { key: 'O', label: 'Openness' },
  { key: 'ES', label: 'Emotional Stability' },
  { key: 'A', label: 'Agreeableness' },
] as const;

function getTraitLevel(score: number): { label: string; color: string } {
  if (score <= 6) return { label: 'Low', color: 'hsl(210, 70%, 55%)' };
  if (score <= 11) return { label: 'Medium', color: 'hsl(45, 90%, 55%)' };
  return { label: 'High', color: 'hsl(140, 60%, 50%)' };
}

const traitInsights: Record<string, Record<string, string>> = {
  C: {
    Low: 'Flexible and spontaneous — may struggle with deadlines. Try a simple daily to-do list to build consistency.',
    Medium: 'Reasonably organised and reliable. You balance structure with flexibility well.',
    High: 'Highly disciplined and goal-driven. Leverage this in project management, leadership, or any role that rewards follow-through.',
  },
  E: {
    Low: 'Energised by solitude and deep one-on-one connections. Thrive in roles with independent, focused work.',
    Medium: 'Comfortable in both social and solo settings — adaptable across team and individual work.',
    High: 'Natural networker who thrives in social environments. Seek roles with frequent collaboration and people interaction.',
  },
  O: {
    Low: 'Prefer routine and the familiar — practical and consistent. Excel in environments that value process and stability.',
    Medium: 'Balance curiosity with practicality. Open to new ideas when they are well-reasoned.',
    High: 'Highly creative and intellectually curious. Thrive in innovation, the arts, research, or entrepreneurship.',
  },
  ES: {
    Low: 'More sensitive to stress and emotionally reactive. Mindfulness, journaling, or regular exercise can help regulate responses.',
    Medium: 'Generally stable, with occasional emotional fluctuation under pressure.',
    High: 'Calm and resilient under pressure — a steady presence in high-stress or crisis situations.',
  },
  A: {
    Low: 'Direct and competitive — willing to challenge others. Effective in negotiation or roles requiring tough decisions.',
    Medium: 'Cooperative but not a pushover. You adapt your approach depending on the situation.',
    High: 'Warm, empathetic, and collaborative — a natural mediator. Valuable in caregiving, counselling, or people-focused roles.',
  },
};

// ─── Jungian ────────────────────────────────────────────────────────────────

type JungianKey = 'I' | 'E' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

const jungianDimensions: Array<{
  leftLabel: string;
  leftKey: JungianKey;
  rightLabel: string;
  rightKey: JungianKey;
}> = [
  { leftLabel: 'Introvert', leftKey: 'I', rightLabel: 'Extravert', rightKey: 'E' },
  { leftLabel: 'Sensing', leftKey: 'S', rightLabel: 'Intuitive', rightKey: 'N' },
  { leftLabel: 'Thinking', leftKey: 'T', rightLabel: 'Feeling', rightKey: 'F' },
  { leftLabel: 'Judging', leftKey: 'J', rightLabel: 'Perceiving', rightKey: 'P' },
];

type JungianTypeProfile = {
  title: string;
  tagline: string;
  strengths: string[];
  challenges: string[];
  environments: string;
};

const jungianProfiles: Record<string, JungianTypeProfile> = {
  INTJ: {
    title: 'Architect',
    tagline: 'Strategic, independent thinker with a plan for everything.',
    strengths: ['Long-range strategic planning', 'Independent, self-directed work', 'Decisive under ambiguity'],
    challenges: ['Can appear cold or dismissive to others', 'Impatient with inefficiency or small talk'],
    environments: 'Thrive in autonomous, high-complexity roles — strategy, engineering, research, or executive leadership.',
  },
  INTP: {
    title: 'Logician',
    tagline: 'Innovative analyst with an unquenchable thirst for knowledge.',
    strengths: ['Deep analytical and systems thinking', 'Creative problem-solving from first principles', 'Objective, impartial reasoning'],
    challenges: ['Can over-analyse and delay decisions', 'Difficulty with routine tasks or social niceties'],
    environments: 'Excel in research, software, academia, or any field where deep intellectual exploration is valued.',
  },
  ENTJ: {
    title: 'Commander',
    tagline: 'Bold, imaginative leader who always finds a way forward.',
    strengths: ['Strategic vision and decisive leadership', 'Efficient planning and execution', 'Motivating others toward ambitious goals'],
    challenges: ['Can be domineering or impatient with others', 'May overlook emotional dynamics in teams'],
    environments: 'Natural fit for executive, management, entrepreneurship, or high-stakes leadership roles.',
  },
  ENTP: {
    title: 'Debater',
    tagline: 'Smart and curious thinker who thrives on intellectual challenges.',
    strengths: ['Rapid idea generation and brainstorming', 'Challenging assumptions constructively', 'Adaptable and quick across diverse contexts'],
    challenges: ['May lose interest once initial novelty fades', 'Can debate for its own sake, frustrating others'],
    environments: 'Thrive in start-ups, consulting, law, marketing, or any environment that rewards lateral thinking.',
  },
  INFJ: {
    title: 'Advocate',
    tagline: 'Quiet idealist driven by deep values and a vision for lasting impact.',
    strengths: ['Deep empathy and insight into people', 'Clear long-term vision and sense of purpose', 'Strong written communication and storytelling'],
    challenges: ['Prone to burnout from absorbing others\' emotions', 'Sets high personal standards that can feel unachievable'],
    environments: 'Thrive in counselling, writing, non-profit leadership, or any mission-driven role.',
  },
  INFP: {
    title: 'Mediator',
    tagline: 'Creative, values-driven individual who seeks meaning and authenticity.',
    strengths: ['Deep empathy and active listening', 'Rich creative and written expression', 'Unwavering commitment to personal values'],
    challenges: ['Can struggle with criticism and interpersonal conflict', 'May be overly idealistic about people or situations'],
    environments: 'Excel in creative writing, counselling, UX design, social work, or advocacy roles.',
  },
  ENFJ: {
    title: 'Protagonist',
    tagline: 'Charismatic, empathetic leader who naturally inspires and connects people.',
    strengths: ['Building and motivating high-performing teams', 'Reading people and group dynamics accurately', 'Clear, inspiring and persuasive communication'],
    challenges: ['Can be over-responsible for others\' feelings', 'Difficulty with direct confrontation or delivering hard truths'],
    environments: 'Thrive in people-leadership, education, coaching, HR, or community-building roles.',
  },
  ENFP: {
    title: 'Campaigner',
    tagline: 'Enthusiastic, creative connector of ideas and people.',
    strengths: ['Big-picture thinking and visionary ideation', 'Energising and inspiring those around them', 'Multi-disciplinary, creative problem solving'],
    challenges: ['Can struggle with routine tasks and follow-through', 'Overly optimistic about timelines and outcomes'],
    environments: 'Excel in marketing, entrepreneurship, journalism, coaching, or creative leadership.',
  },
  ISTJ: {
    title: 'Logistician',
    tagline: 'Practical, dependable, and thorough — the backbone of any team.',
    strengths: ['Meticulous attention to detail', 'Consistent, highly reliable execution', 'Deep respect for proven process and structure'],
    challenges: ['Can be resistant to change or novel approaches', 'May struggle in highly ambiguous situations'],
    environments: 'Thrive in operations, finance, law, administration, or any role demanding consistency and precision.',
  },
  ISFJ: {
    title: 'Defender',
    tagline: 'Loyal and caring protector who quietly supports everyone around them.',
    strengths: ['Deeply loyal and dependable team member', 'Attentive and perceptive to others\' needs', 'Strong memory for personal details and relationships'],
    challenges: ['Tends to neglect own needs while caring for others', 'Reluctant to push back or challenge established methods'],
    environments: 'Excel in healthcare, education, social work, customer service, or administration.',
  },
  ESTJ: {
    title: 'Executive',
    tagline: 'Organised, assertive administrator who brings structure and clarity.',
    strengths: ['Clear decision-making and confident delegation', 'Reliable, on-time project delivery', 'Strong respect for rules, standards, and commitments'],
    challenges: ['Can be rigid or inflexible when challenged', 'May steamroll dissenting voices under pressure'],
    environments: 'Thrive in management, operations, military, law enforcement, or structured corporate environments.',
  },
  ESFJ: {
    title: 'Consul',
    tagline: 'Warm, dependable, and deeply attuned to the needs of others.',
    strengths: ['Building strong, harmonious team relationships', 'Highly attentive to the practical needs of people', 'Reliable and consistent contributor others can count on'],
    challenges: ['Sensitive to conflict and criticism', 'Can seek external approval excessively'],
    environments: 'Excel in teaching, healthcare, HR, social services, or team-coordination roles.',
  },
  ISTP: {
    title: 'Virtuoso',
    tagline: 'Practical, resourceful craftsperson who thrives on hands-on problem solving.',
    strengths: ['Fast, effective troubleshooting under pressure', 'Cool-headed and composed in emergencies', 'Practical, efficient, no-nonsense thinking'],
    challenges: ['Can be emotionally detached in relationships', 'May resist long-term planning or commitment'],
    environments: 'Thrive in engineering, trades, emergency services, forensics, or technical fields.',
  },
  ISFP: {
    title: 'Adventurer',
    tagline: 'Flexible, artistic creator who lives fully in the present moment.',
    strengths: ['Creative sensitivity and aesthetic awareness', 'Adaptable, open-minded, and easy to be around', 'Genuine care for people and lived experiences'],
    challenges: ['Can avoid necessary conflict to a fault', 'May lack structured direction without external support'],
    environments: 'Excel in design, music, art, veterinary work, social care, or hospitality.',
  },
  ESTP: {
    title: 'Entrepreneur',
    tagline: 'Energetic, perceptive, and action-oriented — thrives on living in the moment.',
    strengths: ['Reading people and situations with sharp instinct', 'Taking decisive, effective action under pressure', 'Persuasive, engaging, and high-energy communicator'],
    challenges: ['Can be risk-prone or act impulsively', 'May neglect long-term planning in favour of immediate results'],
    environments: 'Thrive in sales, entrepreneurship, emergency response, sports, or fast-paced operations.',
  },
  ESFP: {
    title: 'Entertainer',
    tagline: 'Spontaneous, enthusiastic, and joyful — life is never boring around them.',
    strengths: ['Creating contagious energy and enthusiasm in groups', 'Highly observant of people and their surroundings', 'Resourceful, optimistic, and adaptable'],
    challenges: ['Can struggle with long-term planning and discipline', 'May avoid difficult or uncomfortable conversations'],
    environments: 'Excel in events, hospitality, performing arts, customer experience, or education.',
  },
};

function getJungianProfile(type: string): JungianTypeProfile {
  return jungianProfiles[type] ?? {
    title: 'Unique Type',
    tagline: 'Your personality type is based on your unique combination of preferences.',
    strengths: ['Self-aware and reflective', 'Open to growth and exploration', 'Unique perspective that adds value'],
    challenges: ['Continue exploring your type for deeper insights'],
    environments: 'Explore roles that align with your natural preferences and personal values.',
  };
}

// ─── Type A/B ────────────────────────────────────────────────────────────────

type TypeABProfile = {
  title: string;
  color: string;
  tagline: string;
  strengths: string[];
  watchout: string;
  workFit: string;
};

function getTypeABProfile(score: number): TypeABProfile {
  if (score >= 43) {
    return {
      title: 'Strong Type A',
      color: 'hsl(0, 84%, 60%)',
      tagline: 'Highly competitive, time-driven, and intensely achievement-focused.',
      strengths: [
        'Excels in high-pressure, fast-paced environments',
        'Strong drive to meet and consistently exceed targets',
        'Natural urgency that accelerates team results',
      ],
      watchout: 'High risk of burnout, impatience, and stress-related health issues. Actively schedule recovery time, practice delegation, and reframe "slowing down" as a performance strategy.',
      workFit: 'Sales, executive leadership, competitive sports, emergency medicine, or entrepreneurship.',
    };
  }
  if (score >= 32) {
    return {
      title: 'Moderate Type A',
      color: 'hsl(15, 84%, 58%)',
      tagline: 'Ambitious and driven, but with some capacity to switch off.',
      strengths: [
        'Goal-oriented with a strong and consistent work ethic',
        'Reliable and composed under pressure',
        'Balances drive with occasional flexibility and reflection',
      ],
      watchout: 'Watch for creeping overcommitment and difficulty saying no. Build in deliberate breaks and check your pace before sliding toward burnout.',
      workFit: 'Project management, healthcare, consulting, business development, or competitive leadership roles.',
    };
  }
  if (score >= 22) {
    return {
      title: 'Moderate Type B',
      color: 'hsl(210, 80%, 55%)',
      tagline: 'Steady and balanced — performs well without needing urgency.',
      strengths: [
        'Thoughtful decision-making without rushed judgements',
        'Sustains strong, trusting relationships at work',
        'Adaptable pace supports creative and strategic thinking',
      ],
      watchout: 'In highly competitive environments you may appear less driven than peers. Occasionally push yourself to set tighter personal deadlines and share progress more visibly.',
      workFit: 'Research, design, education, writing, counselling, or strategic planning roles.',
    };
  }
  return {
    title: 'Strong Type B',
    color: 'hsl(210, 100%, 50%)',
    tagline: 'Relaxed, patient, and easygoing — values quality of life over urgency.',
    strengths: [
      'Naturally low stress and high resilience in turbulent environments',
      'Creative thinking flourishes without the pressure of rigid timelines',
      'Strong work-life balance and personal wellbeing',
    ],
    watchout: 'May struggle with strict deadlines or highly competitive cultures. Set explicit goals and accountability checkpoints to stay on track and visible to stakeholders.',
    workFit: 'Creative arts, academia, philosophy, remote or autonomous work, or any role valuing depth over speed.',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTakenAt(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : 'Saved locally on this device';
}

function getBigFiveSummary(result: { E: number; A: number; C: number; ES: number; O: number }) {
  const sortedTraits = basicTraitLabels
    .map((trait) => ({ label: trait.label, value: result[trait.key] }))
    .sort((a, b) => b.value - a.value);
  return `${sortedTraits[0]?.label} ${sortedTraits[0]?.value}/15, ${sortedTraits[1]?.label} ${sortedTraits[1]?.value}/15`;
}

function LevelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '0.12rem 0.45rem',
        borderRadius: '999px',
        color,
        border: `1px solid ${color}`,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1.25rem' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'hsl(var(--muted-foreground))',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
    </div>
  );
}

function BulletList({ items, color = 'hsl(var(--primary))' }: { items: string[]; color?: string }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.55 }}
        >
          <span
            style={{ marginTop: '0.42em', width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoBox({ label, labelColor, children }: { label: string; labelColor?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '0.9rem',
        borderRadius: '0.9rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: labelColor ?? 'hsl(var(--muted-foreground))',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
        key: trait.key,
        value: basicResults[trait.key],
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

  const completedCount = [basicResults, jungianResults, typeabResults].filter(Boolean).length;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} className="text-gradient">
          Your Personality Profile
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Review your latest results, understand your traits, and revisit your history over time.
        </p>
        {(basicResults || jungianResults || typeabResults) && (
          <div style={{ marginTop: '1rem' }}>
            <PdfExportButton
              userName={session.user.name}
              basic={basicResults ?? null}
              jungian={jungianResults ?? null}
              typeab={typeabResults ?? null}
            />
          </div>
        )}
        {completedCount < 3 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.85rem',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            {completedCount}/3 assessments complete —{' '}
            <a href="/" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600 }}>
              complete your profile →
            </a>
          </div>
        )}
      </div>

      {/* No results */}
      {!basicResults && !jungianResults && !typeabResults && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }} className="glass">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Results Yet</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            You haven&apos;t completed any assessments yet. Head back to the home page to start one.
          </p>
        </div>
      )}

      {/* ── Big Five ── */}
      {basicResults && (
        <>
          <SectionLabel label="Big Five Personality Traits" />
          <div className="glass" style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'hsl(var(--primary))' }}>
                  Big Five (CEOEA)
                </h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0, fontSize: '0.88rem' }}>
                  Latest: {formatTakenAt(latestBasicEntry?.takenAt ?? null)}
                </p>
              </div>
              <div
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attempts</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{history.basic_results.length}</div>
              </div>
            </div>

            {/* Progress bars */}
            <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.75rem' }}>
              {basicChartData.map((item) => {
                const level = getTraitLevel(item.value);
                return (
                  <div key={item.subject}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '0.38rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.subject}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LevelBadge label={level.label} color={level.color} />
                        <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.88rem' }}>
                          {item.value} / {item.fullMark}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(item.value / item.fullMark) * 100}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: 'linear-gradient(90deg, hsl(var(--primary)), #ff6b6b)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {basicTraitLabels.map((trait) => {
                const score = basicResults[trait.key];
                const level = getTraitLevel(score);
                const insight = traitInsights[trait.key]?.[level.label];
                return (
                  <div
                    key={trait.key}
                    style={{
                      padding: '1rem',
                      borderRadius: '1rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'hsl(var(--muted-foreground))',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {trait.label}
                      </span>
                      <LevelBadge label={level.label} color={level.color} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {score}
                      <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginLeft: '0.3rem' }}>/ 15</span>
                    </div>
                    {insight && (
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.55, margin: 0 }}>
                        {insight}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Jungian + Type A/B ── */}
      {(jungianResults || typeabResults) && (
        <>
          <SectionLabel label="Personality Type Profiles" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Jungian card */}
            {jungianResults && (() => {
              const profile = getJungianProfile(jungianResults.type);
              return (
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.4rem', color: 'hsl(var(--primary))', margin: 0 }}>Jungian 16-Type</h2>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>
                        {history.jungian_results.length} attempt{history.jungian_results.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      Latest: {formatTakenAt(latestJungianEntry?.takenAt ?? null)}
                    </p>
                  </div>

                  {/* Type code + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span
                      className="text-gradient"
                      style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '3px', lineHeight: 1 }}
                    >
                      {jungianResults.type}
                    </span>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>{profile.title}</div>
                      <div style={{ fontSize: '0.83rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' }}>
                        {profile.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Dimension preference bars */}
                  <InfoBox label="Preference Strengths">
                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.2rem' }}>
                      {jungianDimensions.map((dim) => {
                        const leftScore = jungianResults.scores[dim.leftKey] ?? 0;
                        const rightScore = jungianResults.scores[dim.rightKey] ?? 0;
                        const total = leftScore + rightScore || 1;
                        const leftPct = Math.round((leftScore / total) * 100);
                        const dominantIsLeft = leftScore >= rightScore;
                        const dominantKey = dominantIsLeft ? dim.leftKey : dim.rightKey;
                        const dominantPct = dominantIsLeft ? leftPct : 100 - leftPct;
                        return (
                          <div key={dim.leftKey}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                marginBottom: '0.28rem',
                                alignItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: dominantIsLeft ? 700 : 400,
                                  color: dominantIsLeft ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                                }}
                              >
                                {dim.leftLabel}
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                                {dominantKey} · {dominantPct}%
                              </span>
                              <span
                                style={{
                                  fontWeight: !dominantIsLeft ? 700 : 400,
                                  color: !dominantIsLeft ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                                }}
                              >
                                {dim.rightLabel}
                              </span>
                            </div>
                            <div
                              style={{
                                width: '100%',
                                height: '5px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${leftPct}%`,
                                  height: '100%',
                                  borderRadius: '999px',
                                  background: 'linear-gradient(90deg, hsl(var(--primary)), #ff6b6b)',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </InfoBox>

                  {/* Strengths */}
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'hsl(140, 60%, 50%)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Strengths
                    </div>
                    <BulletList items={profile.strengths} color="hsl(140, 60%, 50%)" />
                  </div>

                  {/* Growth areas */}
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'hsl(45, 90%, 55%)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Growth Areas
                    </div>
                    <BulletList items={profile.challenges} color="hsl(45, 90%, 55%)" />
                  </div>

                  {/* Best-fit environments */}
                  <InfoBox label="Best-fit Environments">
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))', margin: 0, lineHeight: 1.6 }}>
                      {profile.environments}
                    </p>
                  </InfoBox>
                </div>
              );
            })()}

            {/* Type A/B card */}
            {typeabResults && (() => {
              const profile = getTypeABProfile(typeabResults.total);
              return (
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.4rem', color: 'hsl(var(--primary))', margin: 0 }}>Behavioural Type</h2>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>
                        {history.typeab_results.length} attempt{history.typeab_results.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      Latest: {formatTakenAt(latestTypeabEntry?.takenAt ?? null)}
                    </p>
                  </div>

                  {/* Type label */}
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: profile.color, lineHeight: 1, marginBottom: '0.3rem' }}>
                      {profile.title}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'hsl(var(--muted-foreground))' }}>{profile.tagline}</div>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '0.4rem',
                        alignItems: 'center',
                      }}
                    >
                      <span>Type B</span>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--foreground))', fontSize: '0.88rem' }}>
                        {typeabResults.total} / 56
                      </span>
                      <span>Type A</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${((typeabResults.total - 7) / 49) * 100}%`,
                          background: `linear-gradient(90deg, hsl(210, 100%, 50%), ${profile.color})`,
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.68rem',
                        color: 'hsl(var(--muted-foreground))',
                        marginTop: '0.3rem',
                      }}
                    >
                      <span>Strong B</span>
                      <span>Moderate B</span>
                      <span>Moderate A</span>
                      <span>Strong A</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'hsl(140, 60%, 50%)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Strengths
                    </div>
                    <BulletList items={profile.strengths} color="hsl(140, 60%, 50%)" />
                  </div>

                  {/* Watch out */}
                  <div
                    style={{
                      padding: '0.9rem',
                      borderRadius: '0.9rem',
                      background: 'rgba(255, 180, 0, 0.05)',
                      border: '1px solid rgba(255, 180, 0, 0.14)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'hsl(45, 90%, 55%)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Watch Out
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))', margin: 0, lineHeight: 1.6 }}>
                      {profile.watchout}
                    </p>
                  </div>

                  {/* Work fit */}
                  <InfoBox label="Best-fit Environments">
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))', margin: 0, lineHeight: 1.6 }}>
                      {profile.workFit}
                    </p>
                  </InfoBox>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* ── History ── */}
      {totalAttempts > 0 && (
        <>
          <SectionLabel label="Assessment History" />
          <p style={{ color: 'hsl(var(--muted-foreground))', margin: '-0.25rem 0 1.5rem', fontSize: '0.88rem' }}>
            Every retake is saved — track how your results change over time.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Big Five History
              </h3>
              {history.basic_results.length > 0 ? (
                history.basic_results.map((entry, index) => (
                  <details
                    key={entry.id ?? `basic-${index}`}
                    style={{ padding: '0.9rem 0', borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.92rem' }}>
                            Attempt {history.basic_results.length - index}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))' }}>
                            {getBigFiveSummary(entry.result)}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                          {formatTakenAt(entry.takenAt)}
                        </span>
                      </div>
                    </summary>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.45rem', marginTop: '0.85rem' }}>
                      {basicTraitLabels.map((trait) => {
                        const level = getTraitLevel(entry.result[trait.key]);
                        return (
                          <div
                            key={`${entry.id ?? index}-${trait.key}`}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '0.4rem' }}
                          >
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{trait.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <strong>{entry.result[trait.key]}</strong>
                              <LevelBadge label={level.label} color={level.color} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))
              ) : (
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0, fontSize: '0.88rem' }}>No Big Five attempts yet.</p>
              )}
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Jungian History
              </h3>
              {history.jungian_results.length > 0 ? (
                history.jungian_results.map((entry, index) => (
                  <details
                    key={entry.id ?? `jungian-${index}`}
                    style={{ padding: '0.9rem 0', borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <strong style={{ fontSize: '1.1rem' }}>{entry.result.type}</strong>
                          <span style={{ fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))' }}>
                            {getJungianProfile(entry.result.type).title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                          {formatTakenAt(entry.takenAt)}
                        </span>
                      </div>
                    </summary>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 0, marginTop: '0.85rem', fontSize: '0.83rem', lineHeight: 1.55 }}>
                      {getJungianProfile(entry.result.type).tagline}
                    </p>
                  </details>
                ))
              ) : (
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0, fontSize: '0.88rem' }}>No Jungian attempts yet.</p>
              )}
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Behavioural History
              </h3>
              {history.typeab_results.length > 0 ? (
                history.typeab_results.map((entry, index) => (
                  <details
                    key={entry.id ?? `typeab-${index}`}
                    style={{ padding: '0.9rem 0', borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ color: getTypeABProfile(entry.result.total).color, fontSize: '0.95rem' }}>
                            {getTypeABProfile(entry.result.total).title}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                            Score: {entry.result.total} / 56
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                          {formatTakenAt(entry.takenAt)}
                        </span>
                      </div>
                    </summary>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 0, marginTop: '0.85rem', fontSize: '0.83rem', lineHeight: 1.55 }}>
                      {getTypeABProfile(entry.result.total).tagline}
                    </p>
                  </details>
                ))
              ) : (
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0, fontSize: '0.88rem' }}>No behavioural attempts yet.</p>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
