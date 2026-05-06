"use client";

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'UNKNOWN';

interface RiskBadgeProps {
  level: RiskLevel | string;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const normalizedLevel = (level || 'UNKNOWN').toUpperCase() as RiskLevel;
  
  const getStyle = (l: RiskLevel) => {
    switch (l) {
      case 'CRITICAL': return { bg: 'rgba(220, 38, 38, 0.08)', text: 'var(--block)', border: 'rgba(220, 38, 38, 0.2)' };
      case 'HIGH': return { bg: 'rgba(249, 115, 22, 0.08)', text: '#ea580c', border: 'rgba(249, 115, 22, 0.2)' };
      case 'MEDIUM': return { bg: 'rgba(217, 119, 6, 0.08)', text: 'var(--escalate)', border: 'rgba(217, 119, 6, 0.2)' };
      case 'LOW': return { bg: 'rgba(37, 99, 235, 0.08)', text: 'var(--accent)', border: 'rgba(37, 99, 235, 0.2)' };
      case 'SAFE': return { bg: 'rgba(5, 150, 105, 0.08)', text: 'var(--safe)', border: 'rgba(5, 150, 105, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.08)', text: 'var(--text-muted)', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const style = getStyle(normalizedLevel);

  return (
    <span className="risk-badge" style={{ 
      background: style.bg, 
      color: style.text, 
      borderColor: style.border 
    }}>
      <span className="risk-indicator" style={{ background: style.text }}></span>
      {normalizedLevel}
    </span>
  );
}
