"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export default function MetricCard({ label, value, subValue, trend, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-body">
        <div className="metric-value" style={color ? { color } : undefined}>{value}</div>
        <div className="metric-footer">
          {subValue && <span className="metric-subvalue">{subValue}</span>}
          {trend && (
            <span className={`trend-chip trend-${trend}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .metric-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: var(--shadow-sm);
        }
        .metric-label {
          color: var(--text-muted);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .metric-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .metric-value {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--text);
        }
        .metric-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 1.25rem;
        }
        .metric-subvalue {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .trend-chip {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
        .trend-up { color: var(--safe); background: var(--safe-bg); }
        .trend-down { color: var(--block); background: var(--block-bg); }
        .trend-neutral { color: var(--text-muted); background: var(--surface-muted); }
      `}</style>
    </div>
  );
}
