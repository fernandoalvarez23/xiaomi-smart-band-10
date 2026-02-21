import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | null;
  unit: string;
  icon: ReactNode;
  pulse?: boolean;
}

export function MetricCard({ label, value, unit, icon, pulse }: Props) {
  return (
    <div className={`metric-card${pulse ? ' pulse' : ''}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-body">
        <span className="metric-label">{label}</span>
        <span className="metric-value">
          {value !== null ? value : '—'}
          <small>{value !== null ? ` ${unit}` : ''}</small>
        </span>
      </div>
    </div>
  );
}
