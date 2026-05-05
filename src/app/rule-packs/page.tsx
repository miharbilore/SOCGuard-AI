"use client";

import { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { RULE_PACK_V1 } from '@/modules/socguard/rule-pack/rule-pack-v1';
import { RulePack } from '@/modules/socguard/rule-pack/rule-pack-types';

// Mock Draft Pack for demonstration
const RULE_PACK_DRAFT: RulePack = {
  id: 'RP-1-1-0-DRAFT',
  name: 'SOCGuard Core Deterministic Pack',
  version: '1.1.0-rc1',
  createdAt: new Date().toISOString(),
  status: 'DRAFT',
  sourceReferences: [
    ...RULE_PACK_V1.sourceReferences,
    'LAB-REC-X99Y (Adversarial Lab)',
    'INTEL-2026-004 (Rule Intelligence)'
  ],
  changelog: 'Drafting updates for V1.1. Added 2 new candidate rules for fragmented payloads and role-based bypass attempts.',
  rules: [
    ...RULE_PACK_V1.rules,
    {
      id: 'RULE-NEW-001',
      category: 'PROMPT_INJECTION',
      severity: 'HIGH',
      confidence: 0.85,
      pattern: '(?i)translate the (?:previous|above) instructions',
      reason: 'Fragmented translation bypass attempt.',
      source: 'LAB-REC-X99Y',
      enabled: false,
      createdBy: 'analyst-01',
      reviewStatus: 'DRAFT'
    },
    {
      id: 'RULE-NEW-002',
      category: 'ROLE_CONFUSION',
      severity: 'CRITICAL',
      confidence: 0.9,
      pattern: '(?i)switch to developer mode',
      reason: 'Instruction override via roleplay/dev-mode simulation.',
      source: 'INTEL-2026-004',
      enabled: false,
      createdBy: 'analyst-02',
      reviewStatus: 'DRAFT'
    }
  ],
  testCases: [...RULE_PACK_V1.testCases]
};

const ALL_PACKS: RulePack[] = [RULE_PACK_V1, RULE_PACK_DRAFT];

export default function RulePacksPage() {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(RULE_PACK_V1.id);
  
  const selectedPack = ALL_PACKS.find(p => p.id === selectedPackId);
  
  // Calculate metrics
  const metrics = {
    totalPacks: ALL_PACKS.length,
    draftPacks: ALL_PACKS.filter(p => p.status === 'DRAFT').length,
    approvedPacks: ALL_PACKS.filter(p => p.status === 'APPROVED').length,
    totalRules: ALL_PACKS.reduce((sum, p) => sum + p.rules.length, 0),
    disabledDraftRules: ALL_PACKS.reduce((sum, p) => sum + p.rules.filter(r => !r.enabled).length, 0),
    candidateRules: 8, // Mock count from V2/Lab
  };

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Detection Assets & Versioning</div>
        <h1>Rule Packs</h1>
        <p className="description" style={{ margin: 0 }}>
          Versioned governance layer for candidate detection rules. Rule packs bundle validated rules for staged deployment.
        </p>
      </header>

      {/* Metrics Grid */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard label="Total Packs" value={metrics.totalPacks} />
        <MetricCard label="Draft Packs" value={metrics.draftPacks} color="var(--escalate)" />
        <MetricCard label="Approved Packs" value={metrics.approvedPacks} color="var(--safe)" />
        <MetricCard label="Total Rules" value={metrics.totalRules} />
        <MetricCard label="Disabled Rules" value={metrics.disabledDraftRules} color="var(--block)" />
        <MetricCard label="Candidate Rules" value={metrics.candidateRules} color="var(--accent)" />
      </section>

      <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem' }}>
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Rule Pack Table */}
          <SectionCard title="Registered Rule Packs" subtitle="History of versioned signature bundles">
            <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)', padding: '0.875rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--escalate)', fontWeight: 600 }}>
              <strong>Governance Notice:</strong> Draft packs are inactive. New draft rules are disabled by default and require human activation.
            </div>
            <div className="results-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pack ID</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Rules</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_PACKS.map(pack => (
                    <tr 
                      key={pack.id} 
                      onClick={() => setSelectedPackId(pack.id)}
                      className={selectedPackId === pack.id ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><code>{pack.id}</code></td>
                      <td><strong>{pack.version}</strong></td>
                      <td>
                        <StatusBadge 
                          status={pack.status} 
                          type={pack.status === 'APPROVED' ? 'success' : 'warning'} 
                        />
                      </td>
                      <td>{pack.rules.length}</td>
                      <td><span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 500 }}>{new Date(pack.createdAt).toLocaleDateString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Rule Preview */}
          {selectedPack && (
            <SectionCard title={`Rules in ${selectedPack.version}`} subtitle={`Detailed signatures included in ${selectedPack.id}`}>
              <div className="results-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Rule ID</th>
                      <th>Category</th>
                      <th>Severity</th>
                      <th>State</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPack.rules.map(rule => (
                      <tr key={rule.id}>
                        <td><code>{rule.id}</code></td>
                        <td><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{rule.category}</span></td>
                        <td>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            color: rule.severity === 'CRITICAL' || rule.severity === 'HIGH' ? 'var(--block)' : 'var(--text-muted)' 
                          }}>
                            {rule.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${rule.enabled ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                            {rule.enabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </td>
                        <td><span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500 }}>{rule.source}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Pack Details */}
          {selectedPack && (
            <SectionCard title="Pack Intelligence" subtitle="Metadata and audit information">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="detail-row">
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Status</h4>
                  <StatusBadge 
                    status={selectedPack.status} 
                    type={selectedPack.status === 'APPROVED' ? 'success' : 'warning'} 
                  />
                </div>
                <div className="detail-row">
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Source References</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                    {selectedPack.sourceReferences.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-row">
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Changelog</h4>
                  <p style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', lineHeight: '1.5', color: 'var(--text-soft)' }}>
                    {selectedPack.changelog}
                  </p>
                </div>
                
                <div className="governance-alert" style={{ background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--block)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 800 }}>⚠ Governance Disclaimer</h4>
                  <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8, color: 'var(--text-soft)', lineHeight: 1.4 }}>
                    Rule packs are not automatically deployed. Every transition requires human-in-the-loop validation. This dashboard is a simulation layer.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Lifecycle Visualization */}
          <SectionCard title="Rule Lifecycle" subtitle="Intelligence to Production">
            <div className="lifecycle-viz" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <LifecycleStep label="Threat Intelligence" sub="Adversarial patterns intake" />
              <LifecycleArrow />
              <LifecycleStep label="Candidate Rule" sub="Deterministic signature draft" />
              <LifecycleArrow />
              <LifecycleStep label="Regression Testing" sub="Precision & Recall validation" />
              <LifecycleArrow />
              <LifecycleStep label="Human Review" sub="Analyst audit & approval" />
              <LifecycleArrow />
              <LifecycleStep label="Draft Rule Pack" sub="Versioned bundle (Disabled)" />
              <LifecycleArrow />
              <LifecycleStep label="Staged Release" sub="Production deployment simulation" active />
            </div>
          </SectionCard>

          {/* Future Work */}
          <SectionCard title="V4 Roadmap" subtitle="Governance Evolution">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: '1.6', margin: 0 }}>
              Future iterations will introduce:
              <br/>• <strong>Signed Packs:</strong> Cryptographic verification.
              <br/>• <strong>RBAC:</strong> Role-based approval gates.
              <br/>• <strong>Persistence:</strong> PostgreSQL storage integration.
              <br/>• <strong>CI Gates:</strong> Auto-rejection on regression fail.
            </p>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}

function LifecycleStep({ label, sub, active }: { label: string, sub: string, active?: boolean }) {
  return (
    <div style={{ 
      padding: '0.75rem 1rem', 
      background: active ? 'rgba(37, 99, 235, 0.05)' : 'white', 
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: '8px',
      boxShadow: active ? '0 2px 8px rgba(37, 99, 235, 0.1)' : 'none'
    }}>
      <div style={{ fontWeight: 800, fontSize: '0.8rem', color: active ? 'var(--accent)' : 'var(--text)' }}>{label}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

function LifecycleArrow() {
  return (
    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.4 }}>↓</div>
  );
}
