'use client';

import { Download } from 'lucide-react';

// ── Types (mirror from assessment-results.ts) ──────────────────────────────────

interface BasicResults {
  E: number;
  A: number;
  C: number;
  ES: number;
  O: number;
}

interface JungianResults {
  scores: Record<'I' | 'E' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P', number>;
  type: string;
}

interface TypeABResults {
  total: number;
}

interface Props {
  userName: string | null | undefined;
  basic: BasicResults | null;
  jungian: JungianResults | null;
  typeab: TypeABResults | null;
}

// ── Lookup data (minimal, self-contained) ────────────────────────────────────

const bigFiveTraits: Array<{ key: keyof BasicResults; label: string }> = [
  { key: 'C', label: 'Conscientiousness' },
  { key: 'E', label: 'Extraversion' },
  { key: 'O', label: 'Openness' },
  { key: 'ES', label: 'Emotional Stability' },
  { key: 'A', label: 'Agreeableness' },
];

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

function getTraitLevel(score: number): { label: string; color: string } {
  if (score <= 6) return { label: 'Low', color: '#3b82f6' };
  if (score <= 11) return { label: 'Medium', color: '#f59e0b' };
  return { label: 'High', color: '#22c55e' };
}

const jungianProfiles: Record<string, { title: string; tagline: string; strengths: string[]; challenges: string[]; environments: string }> = {
  INTJ: { title: 'Architect', tagline: 'Strategic, independent thinker with a plan for everything.', strengths: ['Long-range strategic planning', 'Independent, self-directed work', 'Decisive under ambiguity'], challenges: ['Can appear cold or dismissive to others', 'Impatient with inefficiency or small talk'], environments: 'Thrive in autonomous, high-complexity roles — strategy, engineering, research, or executive leadership.' },
  INTP: { title: 'Logician', tagline: 'Innovative analyst with an unquenchable thirst for knowledge.', strengths: ['Deep analytical and systems thinking', 'Creative problem-solving from first principles', 'Objective, impartial reasoning'], challenges: ['Can over-analyse and delay decisions', 'Difficulty with routine tasks or social niceties'], environments: 'Excel in research, software, academia, or any field where deep intellectual exploration is valued.' },
  ENTJ: { title: 'Commander', tagline: 'Bold, imaginative leader who always finds a way forward.', strengths: ['Strategic vision and decisive leadership', 'Efficient planning and execution', 'Motivating others toward ambitious goals'], challenges: ['Can be domineering or impatient with others', 'May overlook emotional dynamics in teams'], environments: 'Natural fit for executive, management, entrepreneurship, or high-stakes leadership roles.' },
  ENTP: { title: 'Debater', tagline: 'Smart and curious thinker who thrives on intellectual challenges.', strengths: ['Rapid idea generation and brainstorming', 'Challenging assumptions constructively', 'Adaptable and quick across diverse contexts'], challenges: ['May lose interest once initial novelty fades', 'Can debate for its own sake, frustrating others'], environments: 'Thrive in start-ups, consulting, law, marketing, or any environment that rewards lateral thinking.' },
  INFJ: { title: 'Advocate', tagline: 'Quiet idealist driven by deep values and a vision for lasting impact.', strengths: ['Deep empathy and insight into people', 'Clear long-term vision and sense of purpose', 'Strong written communication and storytelling'], challenges: ["Prone to burnout from absorbing others' emotions", 'Sets high personal standards that can feel unachievable'], environments: 'Thrive in counselling, writing, non-profit leadership, or any mission-driven role.' },
  INFP: { title: 'Mediator', tagline: 'Creative, values-driven individual who seeks meaning and authenticity.', strengths: ['Deep empathy and active listening', 'Rich creative and written expression', 'Unwavering commitment to personal values'], challenges: ['Can struggle with criticism and interpersonal conflict', 'May be overly idealistic about people or situations'], environments: 'Excel in creative writing, counselling, UX design, social work, or advocacy roles.' },
  ENFJ: { title: 'Protagonist', tagline: 'Charismatic, empathetic leader who naturally inspires and connects people.', strengths: ['Building and motivating high-performing teams', 'Reading people and group dynamics accurately', 'Clear, inspiring and persuasive communication'], challenges: ["Can be over-responsible for others' feelings", 'Difficulty with direct confrontation or delivering hard truths'], environments: 'Thrive in people-leadership, education, coaching, HR, or community-building roles.' },
  ENFP: { title: 'Campaigner', tagline: 'Enthusiastic, creative connector of ideas and people.', strengths: ['Big-picture thinking and visionary ideation', 'Energising and inspiring those around them', 'Multi-disciplinary, creative problem solving'], challenges: ['Can struggle with routine tasks and follow-through', 'Overly optimistic about timelines and outcomes'], environments: 'Excel in marketing, entrepreneurship, journalism, coaching, or creative leadership.' },
  ISTJ: { title: 'Logistician', tagline: 'Practical, dependable, and thorough — the backbone of any team.', strengths: ['Meticulous attention to detail', 'Consistent, highly reliable execution', 'Deep respect for proven process and structure'], challenges: ['Can be resistant to change or novel approaches', 'May struggle in highly ambiguous situations'], environments: 'Thrive in operations, finance, law, administration, or any role demanding consistency and precision.' },
  ISFJ: { title: 'Defender', tagline: 'Loyal and caring protector who quietly supports everyone around them.', strengths: ['Deeply loyal and dependable team member', 'Attentive and perceptive to others needs', 'Strong memory for personal details and relationships'], challenges: ['Tends to neglect own needs while caring for others', 'Reluctant to push back or challenge established methods'], environments: 'Excel in healthcare, education, social work, customer service, or administration.' },
  ESTJ: { title: 'Executive', tagline: 'Organised, assertive administrator who brings structure and clarity.', strengths: ['Clear decision-making and confident delegation', 'Reliable, on-time project delivery', 'Strong respect for rules, standards, and commitments'], challenges: ['Can be rigid or inflexible when challenged', 'May steamroll dissenting voices under pressure'], environments: 'Thrive in management, operations, military, law enforcement, or structured corporate environments.' },
  ESFJ: { title: 'Consul', tagline: 'Warm, dependable, and deeply attuned to the needs of others.', strengths: ['Building strong, harmonious team relationships', 'Highly attentive to the practical needs of people', 'Reliable and consistent contributor others can count on'], challenges: ['Sensitive to conflict and criticism', 'Can seek external approval excessively'], environments: 'Excel in teaching, healthcare, HR, social services, or team-coordination roles.' },
  ISTP: { title: 'Virtuoso', tagline: 'Practical, resourceful craftsperson who thrives on hands-on problem solving.', strengths: ['Fast, effective troubleshooting under pressure', 'Cool-headed and composed in emergencies', 'Practical, efficient, no-nonsense thinking'], challenges: ['Can be emotionally detached in relationships', 'May resist long-term planning or commitment'], environments: 'Thrive in engineering, trades, emergency services, forensics, or technical fields.' },
  ISFP: { title: 'Adventurer', tagline: 'Flexible, artistic creator who lives fully in the present moment.', strengths: ['Creative sensitivity and aesthetic awareness', 'Adaptable, open-minded, and easy to be around', 'Genuine care for people and lived experiences'], challenges: ['Can avoid necessary conflict to a fault', 'May lack structured direction without external support'], environments: 'Excel in design, music, art, veterinary work, social care, or hospitality.' },
  ESTP: { title: 'Entrepreneur', tagline: 'Energetic, perceptive, and action-oriented — thrives on living in the moment.', strengths: ['Reading people and situations with sharp instinct', 'Taking decisive, effective action under pressure', 'Persuasive, engaging, and high-energy communicator'], challenges: ['Can be risk-prone or act impulsively', 'May neglect long-term planning in favour of immediate results'], environments: 'Thrive in sales, entrepreneurship, emergency response, sports, or fast-paced operations.' },
  ESFP: { title: 'Entertainer', tagline: 'Spontaneous, enthusiastic, and joyful — life is never boring around them.', strengths: ['Creating contagious energy and enthusiasm in groups', 'Highly observant of people and their surroundings', 'Resourceful, optimistic, and adaptable'], challenges: ['Can struggle with long-term planning and discipline', 'May avoid difficult or uncomfortable conversations'], environments: 'Excel in events, hospitality, performing arts, customer experience, or education.' },
};

