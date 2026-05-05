"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';

export default function ReviewQueuePage() {
  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Governance & Validation</div>
        <h1>Review Queue</h1>
        <p className="description">
          Human-in-the-loop validation for research candidates and adversarial patterns.
        </p>
      </header>

      <SectionCard title="Pending Review Items" subtitle="Items requiring analyst authorization">
        <div className="placeholder" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📥</div>
          <p>No items currently in the production review queue.</p>
          <p style={{ fontSize: '0.8rem' }}>Check the Adversarial Lab for new research candidates.</p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
