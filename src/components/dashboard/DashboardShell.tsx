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
              <span className="status-dot"></span>
              <span className="status-text">Engine Online</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>

        <footer className="dashboard-footer">
          <div className="footer-content">
            <p><strong>SOCGuard AI</strong> - Deterministic-first research prototype. Not a SIEM/EDR replacement.</p>
            <p className="copyright">© 2026 SOCGuard Research Lab. All AI outputs are ADVISORY.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: #0B0E14;
          color: var(--text);
        }
        .main-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevents flex items from overflowing */
        }
        .dashboard-header {
          height: 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          background: rgba(11, 14, 20, 0.8);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .poc-badge {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--safe);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--safe);
        }
        .status-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .dashboard-content {
          flex: 1;
          padding: 2rem;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }
        .dashboard-footer {
          padding: 2rem;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }
        .footer-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .copyright {
          font-size: 0.75rem;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
