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
          <span className="sidebar-status-dot"></span>
          <span className="sidebar-status-text">Engine Online</span>
        </div>
      </div>
    </nav>
  );
}
