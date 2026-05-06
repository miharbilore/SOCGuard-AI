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
      <div className="governance-banner info" style={{ marginBottom: '1.5rem' }}>
        <span>ℹ</span>
        <span>Governance Notice: Rule Vault entries are candidates only. They are not active production detection rules and are never deployed automatically.</span>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Governance Registry (V4)</div>
        <h1>Rule Vault</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Candidate signature registry for human-reviewed prompt injection defenses.
        </p>
      </header>

      {/* Summary Metrics */}
      <section className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard label="Total Candidates" value={summary.total} subValue="Registry depth" />
        <MetricCard label="Needs Review" value={summary.needsReview} color="var(--escalate)" subValue="Pending audit" />
        <MetricCard label="Approved" value={summary.approved} color="var(--safe)" subValue="Promotion ready" />
        <MetricCard label="Rejected" value={summary.rejected} color="var(--block)" subValue="Filtered out" />
        <MetricCard label="Avg Confidence" value={`${(summary.averageConfidence * 100).toFixed(0)}%`} color="var(--accent)" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1.4fr 0.6fr' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters */}
          <SectionCard title="Registry Filter" subtitle="Search by pattern, type, or status">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search pattern, ID, or attack type..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: '180px' }}
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
                      <td><strong style={{ fontSize: '0.8rem' }}>{(entry.confidence * 100).toFixed(0)}%</strong></td>
                      <td>
                        <span className={`badge badge-${entry.status === 'NEEDS_REVIEW' ? 'warning' : 'success'}`} style={{ fontSize: '0.6rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
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
        {selectedId && selectedEntry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SectionCard title="Candidate Details" subtitle={`Provenance: ${selectedEntry.provenance}`}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Sanitized Lab Log</h4>
                    <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: 'var(--radius-xs)', color: '#10B981', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {selectedEntry.sanitizedLog}
                    </code>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Suggested Pattern</h4>
                    <code style={{ display: 'block', padding: '0.625rem', background: 'var(--accent-soft)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--accent)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      {selectedEntry.suggestedPattern}
                    </code>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>False Positive Risks</h4>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                      {selectedEntry.falsePositiveRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>

                  {selectedEntry.reviewerNotes && (
                    <div style={{ background: 'var(--surface-muted)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                       <h4 style={{ fontSize: '0.65rem', color: 'var(--human)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>Reviewer Decision</h4>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{selectedEntry.reviewerNotes}</p>
                       <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>By: {selectedEntry.reviewedBy} at {selectedEntry.reviewedAt}</div>
                    </div>
                  )}

                  <div className="governance-banner info" style={{ padding: '0.75rem', fontSize: '0.65rem' }}>
                    <span> Approval in the Vault only makes this signature available for bundling. Actual detection deployment requires formal activation in a Rule Pack.</span>
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
