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
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .status-default {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-soft);
          border-color: var(--border);
        }
        .status-default .badge-dot { background: var(--text-muted); }

        .status-success {
          background: rgba(5, 150, 105, 0.08);
          color: var(--safe);
          border-color: rgba(5, 150, 105, 0.2);
        }
        .status-success .badge-dot { background: var(--safe); box-shadow: 0 0 5px var(--safe); }

        .status-warning {
          background: rgba(217, 119, 6, 0.08);
          color: var(--escalate);
          border-color: rgba(217, 119, 6, 0.2);
        }
        .status-warning .badge-dot { background: var(--escalate); box-shadow: 0 0 5px var(--escalate); }

        .status-error {
          background: rgba(220, 38, 38, 0.08);
          color: var(--block);
          border-color: rgba(220, 38, 38, 0.2);
        }
        .status-error .badge-dot { background: var(--block); box-shadow: 0 0 5px var(--block); }

        .status-info {
          background: rgba(37, 99, 235, 0.08);
          color: var(--accent);
          border-color: rgba(37, 99, 235, 0.2);
        }
        .status-info .badge-dot { background: var(--accent); box-shadow: 0 0 5px var(--accent); }
      `}</style>
    </span>
  );
}
