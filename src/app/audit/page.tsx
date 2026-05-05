"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';

export default function AuditTrailPage() {
  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">System Logs & Provenance</div>
        <h1>Audit Trail</h1>
        <p className="description">
          Immutable log of all governance actions and rule mutations.
        </p>
      </header>

      <SectionCard title="System Events" subtitle="Recent administrative actions">
        <div className="results-table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>{new Date().toISOString().split('T')[0]} 11:20</code></td>
                <td>SYSTEM</td>
                <td>ENGINE_START</td>
                <td>SOCGuard AI v3.1 Bootstrapped</td>
              </tr>
              <tr>
                <td><code>{new Date().toISOString().split('T')[0]} 11:22</code></td>
                <td>SYSTEM</td>
                <td>GENERATE_DOCS</td>
                <td>V3.1 Dashboard UX Plan created</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
