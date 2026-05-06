"use client";

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${type}`}>
      <span className="badge-dot"></span>
      {status}
    </span>
  );
}
