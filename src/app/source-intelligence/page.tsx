"use client";

import { useState, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { 
  ALLOWED_SOURCES, 
  createDemoSourceIntelligenceNotes, 
  createBenchmarkCandidatesFromApprovedNotes, 
  summarizeSourceIntelligence,
  SourceIntelligenceNote,
  BenchmarkCorpusCandidate
} from '@/modules/socguard/source-intelligence';

export default function SourceIntelligencePage() {
  const notes = useMemo(() => createDemoSourceIntelligenceNotes(), []);
  const candidates = useMemo(() => createBenchmarkCandidatesFromApprovedNotes(notes), [notes]);
  const summary = useMemo(() => summarizeSourceIntelligence(ALLOWED_SOURCES, notes, candidates), [notes, candidates]);
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const selectedCandidates = candidates.filter(c => c.sourceNoteId === selectedNoteId);

  return (
    <DashboardShell>
      {/* Governance Banner */}
      <div className="governance-banner info" style={{ marginBottom: '1.5rem' }}>
        <span>ℹ</span>
        <span>Governance Notice: Source Intelligence does not crawl the internet automatically. Sources are allowlisted, sanitized, reviewed, and converted into candidates only.</span>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Corpus Builder (V4.2)</div>
        <h1>Source Intelligence</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Allowed-source registry and sanitized corpus builder for prompt-injection defense research.
        </p>
      </header>

      {/* Metrics */}
      <section className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard label="Allowed Sources" value={summary.totalSources} subValue="Registry depth" />
        <MetricCard label="Source Notes" value={summary.totalNotes} color="var(--accent)" />
        <MetricCard label="Approved Notes" value={summary.approvedNotes} color="var(--safe)" />
        <MetricCard label="Benchmark Candidates" value={summary.totalCandidates} color="var(--safe)" />
        <MetricCard label="Needs Review" value={summary.pendingReviewCount} color="var(--escalate)" subValue="Action required" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Allowed Sources Table */}
        <SectionCard title="Allowed Source Registry" subtitle="Strictly allowlisted intelligence providers">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Source Name</th>
                  <th>Type</th>
                  <th>Trust</th>
                  <th>Allowed Use</th>
                  <th>Status</th>
                  <th>License Notes</th>
                </tr>
              </thead>
              <tbody>
                {ALLOWED_SOURCES.map(source => (
                  <tr key={source.id}>
                    <td style={{ fontWeight: 700 }}>{source.name}</td>
                    <td><span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{source.type}</span></td>
                    <td>
                      <span className={`badge badge-${source.trustLevel === 'HIGH' ? 'success' : 'warning'}`} style={{ fontSize: '0.6rem' }}>
                        {source.trustLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {source.allowedUse.map(use => (
                          <span key={use} style={{ fontSize: '0.6rem', background: 'var(--surface-muted)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{use}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${source.enabled ? 'success' : 'error'}`} style={{ fontSize: '0.6rem' }}>
                        {source.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{source.licenseNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Notes and Detail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
          {/* Notes List */}
          <SectionCard title="Intelligence Notes" subtitle="Sanitized research insights from allowed sources">
            <div className="results-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Attack Types</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(note => (
                    <tr 
                      key={note.id} 
                      onClick={() => setSelectedNoteId(note.id)}
                      className={selectedNoteId === note.id ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{note.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: {note.id} • {note.languages.join(', ')}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${note.status === 'APPROVED' ? 'success' : 'warning'}`} style={{ fontSize: '0.6rem' }}>
                          {note.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {note.attackTypes.map(at => (
                            <span key={at} style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700 }}>{at}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Note Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {selectedNote ? (
              <SectionCard title="Intelligence Trace" subtitle={`Source: ${selectedNote.sourceId} • Provenance: ${selectedNote.provenance}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   <div>
                     <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Research Summary</h4>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.5 }}>{selectedNote.summary}</p>
                   </div>

                   <div>
                     <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Sanitized Pattern Samples</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedNote.sanitizedPatterns.map((pattern, i) => (
                          <code key={i} style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: '4px', color: '#10B981', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                            {pattern}
                          </code>
                        ))}
                     </div>
                     <div style={{ fontSize: '0.6rem', color: 'var(--accent)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        Note: Patterns use placeholders like [REDACTED_HARMFUL_REQUEST] to prevent operational use.
                     </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--safe)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Defensive Insights</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                          {selectedNote.defensiveInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--block)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Known Limitations</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                          {selectedNote.limitations.map((limit, i) => <li key={i}>{limit}</li>)}
                        </ul>
                      </div>
                   </div>
                </div>
              </SectionCard>
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select an intelligence note to view sanitized trace details.</p>
              </div>
            )}

            {/* Benchmark Candidates Preview */}
            {selectedNote && selectedNote.status === 'APPROVED' && (
              <SectionCard title="Generated Benchmark Candidates" subtitle={`Automatically derived from Note: ${selectedNote.id}`}>
                {selectedCandidates.length > 0 ? (
                  <div className="results-table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Sanitized Log</th>
                          <th>Attack Type</th>
                          <th>Diff.</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCandidates.map(c => (
                          <tr key={c.id}>
                            <td><code style={{ fontSize: '0.7rem' }}>{c.sanitizedLog}</code></td>
                            <td><span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{c.attackType}</span></td>
                            <td><span style={{ fontSize: '0.65rem' }}>{c.difficulty}</span></td>
                            <td>
                              <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>{c.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No candidates found for this note. Candidates are generated from sanitized patterns.
                  </div>
                )}
              </SectionCard>
            )}
          </div>
        </div>

        {/* Lifecycle */}
        <SectionCard title="Source Intelligence Lifecycle" subtitle="From allowed source to benchmark/rule candidate">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
             <LifecycleStep label="Registry" icon="📑" sub="Allowed Source" active />
             <LifecycleArrow />
             <LifecycleStep label="Extraction" icon="🔍" sub="Sanitized Note" active />
             <LifecycleArrow />
             <LifecycleStep label="Audit" icon="👤" sub="Human Review" />
             <LifecycleArrow />
             <LifecycleStep label="Promotion" icon="📦" sub="Corpus Candidate" />
             <LifecycleArrow />
             <LifecycleStep label="Synthesis" icon="🤖" sub="Agent Lab" />
             <LifecycleArrow />
             <LifecycleStep label="Persistence" icon="◉" sub="Rule Vault" />
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}

function LifecycleStep({ label, icon, sub, active }: { label: string; icon: string; sub: string; active?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', opacity: active ? 1 : 0.4 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{icon}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: active ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

function LifecycleArrow() {
  return <div style={{ fontSize: '0.75rem', color: 'var(--border)', fontWeight: 300 }}>→</div>;
}
