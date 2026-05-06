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

    </div>
  );
}
