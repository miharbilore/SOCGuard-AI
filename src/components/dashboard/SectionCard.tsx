"use client";

import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  rightAction?: ReactNode;
}

export default function SectionCard({ title, subtitle, children, footer, rightAction }: SectionCardProps) {
  return (
    <div className="section-card">
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
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .section-header {
          padding: 1.25rem 1.5rem;
          background: rgba(0, 0, 0, 0.01);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .section-subtitle {
          font-size: 0.8rem;
          color: var(--text-soft);
          margin: 0.25rem 0 0 0;
          font-weight: 500;
        }
        .section-content {
          padding: 1.5rem;
          flex: 1;
        }
        .section-footer {
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.02);
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
