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
          <h3 className="section-card-title">{title}</h3>
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
    </div>
  );
}
