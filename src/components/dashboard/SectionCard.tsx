"use client";

import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionCard({ title, subtitle, children, footer, rightAction, className, style }: SectionCardProps) {
  return (
    <div className={`section-card ${className || ''}`} style={style}>
      <div className="section-header">
        <div className="header-text">
          <h3 className="section-title">{title}</h3>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {rightAction && <div className="header-action">{rightAction}</div>}
      </div>
      <div className="section-content">
        {children}
      </div>
      {footer && (
        <div className="section-footer">
          {footer}
        </div>
      )}

      <style jsx>{`
        .section-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .section-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .section-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.15rem 0 0 0;
          font-weight: 500;
        }
        .section-content {
          padding: 1.25rem;
          flex: 1;
        }
        .section-footer {
          padding: 0.75rem 1.25rem;
          background: var(--surface-muted);
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
