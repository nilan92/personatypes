'use client';

import { Component, type ErrorInfo, type ReactNode, useSyncExternalStore } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface BigFiveChartPoint {
  subject: string;
  A: number;
  fullMark: number;
}

function subscribeToNothing() {
  return () => {};
}

function useChartReady() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

class ChartErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Big Five chart failed to render', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function BigFiveRadarChart({ data }: { data: BigFiveChartPoint[] }) {
  const isChartReady = useChartReady();

  return (
    <ChartErrorBoundary
      fallback={
        <div
          className="glass"
          style={{
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--muted-foreground))',
            textAlign: 'center',
            padding: '1.5rem',
          }}
        >
          The Big Five summary chart is temporarily unavailable, but your scores are still listed below.
        </div>
      }
    >
      <div style={{ height: '380px', width: '100%', minWidth: 0, minHeight: '380px' }}>
        {isChartReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
              <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartErrorBoundary>
  );
}