function getJungianProfile(type: string) {
  return jungianProfiles[type] ?? {
    title: 'Unique Type',
    tagline: 'Your personality type is based on your unique combination of preferences.',
    strengths: ['Self-aware and reflective', 'Open to growth and exploration', 'Unique perspective that adds value'],
    challenges: ['Continue exploring your type for deeper insights'],
    environments: 'Explore roles that align with your natural preferences and personal values.',
  };
}

function getTypeABProfile(score: number) {
  if (score >= 43) return { title: 'Strong Type A', color: '#ef4444', tagline: 'Highly competitive, time-driven, and intensely achievement-focused.', strengths: ['Excels in high-pressure, fast-paced environments', 'Strong drive to meet and consistently exceed targets', 'Natural urgency that accelerates team results'], watchout: 'High risk of burnout, impatience, and stress-related health issues. Actively schedule recovery time, practice delegation, and reframe "slowing down" as a performance strategy.', workFit: 'Sales, executive leadership, competitive sports, emergency medicine, or entrepreneurship.' };
  if (score >= 32) return { title: 'Moderate Type A', color: '#f97316', tagline: 'Ambitious and driven, but with some capacity to switch off.', strengths: ['Goal-oriented with a strong and consistent work ethic', 'Reliable and composed under pressure', 'Balances drive with occasional flexibility and reflection'], watchout: 'Watch for creeping overcommitment and difficulty saying no. Build in deliberate breaks and check your pace before sliding toward burnout.', workFit: 'Project management, healthcare, consulting, business development, or competitive leadership roles.' };
  if (score >= 22) return { title: 'Moderate Type B', color: '#3b82f6', tagline: 'Steady and balanced — performs well without needing urgency.', strengths: ['Thoughtful decision-making without rushed judgements', 'Sustains strong, trusting relationships at work', 'Adaptable pace supports creative and strategic thinking'], watchout: 'In highly competitive environments you may appear less driven than peers. Occasionally push yourself to set tighter personal deadlines and share progress more visibly.', workFit: 'Research, design, education, writing, counselling, or strategic planning roles.' };
  return { title: 'Strong Type B', color: '#2563eb', tagline: 'Relaxed, patient, and easygoing — values quality of life over urgency.', strengths: ['Naturally low stress and high resilience in turbulent environments', 'Creative thinking flourishes without the pressure of rigid timelines', 'Strong work-life balance and personal wellbeing'], watchout: 'May struggle with strict deadlines or highly competitive cultures. Set explicit goals and accountability checkpoints to stay on track and visible to stakeholders.', workFit: 'Creative arts, academia, philosophy, remote or autonomous work, or any role valuing depth over speed.' };
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function bar(pct: number, color: string): string {
  return `
    <div style="width:100%;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:4px;">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;"></div>
    </div>`;
}

function bullet(text: string, color: string): string {
  return `<li style="display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#374151;line-height:1.55;margin-bottom:4px;">
    <span style="margin-top:6px;width:5px;height:5px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block;"></span>
    <span>${text}</span>
  </li>`;
}

function section(title: string, content: string): string {
  return `
  <div style="margin-bottom:32px;page-break-inside:avoid;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="flex:1;height:1px;background:#e5e7eb;"></div>
      <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;white-space:nowrap;">${title}</span>
      <div style="flex:1;height:1px;background:#e5e7eb;"></div>
    </div>
    ${content}
  </div>`;
}

function infoBox(label: string, text: string, labelColor = '#6b7280'): string {
  return `
  <div style="padding:12px 14px;border-radius:8px;background:#f9fafb;border:1px solid #e5e7eb;margin-top:10px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${labelColor};margin-bottom:5px;">${label}</div>
    <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">${text}</p>
  </div>`;
}

function buildHtml(
  userName: string | null | undefined,
  basic: BasicResults | null,
  jungian: JungianResults | null,
  typeab: TypeABResults | null,
): string {
  const now = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = userName ?? 'Your';

  let basicHtml = '';
  if (basic) {
    const rows = bigFiveTraits.map(({ key, label }) => {
      const score = basic[key];
      const { label: lvl, color } = getTraitLevel(score);
      const pct = (score / 15) * 100;
      const insight = traitInsights[key]?.[lvl] ?? '';
      return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <span style="font-size:13px;font-weight:600;color:#111827;">${label}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;border:1px solid ${color};color:${color};">${lvl}</span>
            <span style="font-size:13px;color:#6b7280;">${score}/15</span>
          </div>
        </div>
        ${bar(pct, color)}
        ${insight ? `<p style="font-size:12px;color:#6b7280;margin:5px 0 0;line-height:1.5;">${insight}</p>` : ''}
      </div>`;
    }).join('');
    basicHtml = section('Big Five Personality Traits', `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">${rows}</div>`);
  }

  let jungianHtml = '';
  if (jungian) {
    const profile = getJungianProfile(jungian.type);
    const dims = [
      { l: 'Introvert', lk: 'I' as const, r: 'Extravert', rk: 'E' as const },
      { l: 'Sensing', lk: 'S' as const, r: 'Intuitive', rk: 'N' as const },
      { l: 'Thinking', lk: 'T' as const, r: 'Feeling', rk: 'F' as const },
      { l: 'Judging', lk: 'J' as const, r: 'Perceiving', rk: 'P' as const },
    ];
    const dimBars = dims.map((d) => {
      const ls = jungian.scores[d.lk] ?? 0;
      const rs = jungian.scores[d.rk] ?? 0;
      const total = ls + rs || 1;
      const lPct = Math.round((ls / total) * 100);
      const domLeft = ls >= rs;
      const domKey = domLeft ? d.lk : d.rk;
      const domPct = domLeft ? lPct : 100 - lPct;
      return `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
          <span style="font-weight:${domLeft ? 700 : 400};color:${domLeft ? '#111827' : '#9ca3af'};">${d.l}</span>
          <span style="font-weight:700;color:#7c3aed;">${domKey} · ${domPct}%</span>
          <span style="font-weight:${!domLeft ? 700 : 400};color:${!domLeft ? '#111827' : '#9ca3af'};">${d.r}</span>
        </div>
        ${bar(lPct, '#7c3aed')}
      </div>`;
    }).join('');

    const strengthList = profile.strengths.map((s) => bullet(s, '#22c55e')).join('');
    const challengeList = profile.challenges.map((c) => bullet(c, '#f59e0b')).join('');

    jungianHtml = section('Jungian 16-Type', `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;">
          <span style="font-size:42px;font-weight:800;color:#7c3aed;letter-spacing:3px;line-height:1;">${jungian.type}</span>
          <div>
            <div style="font-size:17px;font-weight:700;color:#111827;">${profile.title}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:2px;">${profile.tagline}</div>
          </div>
        </div>
        <div style="margin-bottom:14px;">${dimBars}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#22c55e;margin-bottom:6px;">Strengths</div>
            <ul style="list-style:none;padding:0;margin:0;">${strengthList}</ul>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#f59e0b;margin-bottom:6px;">Growth Areas</div>
            <ul style="list-style:none;padding:0;margin:0;">${challengeList}</ul>
          </div>
        </div>
        ${infoBox('Best-fit Environments', profile.environments)}
      </div>`);
  }

  let typeabHtml = '';
  if (typeab) {
    const profile = getTypeABProfile(typeab.total);
    const pct = ((typeab.total - 7) / 49) * 100;
    const strengthList = profile.strengths.map((s) => bullet(s, '#22c55e')).join('');
    typeabHtml = section('Behavioural Type (A vs B)', `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
        <div style="margin-bottom:12px;">
          <div style="font-size:24px;font-weight:800;color:${profile.color};line-height:1;margin-bottom:4px;">${profile.title}</div>
          <div style="font-size:13px;color:#6b7280;">${profile.tagline}</div>
        </div>
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;margin-bottom:3px;">
            <span>Type B</span><span style="font-weight:700;color:#111827;">${typeab.total}/56</span><span>Type A</span>
          </div>
          ${bar(pct, profile.color)}
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:3px;">
            <span>Strong B</span><span>Moderate B</span><span>Moderate A</span><span>Strong A</span>
          </div>
        </div>
        <div style="margin-bottom:10px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#22c55e;margin-bottom:6px;">Strengths</div>
          <ul style="list-style:none;padding:0;margin:0;">${strengthList}</ul>
        </div>
        ${infoBox('Watch Out', profile.watchout, '#f59e0b')}
        ${infoBox('Best-fit Environments', profile.workFit)}
      </div>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Persona Atlas — ${displayName} Personality Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111827; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1, h2, h3 { font-family: 'Outfit', sans-serif; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; size: A4; }
    }
  </style>
</head>
<body>
  <!-- Report header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #7c3aed;">
    <div>
      <div style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:#7c3aed;letter-spacing:1px;">Persona Atlas</div>
      <div style="font-size:11px;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin-top:1px;">Profiles · Patterns · Perspective</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:700;color:#111827;">${displayName}'s Personality Report</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:2px;">Generated ${now}</div>
    </div>
  </div>

  ${basicHtml}
  ${jungianHtml}
  ${typeabHtml}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;">
    <span>Persona Atlas — personatypes.com</span>
    <span>Generated ${now}</span>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 400);
    });
  </script>
</body>
</html>`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PdfExportButton({ userName, basic, jungian, typeab }: Props) {
  const hasResults = basic || jungian || typeab;

  const handleClick = () => {
    const html = buildHtml(userName, basic, jungian, typeab);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      window.alert('Pop-up blocked. Please allow pop-ups for this site to download your PDF.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  if (!hasResults) return null;

  return (
    <button
      onClick={handleClick}
      className="btn btn-secondary"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
    >
      <Download size={16} />
      Download PDF
    </button>
  );
}
