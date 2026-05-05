"use client";

import { useState, useEffect } from 'react';
import { 
  createDefaultAdversarialLabRecords, 
  applyHumanReviewDecision,
  AdversarialLabRecord,
  HumanDecisionType
} from '@/modules/socguard/adversarial-lab';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import RiskBadge from '@/components/dashboard/RiskBadge';
import MetricCard from '@/components/dashboard/MetricCard';

export default function AdversarialLabPage() {
  const [records, setRecords] = useState<AdversarialLabRecord[]>([]);
  const [reviewerId, setReviewerId] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [error, setError] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(createDefaultAdversarialLabRecords());
  }, []);

  const handleDecision = (recordId: string, decision: HumanDecisionType) => {
    if (!reviewerId.trim()) {
      setError('Reviewer ID is required.');
      return;
    }
    if (!reviewerNotes.trim() || reviewerNotes.trim().length < 5) {
      setError('Reviewer Notes are required (min 5 characters).');
      return;
    }
    setError('');

    const record = records.find(r => r.id === recordId);
    if (!record) return;

    try {
      const updatedRecord = applyHumanReviewDecision(record, {
        reviewerId,
        decision,
        reviewerNotes
      });

      setRecords(records.map(r => r.id === recordId ? updatedRecord : r));
      setReviewerNotes(''); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during record review.');
      }
    }
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Research & Development (V3)</div>
        <h1>Adversarial Agent Lab</h1>
        <p className="description" style={{ margin: 0 }}>
          A secure sandbox for synthesizing attack patterns and evaluating deterministic defense proposals.
        </p>
      </header>

      {/* Overview Section */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard label="Red Team" value="Active" subValue="Synthesis Engine" />
        <MetricCard label="Blue Team" value="Active" subValue="Signature Proposals" color="var(--accent)" />
        <MetricCard label="Judge Agent" value="Advisory" subValue="Heuristic Evaluation" color="var(--escalate)" />
        <MetricCard label="Human Review" value="Mandatory" subValue="Final Authority" color="var(--human)" />
      </section>

      {/* Main Lab Records Section */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: selectedRecordId ? '1.4fr 0.6fr' : '1fr', gap: '2rem' }}>
        <SectionCard title={`Research Records (${records.length})`} subtitle="Select a record to deep dive and review">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Attack Type</th>
                  <th>Safety</th>
                  <th>Judge Rec</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} 
                      onClick={() => setSelectedRecordId(record.id)}
                      className={selectedRecordId === record.id ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 800, color: 'var(--accent)' }}><code>{record.id}</code></td>
                    <td><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{record.redTeamCandidate.attackType}</span></td>
                    <td>
                      <span className={`badge badge-${record.redTeamCandidate.safetyStatus === 'SANITIZED' ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                        {record.redTeamCandidate.safetyStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        color: record.judgeRecommendation?.recommendation === 'RECOMMEND_APPROVE_FOR_REVIEW' ? 'var(--safe)' : 'var(--escalate)' 
                      }}>
                        {record.judgeRecommendation?.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {record.humanReviewDecision ? (
                        <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--human)', color: 'white', border: 'none' }}>
                          {record.humanReviewDecision.decision.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="badge badge-ESCALATE" style={{ fontSize: '0.65rem' }}>PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Details and Review Panel */}
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SectionCard title={`Details: ${selectedRecord.id}`} subtitle="Deep dive into record components">
              <div className="detail-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Sanitized Prompt</h4>
                  <code style={{ display: 'block', padding: '1rem', background: '#0F172A', borderRadius: '8px', fontSize: '0.8rem', color: '#10B981', marginBottom: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {selectedRecord.redTeamCandidate.sanitizedPrompt}
                  </code>
                </div>

                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Blue Proposal</h4>
                  <div style={{ background: 'rgba(37, 99, 235, 0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--accent)' }}>
                      Pattern: <code style={{ color: 'var(--safe)', background: 'rgba(0,0,0,0.05)', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>{selectedRecord.blueTeamProposal?.proposedRulePattern}</code>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.4 }}>Rationale: {selectedRecord.blueTeamProposal?.rationale}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Judge Advisory</h4>
                  <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>REALISM</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{selectedRecord.judgeRecommendation?.realismScore}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>COVERAGE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{selectedRecord.judgeRecommendation?.coverageScore}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Human Review</h4>
                  {selectedRecord.humanReviewDecision ? (
                    <div style={{ background: 'rgba(219, 39, 119, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(219, 39, 119, 0.1)' }}>
                      <div style={{ fontWeight: 800, color: 'var(--human)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>{selectedRecord.humanReviewDecision.decision.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{selectedRecord.humanReviewDecision.reviewerNotes}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input 
                        type="text" 
                        placeholder="Reviewer ID" 
                        value={reviewerId}
                        onChange={(e) => setReviewerId(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                      <textarea 
                        placeholder="Review rationale..."
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        style={{ height: '80px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--text)', resize: 'none' }}
                      />
                      {error && <div style={{ color: 'var(--block)', fontSize: '0.8rem', fontWeight: 700 }}>⚠ {error}</div>}
                      <div className="button-group" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleDecision(selectedRecord.id, 'APPROVE_FOR_BOTH')} style={{ background: 'var(--safe)', color: 'white', border: 'none', padding: '0.625rem', borderRadius: '6px', fontWeight: 700, flex: 1, cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleDecision(selectedRecord.id, 'REJECT')} style={{ border: '1px solid var(--block)', color: 'var(--block)', padding: '0.625rem', borderRadius: '6px', fontWeight: 700, flex: 1, cursor: 'pointer', background: 'transparent' }}>Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <section style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)', borderRadius: '8px' }}>
        <h3 style={{ color: 'var(--escalate)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚠ Safety & Governance</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.5 }}>
          All attack patterns are sanitized and non-operational. Human review is mandatory for all record promotions. 
          Judge agent recommendations are ADVISORY and do not bypass human validation gates.
        </p>
      </section>
    </DashboardShell>
  );
}
