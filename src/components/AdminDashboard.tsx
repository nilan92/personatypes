'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Users, BarChart2, Activity } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  total_attempts: number;
  assessments_completed: number;
}

interface LatestResult {
  user_id: string;
  assessment_key: string;
  result_data: unknown;
  created_at: string;
}

interface Props {
  users: UserRow[];
  latestResults: LatestResult[];
}

// ── Formatters ────────────────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function fmt(d: string | null) {
  return d ? dateFormatter.format(new Date(d)) : '—';
}

// ── Result summary helpers ────────────────────────────────────────────────────

function bigFiveSummary(data: unknown): string {
  if (typeof data !== 'object' || !data) return '—';
  const r = data as Record<string, number>;
  const labels: [string, string][] = [
    ['C', 'C'],
    ['E', 'E'],
    ['O', 'O'],
    ['ES', 'ES'],
    ['A', 'A'],
  ];
  return labels.map(([k, l]) => `${l}:${r[k] ?? '?'}`).join('  ');
}

function jungianSummary(data: unknown): string {
  if (typeof data !== 'object' || !data) return '—';
  const r = data as { type?: string };
  return r.type ?? '—';
}

function typeABSummary(data: unknown): string {
  if (typeof data !== 'object' || !data) return '—';
  const r = data as { total?: number };
  if (r.total == null) return '—';
  const score = r.total;
  let label = 'Strong B';
  if (score >= 43) label = 'Strong A';
  else if (score >= 32) label = 'Moderate A';
  else if (score >= 22) label = 'Moderate B';
  return `${label} (${score})`;
}

function resultSummary(key: string, data: unknown): string {
  if (key === 'basic_results') return bigFiveSummary(data);
  if (key === 'jungian_results') return jungianSummary(data);
  if (key === 'typeab_results') return typeABSummary(data);
  return '—';
}

const keyLabel: Record<string, string> = {
  basic_results: 'Big Five',
  jungian_results: 'Jungian',
  typeab_results: 'Type A/B',
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="glass"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '0.75rem',
          background: 'rgba(139,92,246,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--primary))',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ count, max = 3 }: { count: number; max?: number }) {
  const pct = max > 0 ? count / max : 0;
  const color =
    pct >= 1 ? 'hsl(140,60%,50%)' : pct >= 0.5 ? 'hsl(45,90%,55%)' : 'hsl(210,70%,55%)';
  return (
    <span
      style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '0.1rem 0.5rem',
        borderRadius: '999px',
        border: `1px solid ${color}`,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {count}/{max}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboard({ users, latestResults }: Props) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const resultsByUser = useMemo(() => {
    const map = new Map<string, LatestResult[]>();
    for (const r of latestResults) {
      const existing = map.get(r.user_id) ?? [];
      existing.push(r);
      map.set(r.user_id, existing);
    }
    return map;
  }, [latestResults]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q),
    );
  }, [users, query]);

  const totalAttempts = users.reduce((s, u) => s + u.total_attempts, 0);
  const fullProfiles = users.filter((u) => u.assessments_completed === 3).length;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }} className="text-gradient">
          Admin Dashboard
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
          User accounts and their assessment results.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard icon={<Users size={20} />} label="Total Users" value={users.length} />
        <StatCard icon={<BarChart2 size={20} />} label="Total Attempts" value={totalAttempts} />
        <StatCard icon={<Activity size={20} />} label="Full Profiles" value={fullProfiles} />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.9rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(var(--muted-foreground))',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 1rem 0.65rem 2.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'hsl(var(--foreground))',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>

        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 100px 80px 36px',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Joined</span>
          <span style={{ textAlign: 'center' }}>Assessments</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
            No users found.
          </div>
        ) : (
          filtered.map((user) => {
            const isOpen = expandedId === user.id;
            const userResults = resultsByUser.get(user.id) ?? [];

            return (
              <div key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : user.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 80px 36px',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    width: '100%',
                    background: isOpen ? 'rgba(139,92,246,0.06)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Name */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {user.name ?? 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                      {user.total_attempts} attempt{user.total_attempts !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'hsl(var(--muted-foreground))',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.email ?? '—'}
                  </div>

                  {/* Joined */}
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                    {fmt(user.created_at)}
                  </div>

                  {/* Assessment badge */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Badge count={user.assessments_completed} />
                  </div>

                  {/* Chevron */}
                  <div style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div
                    style={{
                      padding: '1rem 1.25rem 1.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.75rem' }}>
                      Latest Results
                    </div>

                    {userResults.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                        No assessments completed yet.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                        {userResults.map((r) => (
                          <div
                            key={r.assessment_key}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '0.75rem',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.07)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                                {keyLabel[r.assessment_key] ?? r.assessment_key}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>
                                {fmt(r.created_at)}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                              {resultSummary(r.assessment_key, r.result_data)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>
                      User ID: <code style={{ fontFamily: 'monospace', opacity: 0.7 }}>{user.id}</code>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
        {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
