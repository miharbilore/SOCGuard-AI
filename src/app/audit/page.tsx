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
        <p className="description">
          Governance log for Red Team, Blue Team, Judge, and Human Review actions. Trace every candidate from synthesis to review.
        </p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard label="Total Audit Events" value={metrics.total} />
        <MetricCard label="Red Team" value={metrics.red} color="var(--block)" />
        <MetricCard label="Blue Team" value={metrics.blue} color="var(--safe)" />
        <MetricCard label="Judge Advisory" value={metrics.judge} color="var(--escalate)" />
        <MetricCard label="Human Review" value={metrics.human} color="var(--human)" />
        <MetricCard label="Records Tracked" value={metrics.records} color="var(--accent)" />
      </section>

      <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: List and Filters */}
        <div className="list-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SectionCard title="Event History" subtitle="Centralized provenance log">
            {/* Filters */}
            <div className="filter-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <select 
                value={actorFilter} 
                onChange={(e) => setActorFilter(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
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
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
              />
              <input 
                type="text" 
                placeholder="Search record ID..." 
                value={recordIdSearch}
                onChange={(e) => setRecordIdSearch(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
              />
            </div>

            <div className="results-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
                  {filteredEvents.map((event, i) => (
                    <tr 
                      key={`${event.recordId}|${event.timestamp}`} 
                      onClick={() => setSelectedEventId(`${event.recordId}|${event.timestamp}`)}
                      style={{ 
                        cursor: 'pointer', 
                        background: selectedEventId === `${event.recordId}|${event.timestamp}` ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        borderLeft: selectedEventId === `${event.recordId}|${event.timestamp}` ? '4px solid var(--accent)' : 'none'
                      }}
                    >
                      <td><span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(event.timestamp).toLocaleTimeString()}</span></td>
                      <td><code>{event.recordId}</code></td>
                      <td>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold',
                          color: event.actor === 'HumanReviewer' ? 'var(--human)' : 'var(--text-muted)'
                        }}>
                          {event.actor.replace('Agent', '').replace('Reviewer', '')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{event.action.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Details and Context */}
        <div className="details-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Event Details */}
          <SectionCard title="Event Intelligence" subtitle="Deep dive into selected audit entry">
            {selectedEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="detail-row">
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Full Timestamp</h4>
                  <div style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{selectedEvent.timestamp}</div>
                </div>
                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Actor</h4>
                    <div style={{ fontWeight: 'bold' }}>{selectedEvent.actor}</div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Action</h4>
                    <div style={{ color: 'var(--accent)' }}>{selectedEvent.action}</div>
                  </div>
                </div>
                <div className="detail-row">
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Notes</h4>
                  <p style={{ fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {selectedEvent.notes}
                  </p>
                </div>
                <div className="detail-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Related Record Context</h4>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div><strong>ID:</strong> {selectedEvent.recordId}</div>
                    <div><strong>Attack Vector:</strong> {selectedEvent.attackType}</div>
                    {selectedEvent.recommendation && (
                      <div style={{ marginTop: '0.25rem' }}><strong>Judge Recommendation:</strong> {selectedEvent.recommendation}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="placeholder" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                Select an audit entry to view full details.
              </div>
            )}
          </SectionCard>

          {/* Governance Section */}
          <SectionCard title="Governance Notice" subtitle="Security & Trust Model">
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--block)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--block)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠ Academic Demo Data</h4>
              <ul style={{ fontSize: '0.75rem', paddingLeft: '1.25rem', margin: 0, opacity: 0.8 }}>
                <li>Audit entries are volatile demo data stored in-memory.</li>
                <li>Production versions require immutable, tamper-evident logs (e.g., Blockchain or signed WORM storage).</li>
                <li>No active rule mutation occurs from audit events in this research build.</li>
                <li>Full RBAC and cryptographic signatures are future requirements.</li>
              </ul>
            </div>
          </SectionCard>

          {/* Importance Section */}
          <SectionCard title="Why Auditability Matters" subtitle="Research & Integrity Pillars">
             <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)' }}>Accountability</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Clear visibility into who authorized which detection rule.</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)' }}>Traceability</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Linking every rule back to its threat intelligence source.</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)' }}>Anti-Poisoning</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Preventing adversarial patterns from polluting production.</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)' }}>Forensics</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Reconstructing decision chains after a missed detection.</div>
                </div>
             </div>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
