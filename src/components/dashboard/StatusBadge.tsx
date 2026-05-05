"use client";

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${type}`}>
      {status}
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border: 1px solid transparent;
        }
        .status-default {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          border-color: var(--border);
        }
        .status-success {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.2);
        }
        .status-warning {
          background: rgba(234, 179, 8, 0.1);
          color: #fde047;
          border-color: rgba(234, 179, 8, 0.2);
        }
        .status-error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .status-info {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </span>
  );
}
