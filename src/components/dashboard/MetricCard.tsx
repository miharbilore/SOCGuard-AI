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
      <div className="metric-header">
        <div className="metric-label">{label}</div>
        {trend && (
          <span className={`trend-chip trend-${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div className="metric-body">
        <div className="metric-value" style={{ color: color || 'white' }}>{value}</div>
        {subValue && <div className="metric-subvalue">{subValue}</div>}
      </div>

      <style jsx>{`
        .metric-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .metric-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${color || 'transparent'};
          opacity: 0.5;
        }
        .metric-card:hover {
          border-color: rgba(37, 99, 235, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .metric-label {
          color: var(--text-muted);
          font-size: 0.7rem;
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
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--text);
        }
        .trend-chip {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.04);
        }
        .trend-up { color: var(--safe); background: rgba(5, 150, 105, 0.1); }
        .trend-down { color: var(--block); background: rgba(220, 38, 38, 0.1); }
        .trend-neutral { color: var(--text-muted); }
        .metric-subvalue {
          font-size: 0.75rem;
          color: var(--text-soft);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
