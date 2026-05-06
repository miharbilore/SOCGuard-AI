"use client";

import { useState, useMemo, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';
import { 
  createDefaultAdversarialLabRecords, 
  AdversarialLabRecord, 
  AuditTrailEntry 
} from '@/modules/socguard/adversarial-lab';

interface FlattenedAuditEvent extends AuditTrailEntry {
  recordId: string;
  attackType: string;
  recommendation?: string;
}

export default function AuditTrailPage() {
  const [records, setRecords] = useState<AdversarialLabRecord[]>([]);
  const [actorFilter, setActorFilter] = useState('All');
  const [actionSearch, setActionSearch] = useState('');
  const [recordIdSearch, setRecordIdSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(createDefaultAdversarialLabRecords());
  }, []);

  // Flatten and enrich audit events
  const allEvents = useMemo(() => {
    const events: FlattenedAuditEvent[] = [];
    records.forEach(record => {
      record.auditTrail.forEach(entry => {
        events.push({
          ...entry,
          recordId: record.id,
          attackType: record.redTeamCandidate.attackType,
          recommendation: record.judgeRecommendation?.recommendation
        });
      });
    });
    // Sort by timestamp descending
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [records]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchActor = actorFilter === 'All' || event.actor === actorFilter;
      const matchAction = event.action.toLowerCase().includes(actionSearch.toLowerCase());
      const matchRecordId = event.recordId.toLowerCase().includes(recordIdSearch.toLowerCase());
      return matchActor && matchAction && matchRecordId;
    });
  }, [allEvents, actorFilter, actionSearch, recordIdSearch]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    const [recordId, timestamp] = selectedEventId.split('|');
    return allEvents.find(e => e.recordId === recordId && e.timestamp === timestamp) || null;
  }, [allEvents, selectedEventId]);

  const metrics = {
    total: allEvents.length,
    red: allEvents.filter(e => e.actor === 'RedTeamAgent').length,
    blue: allEvents.filter(e => e.actor === 'BlueTeamAgent').length,
    judge: allEvents.filter(e => e.actor === 'JudgeAgent').length,
    human: allEvents.filter(e => e.actor === 'HumanReviewer').length,
    records: records.length,
  };

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">System Governance & Traceability</div>
        <h1>Audit Trail</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Governance log for Red Team, Blue Team, Judge, and Human Review actions. Trace every candidate from synthesis to review.
        </p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard label="Total Audit Events" value={metrics.total} />
        <MetricCard label="Red Team" value={metrics.red} color="var(--block)" />
        <MetricCard label="Blue Team" value={metrics.blue} color="var(--safe)" />
        <MetricCard label="Judge Advisory" value={metrics.judge} color="var(--escalate)" />
        <MetricCard label="Human Review" value={metrics.human} color="var(--human)" />
        <MetricCard label="Records Tracked" value={metrics.records} color="var(--accent)" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Left Column: List and Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SectionCard title="Event History" subtitle="Centralized provenance log">
            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <select 
                value={actorFilter} 
                onChange={(e) => setActorFilter(e.target.value)}
              >
                <option value="All">All Actors</option>
                <option value="RedTeamAgent">Red Team Agent</option>
                <option value="BlueTeamAgent">Blue Team Agent</option>
                <option value="JudgeAgent">Judge Agent</option>
                <option value="HumanReviewer">Human Reviewer</option>
              </select>
              <input 
                type="text" 
                placeholder="Search action..." 
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Search record ID..." 
                value={recordIdSearch}
                onChange={(e) => setRecordIdSearch(e.target.value)}
              />
            </div>

            <div className="results-table-container" style={{ maxHeight: '640px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Record ID</th>
                    <th>Actor</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr 
                      key={`${event.recordId}|${event.timestamp}`} 
                      onClick={() => setSelectedEventId(`${event.recordId}|${event.timestamp}`)}
                      className={selectedEventId === `${event.recordId}|${event.timestamp}` ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date(event.timestamp).toLocaleTimeString()}</span></td>
                      <td><code>{event.recordId}</code></td>
                      <td>
                        <span className={`badge badge-${event.actor === 'RedTeamAgent' ? 'error' : event.actor === 'BlueTeamAgent' ? 'success' : event.actor === 'JudgeAgent' ? 'warning' : 'info'}`} style={{ fontSize: '0.6rem' }}>
                          {event.actor.replace('Agent', '').replace('Reviewer', '')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 600 }}>{event.action.replace(/_/g, ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Details and Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Event Details */}
          <SectionCard title="Event Intelligence" subtitle="Deep dive into selected audit entry">
            {selectedEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 className="detail-label">Full Timestamp</h4>
                  <div className="detail-value mono" style={{ color: 'var(--text-soft)', fontSize: '0.8rem' }}>{selectedEvent.timestamp}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 className="detail-label">Actor</h4>
                    <div className="detail-value strong" style={{ color: 'var(--text)', fontWeight: 800 }}>{selectedEvent.actor}</div>
                  </div>
                  <div>
                    <h4 className="detail-label">Action</h4>
                    <div className="detail-value accent" style={{ color: 'var(--accent)', fontWeight: 800 }}>{selectedEvent.action}</div>
                  </div>
                </div>
                <div>
                  <h4 className="detail-label">Notes</h4>
                  <p className="notes-box">
                    {selectedEvent.notes}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h4 className="detail-label">Related Record Context</h4>
                  <div className="context-box">
                    <div className="context-item"><strong>ID:</strong> {selectedEvent.recordId}</div>
                    <div className="context-item"><strong>Attack Vector:</strong> {selectedEvent.attackType}</div>
                    {selectedEvent.recommendation && (
                      <div className="context-item recommendation">
                        <strong>Judge Recommendation:</strong> {selectedEvent.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-selection">
                <div className="empty-icon">📋</div>
                <p>Select an audit entry to view full provenance details.</p>
              </div>
            )}
          </SectionCard>

          {/* Governance Section */}
          <SectionCard title="Governance Notice" subtitle="Security & Trust Model">
            <div className="gov-notice">
              <h4 className="gov-title">⚠ Academic Demo Data</h4>
              <ul className="gov-list">
                <li>Audit entries are volatile demo data stored in-memory.</li>
                <li>Production versions require immutable, tamper-evident logs.</li>
                <li>No active rule mutation occurs in this research build.</li>
                <li>Full RBAC and cryptographic signatures are future requirements.</li>
              </ul>
            </div>
          </SectionCard>

          {/* Importance Section */}
          <SectionCard title="Why Auditability Matters" subtitle="Research & Integrity Pillars">
             <div className="info-grid-compact">
                <ImportanceItem title="Accountability" desc="Clear visibility into rule authorization." />
                <ImportanceItem title="Traceability" desc="Linking rules to threat intelligence." />
                <ImportanceItem title="Anti-Poisoning" desc="Preventing adversarial pattern pollution." />
                <ImportanceItem title="Forensics" desc="Reconstructing decision chains." />
             </div>
          </SectionCard>
        </div>
      </div>

      <style jsx>{`
        .detail-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.375rem;
          letter-spacing: 0.05em;
          font-weight: 700;
        }
        
        .notes-box {
          font-size: 0.85rem;
          background: var(--surface-muted);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          line-height: 1.5;
          color: var(--text-soft);
          margin: 0;
        }

        .context-box {
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: var(--text-soft);
        }
        .context-item strong {
          color: var(--text-muted);
          margin-right: 0.5rem;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .recommendation {
          margin-top: 0.25rem;
          padding: 0.75rem;
          background: var(--accent-soft);
          border-radius: 6px;
          border: 1px solid rgba(37, 99, 235, 0.1);
          font-weight: 600;
        }

        .empty-selection {
          padding: 5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-muted);
        }
        .empty-icon {
          font-size: 3rem;
          opacity: 0.2;
        }
        .empty-selection p {
          font-size: 0.85rem;
          max-width: 200px;
        }

        .gov-notice {
          background: var(--block-bg);
          border: 1px solid rgba(220, 38, 38, 0.1);
          padding: 1.25rem;
          border-radius: 8px;
        }
        .gov-title { color: var(--block); font-size: 0.85rem; margin-bottom: 0.75rem; font-weight: 700; }
        .gov-list { font-size: 0.75rem; padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-soft); }

        .info-grid-compact {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
      `}</style>
    </DashboardShell>
  );
}

function ImportanceItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', lineHeight: '1.4' }}>{desc}</div>
    </div>
  );
}
