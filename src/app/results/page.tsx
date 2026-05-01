'use client';

import { useSession } from '@/lib/auth-client';
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
import {
  BasicResults,
  JungianResults,
  TypeABResults,
  getAssessmentStorageKey,
  useStoredAssessment,
} from '@/lib/assessment-storage';

export default function ResultsDashboard() {
  const { data: session, isPending } = useSession();
  const basicResults = useStoredAssessment<BasicResults>(
    getAssessmentStorageKey('basic_results', session?.user?.id),
  );
  const jungianResults = useStoredAssessment<JungianResults>(
    getAssessmentStorageKey('jungian_results', session?.user?.id),
  );
  const typeabResults = useStoredAssessment<TypeABResults>(
    getAssessmentStorageKey('typeab_results', session?.user?.id),
  );

  const formatBasicData = () => {
    if (!basicResults) {
      return [];
    }

    return [
      { subject: 'Extraversion', A: basicResults.E, fullMark: 15 },
      { subject: 'Agreeableness', A: basicResults.A, fullMark: 15 },
      { subject: 'Conscientiousness', A: basicResults.C, fullMark: 15 },
      { subject: 'Emotional Stability', A: basicResults.ES, fullMark: 15 },
      { subject: 'Openness', A: basicResults.O, fullMark: 15 },
    ];
  };

  const getJungianDescription = (type: string) => {
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
  };

  const getTypeABDescription = (score: number) => {
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
  };

  if (isPending) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-gradient">
          Your Personality Profile
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Comprehensive insights based on your completed assessments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {basicResults ? (
          <motion.div
            className="glass"
            style={{ padding: '2rem', gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
              Big Five Traits
            </h2>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formatBasicData()}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
              Jungian Type
            </h2>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <span className="text-gradient" style={{ fontSize: '4rem', fontWeight: 'bold', letterSpacing: '4px' }}>
                {jungianResults.type}
              </span>
            </div>
            <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, textAlign: 'center' }}>
              {getJungianDescription(jungianResults.type)}
            </p>
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
              Behavioral Type
            </h2>

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

            <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, textAlign: 'center' }}>
              {getTypeABDescription(typeabResults.total).desc}
            </p>
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
    </div>
  );
}
