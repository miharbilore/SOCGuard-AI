"use client";

import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SectionCard({ title, subtitle, children, footer }: SectionCardProps) {
  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
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
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .section-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }
        .section-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0.25rem 0 0 0;
        }
        .section-content {
          padding: 1.5rem;
          flex: 1;
        }
        .section-footer {
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
