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
      <div className="metric-value-container">
        <div className="metric-value" style={{ color: color || 'white' }}>{value}</div>
        {trend && (
          <span className={`trend trend-${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subValue && <div className="metric-subvalue">{subValue}</div>}

      <style jsx>{`
        .metric-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .metric-card:hover {
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }
        .metric-label {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .metric-value-container {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .metric-value {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .trend {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .trend-up { color: var(--safe); }
        .trend-down { color: var(--block); }
        .trend-neutral { color: var(--text-muted); }
        .metric-subvalue {
          font-size: 0.8rem;
          color: var(--text-muted);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
