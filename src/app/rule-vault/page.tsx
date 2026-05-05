"use client";

import { useState, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import MetricCard from '@/components/dashboard/MetricCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { 
  createDemoRuleVaultEntries, 
  summarizeRuleVault,
  RuleVaultEntry,
  RuleVaultStatus
} from '@/modules/socguard/rule-vault';

export default function RuleVaultPage() {
  const [entries] = useState<RuleVaultEntry[]>(createDemoRuleVaultEntries());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const summary = useMemo(() => summarizeRuleVault(entries), [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.attackType.toLowerCase().includes(search.toLowerCase()) ||
        e.suggestedPattern.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [entries, search, statusFilter]);

  const selectedEntry = entries.find(e => e.id === selectedId);

  return (
    <DashboardShell>
      {/* Governance Banner */}
      <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem', fontWeight: 800 }}>
        ℹ Governance Notice: Rule Vault entries are candidates only. They are not active production detection rules and are never deployed automatically.
      </div>

      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Governance Registry (V4)</div>
        <h1>Rule Vault</h1>
        <p className="description" style={{ margin: 0 }}>
          Candidate signature registry for human-reviewed prompt injection defenses.
        </p>
      </header>

      {/* Summary Metrics */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard label="Total Candidates" value={summary.total} subValue="Registry depth" />
        <MetricCard label="Needs Review" value={summary.needsReview} color="var(--escalate)" subValue="Pending audit" />
        <MetricCard label="Approved" value={summary.approved} color="var(--safe)" subValue="Promotion ready" />
        <MetricCard label="Rejected" value={summary.rejected} color="var(--block)" subValue="Filtered out" />
        <MetricCard label="Avg Confidence" value={`${(summary.averageConfidence * 100).toFixed(0)}%`} color="var(--accent)" />
      </section>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: selectedId ? '1.4fr 0.6fr' : '1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Filters */}
          <SectionCard title="Registry Filter" subtitle="Search by pattern, type, or status">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search pattern, ID, or attack type..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minWidth: '160px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="APPROVED_FOR_BOTH">Approved (Both)</option>
                <option value="APPROVED_FOR_BENCHMARK">Approved (Benchmark)</option>
                <option value="APPROVED_FOR_RULE_CANDIDATE">Approved (Rule)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </SectionCard>

          {/* Table */}
          <SectionCard title={`Candidate Entries (${filteredEntries.length})`} subtitle="Select an entry to view provenance and signature details">
            <div className="results-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Attack Type</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Conf.</th>
                    <th>Status</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr 
                      key={entry.id} 
                      onClick={() => setSelectedId(entry.id)}
                      className={selectedId === entry.id ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><code>{entry.id}</code></td>
                      <td><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{entry.attackType.replace(/_/g, ' ')}</span></td>
                      <td><span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{entry.proposedCategory}</span></td>
                      <td><span style={{ fontWeight: 800, fontSize: '0.75rem', color: entry.severity === 'HIGH' || entry.severity === 'CRITICAL' ? 'var(--block)' : 'inherit' }}>{entry.severity}</span></td>
                      <td><span style={{ fontWeight: 800 }}>{(entry.confidence * 100).toFixed(0)}%</span></td>
                      <td>
                        <span className="badge" style={{ 
                          fontSize: '0.65rem', 
                          background: entry.status === 'NEEDS_REVIEW' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                          color: entry.status === 'NEEDS_REVIEW' ? 'var(--escalate)' : 'var(--safe)',
                          border: `1px solid ${entry.status === 'NEEDS_REVIEW' ? 'var(--escalate)' : 'var(--safe)'}`
                        }}>
                          {entry.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td><span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{entry.sourceType}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Lifecycle Explanation */}
          <SectionCard title="Signature Lifecycle" subtitle="From agent synthesis to production deployment">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
               <LifecycleStep label="Synthesis" icon="🤖" sub="Agent Lab" />
               <LifecycleArrow />
               <LifecycleStep label="Curation" icon="📦" sub="Curator" active />
               <LifecycleArrow />
               <LifecycleStep label="Registry" icon="🏦" sub="Rule Vault" active />
               <LifecycleArrow />
               <LifecycleStep label="Review" icon="👤" sub="Human Audit" />
               <LifecycleArrow />
               <LifecycleStep label="Bundling" icon="📜" sub="Rule Pack" />
               <LifecycleArrow />
               <LifecycleStep label="Release" icon="🚀" sub="Production" />
            </div>
          </SectionCard>
        </div>

        {/* Detail Panel */}
        {selectedEntry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SectionCard title="Candidate Details" subtitle={`Provenance: ${selectedEntry.provenance}`}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Sanitized Lab Log</h4>
                    <code style={{ display: 'block', padding: '1rem', background: '#0F172A', borderRadius: '8px', color: '#10B981', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {selectedEntry.sanitizedLog}
                    </code>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Suggested Pattern</h4>
                    <code style={{ display: 'block', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--accent)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                      {selectedEntry.suggestedPattern}
                    </code>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>False Positive Risks</h4>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                      {selectedEntry.falsePositiveRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>

                  {selectedEntry.reviewerNotes && (
                    <div style={{ background: 'rgba(219, 39, 119, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(219, 39, 119, 0.1)' }}>
                       <h4 style={{ fontSize: '0.7rem', color: 'var(--human)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>Reviewer Decision</h4>
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', margin: 0 }}>{selectedEntry.reviewerNotes}</p>
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>By: {selectedEntry.reviewedBy} at {selectedEntry.reviewedAt}</div>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      <strong>Governance Note:</strong> Approval in the Vault only makes this signature available for bundling. Actual detection deployment requires inclusion in a <strong>Rule Pack</strong> and formal activation.
                    </p>
                  </div>
               </div>
            </SectionCard>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function LifecycleStep({ label, icon, sub, active }: { label: string, icon: string, sub: string, active?: boolean }) {
  return (
    <div style={{ textAlign: 'center', opacity: active ? 1 : 0.4 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>{label}</div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sub}</div>
    </div>
  );
}

function LifecycleArrow() {
  return <div style={{ color: 'var(--border)', fontWeight: 300, fontSize: '1.25rem' }}>→</div>;
}
