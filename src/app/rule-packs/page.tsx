"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';

export default function RulePacksPage() {
  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Detection Assets</div>
        <h1>Rule Packs</h1>
        <p className="description">
          Versioned bundles of deterministic detection signatures.
        </p>
      </header>

      <div className="main-grid">
        <SectionCard title="Active Rule Packs" subtitle="Currently deployed signatures">
           <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Pack ID</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Rules</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>SOCGUARD-CORE</code></td>
                  <td>v1.2.0</td>
                  <td><span className="badge badge-SAFE">ACTIVE</span></td>
                  <td>45</td>
                </tr>
                <tr>
                  <td><code>ADVERSARIAL-V3</code></td>
                  <td>v0.1.0</td>
                  <td><span className="badge badge-ESCALATE">DRAFT</span></td>
                  <td>12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
