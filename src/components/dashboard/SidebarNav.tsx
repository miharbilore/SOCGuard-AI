"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { group: 'Overview', items: [
    { name: 'Command Center', href: '/', icon: '⊞' },
  ]},
  { group: 'Security Operations', items: [
    { name: 'Log Analyzer', href: '/analyzer', icon: '⊘' },
    { name: 'Review Queue', href: '/review-queue', icon: '⊡' },
  ]},
  { group: 'Research & Lab', items: [
    { name: 'Evaluation', href: '/evaluation', icon: '⊿' },
    { name: 'Rule Intelligence', href: '/v2', icon: '◈' },
    { name: 'Source Intelligence', href: '/source-intelligence', icon: '⧉' },
    { name: 'Adversarial Lab', href: '/adversarial-lab', icon: '◇' },
    { name: 'Agent Lab Runner', href: '/agent-lab', icon: '⬡' },
  ]},
  { group: 'Governance', items: [
    { name: 'Rule Packs', href: '/rule-packs', icon: '▣' },
    { name: 'Rule Vault', href: '/rule-vault', icon: '◉' },
    { name: 'Audit Trail', href: '/audit', icon: '▤' },
  ]},
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      <div className="nav-brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
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
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    {isActive && <span className="active-indicator"></span>}
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
          background: #ffffff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
        }
        .nav-brand {
          padding: 1.25rem 1.25rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        .brand-logo {
          width: 36px;
          height: 36px;
          background: var(--accent);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .brand-info {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: 1.2;
        }
        .brand-tag {
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }
        .nav-container {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .group-title {
          padding: 0 0.75rem;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.25rem;
        }
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-xs);
          color: var(--text-soft);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.825rem;
          transition: all 0.1s ease;
          position: relative;
        }
        .nav-item:hover {
          background: var(--surface-muted);
          color: var(--text);
        }
        .nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 600;
        }
        .item-icon {
          width: 20px;
          text-align: center;
          font-size: 0.8rem;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .nav-item.active .item-icon {
          opacity: 1;
        }
        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: var(--accent);
          border-radius: 0 3px 3px 0;
        }
        .nav-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--safe);
          border-radius: 50%;
        }
        .status-text {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--safe);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        @media (max-width: 900px) {
          .sidebar-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
