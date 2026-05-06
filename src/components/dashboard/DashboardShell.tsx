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
            <span className="poc-badge">Research PoC v4.1</span>
          </div>
          <div className="header-right">
            <div className="system-status">
              <span className="status-label">Status</span>
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
          margin-left: var(--sidebar-width);
        }
        .dashboard-header {
          height: 56px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .poc-badge {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 0.2rem 0.6rem;
          border-radius: 5px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(37, 99, 235, 0.12);
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          background: var(--safe);
          border-radius: 50%;
        }
        .status-text {
          font-size: 0.75rem;
          color: var(--safe);
          font-weight: 600;
        }
        .dashboard-content {
          flex: 1;
          padding: 2rem;
        }
        .content-inner {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }
        .dashboard-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border);
          background: var(--surface-muted);
        }
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }
        .footer-main {
          font-size: 0.8rem;
          color: var(--text-soft);
        }
        .footer-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        @media (max-width: 900px) {
          .main-container {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
