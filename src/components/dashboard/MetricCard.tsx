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

    </div>
  );
}
