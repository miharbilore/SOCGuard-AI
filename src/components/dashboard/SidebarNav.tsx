"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { group: 'Overview', items: [
    { name: 'Command Center', href: '/', icon: '📊' },
  ]},
  { group: 'Security Operations', items: [
    { name: 'Log Analyzer', href: '/analyzer', icon: '🔍' },
    { name: 'Review Queue', href: '/review-queue', icon: '📥' },
  ]},
  { group: 'Research & Lab', items: [
    { name: 'Evaluation', href: '/evaluation', icon: '📈' },
    { name: 'Rule Intelligence', href: '/v2', icon: '🧠' },
    { name: 'Adversarial Lab', href: '/adversarial-lab', icon: '🧪' },
  ]},
  { group: 'Governance', items: [
    { name: 'Rule Packs', href: '/rule-packs', icon: '📦' },
    { name: 'Audit Trail', href: '/audit', icon: '📋' },
  ]},
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      <div className="nav-brand">
        <div className="brand-logo">
          🛡️
        </div>
        <div className="brand-info">
          <span className="brand-name">SOCGuard AI</span>
          <span className="brand-tag">Security Intelligence</span>
        </div>
      </div>
      
      <div className="nav-container">
        {navItems.map((group) => (
          <div key={group.group} className="nav-group">
            <h3 className="group-title">{group.group}</h3>
            <div className="nav-list">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="item-icon-wrapper">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="nav-footer">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Engine Online</span>
        </div>
      </div>
      
      <style jsx>{`
        .sidebar-nav {
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-brand {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .brand-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent), #1d4ed8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .brand-info {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.01em;
          color: var(--text);
          line-height: 1.2;
        }
        .brand-tag {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .nav-container {
          flex: 1;
          padding: 0 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .group-title {
          padding: 0 1rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          color: var(--text-soft);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }
        .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: var(--text);
        }
        .nav-item.active {
          background: rgba(37, 99, 235, 0.05);
          color: var(--accent);
          font-weight: 600;
        }
        .item-icon-wrapper {
          width: 28px;
          height: 28px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .nav-item.active .item-icon-wrapper {
          background: rgba(37, 99, 235, 0.1);
          border-color: rgba(37, 99, 235, 0.2);
          transform: scale(1.05);
        }
        .nav-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(5, 150, 105, 0.04);
          border: 1px solid rgba(5, 150, 105, 0.1);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--safe);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--safe);
        }
        .status-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--safe);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
      `}</style>
    </nav>
  );
}
