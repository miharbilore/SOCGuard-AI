"use client";

import { ReactNode } from 'react';
import SidebarNav from './SidebarNav';

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <SidebarNav />
      
      <div className="main-container">
        <header className="dashboard-header">
          <div className="header-left">
            <span className="poc-badge">Research PoC v3.1</span>
          </div>
          <div className="header-right">
            <div className="system-status">
              <span className="status-label">Operational Status:</span>
              <span className="status-dot"></span>
              <span className="status-text">Engine Online</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="content-inner">
            {children}
          </div>
        </main>

        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-main">
              <strong>SOCGuard AI</strong> — Deterministic-first research prototype. Not a SIEM/EDR replacement.
            </div>
            <div className="footer-sub">
              © 2026 SOCGuard Research Lab. All AI outputs are ADVISORY. Immutable provenance enabled.
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
        }
        .main-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .dashboard-header {
          height: 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .poc-badge {
          background: rgba(37, 99, 235, 0.05);
          color: var(--accent);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(37, 99, 235, 0.1);
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .status-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--safe);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--safe);
        }
        .status-text {
          font-size: 0.8rem;
          color: var(--text);
          font-weight: 600;
        }
        .dashboard-content {
          flex: 1;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .content-inner {
          max-width: 1440px;
          width: 100%;
        }
        .dashboard-footer {
          padding: 2.5rem 2rem;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.02);
        }
        .footer-content {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
        }
        .footer-main {
          font-size: 0.85rem;
          color: var(--text-soft);
        }
        .footer-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
