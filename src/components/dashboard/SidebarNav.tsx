"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Command Center', href: '/', icon: '📊' },
  { name: 'Log Analyzer', href: '/analyzer', icon: '🔍' },
  { name: 'Evaluation', href: '/evaluation', icon: '📈' },
  { name: 'Rule Intelligence', href: '/v2', icon: '🧠' },
  { name: 'Adversarial Lab', href: '/adversarial-lab', icon: '🧪' },
  { name: 'Review Queue', href: '/review-queue', icon: '📥' },
  { name: 'Rule Packs', href: '/rule-packs', icon: '📦' },
  { name: 'Audit Trail', href: '/audit', icon: '📋' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      <div className="nav-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-name">SOCGuard AI</span>
      </div>
      <div className="nav-list">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <style jsx>{`
        .sidebar-nav {
          width: 260px;
          height: 100vh;
          background: #0B0E14;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }
        .nav-brand {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1rem;
        }
        .brand-icon {
          font-size: 1.5rem;
        }
        .brand-name {
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.025em;
          color: white;
        }
        .nav-list {
          flex: 1;
          padding: 0 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent);
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
        }
        .item-icon {
          font-size: 1.1rem;
          width: 1.5rem;
          display: flex;
          justify-content: center;
        }
        .item-name {
          font-size: 0.95rem;
        }
      `}</style>
    </nav>
  );
}
