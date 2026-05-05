"use client";

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'UNKNOWN';

interface RiskBadgeProps {
  level: RiskLevel | string;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const normalizedLevel = level.toUpperCase() as RiskLevel;
  
  const getStyle = (l: RiskLevel) => {
    switch (l) {
      case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'HIGH': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' };
      case 'MEDIUM': return { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.3)' };
      case 'LOW': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'SAFE': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      default: return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };

  const style = getStyle(normalizedLevel);

  return (
    <span className="risk-badge" style={{ 
      background: style.bg, 
      color: style.text, 
      borderColor: style.border 
    }}>
      {normalizedLevel}
      <style jsx>{`
        .risk-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.625rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid;
        }
      `}</style>
    </span>
  );
}
