"use client";

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';
import RiskBadge from '@/components/dashboard/RiskBadge';
import { 
  createDefaultAdversarialLabRecords, 
  applyHumanReviewDecision,
  AdversarialLabRecord,
  HumanDecisionType,
  promoteToBenchmarkCandidate,
  promoteToRuleCandidate,
  isApprovedForBenchmark,
  isApprovedForRuleCandidate
} from '@/modules/socguard/adversarial-lab';

export default function ReviewQueuePage() {
  const [records, setRecords] = useState<AdversarialLabRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize state with default mock records
    setRecords(createDefaultAdversarialLabRecords());
  }, []);

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  // Metrics calculation
  const metrics = {
    pending: records.filter(r => !r.humanReviewDecision).length,
    approvedBench: records.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_BENCHMARK' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length,
    approvedRule: records.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_RULE_CANDIDATE' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length,
    needsRevision: records.filter(r => r.humanReviewDecision?.decision === 'NEEDS_REVISION').length,
    rejected: records.filter(r => r.humanReviewDecision?.decision === 'REJECT').length,
  };

  const handleReview = (decision: HumanDecisionType) => {
    if (!selectedRecord) return;
    if (!reviewerId.trim()) {
      setError('Reviewer ID is required.');
      return;
    }
    if (!reviewerNotes.trim() || reviewerNotes.trim().length < 5) {
      setError('Reviewer Notes are required (min 5 characters).');
      return;
    }

    try {
      const updatedRecord = applyHumanReviewDecision(selectedRecord, {
        reviewerId,
        decision,
        reviewerNotes
      });

      setRecords(records.map(r => r.id === selectedRecordId ? updatedRecord : r));
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during human review.');
      }
    }
  };

  return (
    <DashboardShell>
      <div className="governance-banner warning" style={{ marginBottom: '1.5rem' }}>
        <span>⚠</span>
        <span>Demo-only human review queue. Decisions update local state only and do not modify production assets.</span>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Governance & Validation</div>
        <h1>Human Review Queue</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Human-governed approval workflow for adversarial lab outputs. Promoting research candidates to benchmarks or rule candidates.
        </p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard label="Pending" value={metrics.pending} color={metrics.pending > 0 ? 'var(--escalate)' : 'var(--text-muted)'} />
        <MetricCard label="Approved (Bench)" value={metrics.approvedBench} color="var(--safe)" />
        <MetricCard label="Approved (Rule)" value={metrics.approvedRule} color="var(--accent)" />
        <MetricCard label="Needs Revision" value={metrics.needsRevision} color="var(--escalate)" />
        <MetricCard label="Rejected" value={metrics.rejected} color="var(--block)" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRecordId ? '1.2fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Records Table */}
        <SectionCard title="Lab Records" subtitle="Select a record to perform human review">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Attack Type</th>
                  <th>Safety</th>
                  <th>Judge Rec</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr 
                    key={record.id} 
                    onClick={() => setSelectedRecordId(record.id)}
                    className={selectedRecordId === record.id ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><code>{record.id}</code></td>
                    <td><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{record.redTeamCandidate.attackType}</span></td>
                    <td>
                        <span className={`badge badge-${record.redTeamCandidate.safetyStatus === 'SANITIZED' ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.6rem' }}>
                        {record.redTeamCandidate.safetyStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700,
                        color: record.judgeRecommendation?.recommendation === 'RECOMMEND_APPROVE_FOR_REVIEW' ? 'var(--safe)' : 'var(--escalate)' 
                      }}>
                        {record.judgeRecommendation?.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {record.humanReviewDecision ? (
                        <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>
                          {record.humanReviewDecision.decision.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="badge badge-ESCALATE" style={{ fontSize: '0.6rem' }}>PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Details Panel */}
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SectionCard title={`Details: ${selectedRecord.id}`} subtitle="Deep dive into record components">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Sanitized Prompt</h4>
                  <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: '#10B981', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {selectedRecord.redTeamCandidate.sanitizedPrompt}
                  </code>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Target Weakness</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>{selectedRecord.redTeamCandidate.targetWeakness}</p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Blue Team Proposal</h4>
                  <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--accent)' }}>
                      Pattern: <code>{selectedRecord.blueTeamProposal?.proposedRulePattern}</code>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: 1.4 }}>Rationale: {selectedRecord.blueTeamProposal?.rationale}</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Judge Advisory Evaluation</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                     <ScoreItem label="Realism" score={selectedRecord.judgeRecommendation?.realismScore} />
                     <ScoreItem label="Coverage" score={selectedRecord.judgeRecommendation?.coverageScore} />
                     <ScoreItem label="FP Risk" score={selectedRecord.judgeRecommendation?.falsePositiveRiskScore} inverted />
                     <ScoreItem label="Safety" score={selectedRecord.judgeRecommendation?.safetyScore} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Reasons:</strong> {selectedRecord.judgeRecommendation?.reasons.join(', ')}</div>
                    <div><strong>Limitations:</strong> {selectedRecord.judgeRecommendation?.limitations.join(', ')}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Audit Trail</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedRecord.auditTrail.map((entry, i) => (
                      <div key={i} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8rem' }}>{entry.actor}: {entry.action.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{entry.notes}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '0.15rem', textTransform: 'uppercase' }}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Review Form */}
            <SectionCard title="Human Review Action" subtitle="Final authority decision">
              {selectedRecord.humanReviewDecision ? (
                <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--human)', marginBottom: '0.4rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    DECISION: {selectedRecord.humanReviewDecision.decision.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}><strong>Reviewer:</strong> {selectedRecord.humanReviewDecision.reviewerId}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-soft)', lineHeight: 1.4 }}><strong>Notes:</strong> {selectedRecord.humanReviewDecision.reviewerNotes}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="Reviewer ID (e.g., ANALYST-01)" 
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                  />
                  <textarea 
                    placeholder="Reviewer rationale and notes (min 5 characters)..."
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    style={{ height: '80px' }}
                  />
                  
                  {error && <div style={{ color: 'var(--block)', fontSize: '0.75rem', fontWeight: 800 }}>⚠ {error}</div>}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleReview('APPROVE_FOR_BOTH')} className="btn-primary" style={{ background: 'var(--safe)', border: 'none', flex: 1 }}>Approve Both</button>
                    <button onClick={() => handleReview('APPROVE_FOR_BENCHMARK')} className="btn-secondary" style={{ flex: 1 }}>Bench Only</button>
                    <button onClick={() => handleReview('APPROVE_FOR_RULE_CANDIDATE')} className="btn-secondary" style={{ flex: 1 }}>Rule Only</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleReview('NEEDS_REVISION')} className="btn-secondary" style={{ borderColor: 'var(--escalate)', color: 'var(--escalate)', flex: 1 }}>Revision</button>
                    <button onClick={() => handleReview('REJECT')} className="btn-secondary" style={{ borderColor: 'var(--block)', color: 'var(--block)', flex: 1 }}>Reject</button>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Promotion Preview */}
            {selectedRecord.humanReviewDecision && (
              <SectionCard title="Promotion Preview" subtitle="Simulated downstream effect">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {isApprovedForBenchmark(selectedRecord) && (() => {
                       const bench = promoteToBenchmarkCandidate(selectedRecord);
                       return (
                        <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.7rem', marginBottom: '0.4rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BENCHMARK CANDIDATE: {bench.id}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                            <div><strong>Category:</strong> {bench.expectedCategory}</div>
                            <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>{bench.shortDescription}</div>
                          </div>
                        </div>
                       );
                    })()}

                    {isApprovedForRuleCandidate(selectedRecord) && (() => {
                       const rule = promoteToRuleCandidate(selectedRecord);
                       return (
                        <div style={{ background: 'var(--safe-bg)', border: '1px solid rgba(5, 150, 105, 0.1)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.7rem', marginBottom: '0.4rem', color: 'var(--safe)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>V2 CANDIDATE RULE: {rule.id}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                            <div><strong>Pattern:</strong> <code>{rule.suggestedPattern}</code></div>
                            <div style={{ marginTop: '0.25rem', opacity: 0.8 }}><strong>Rationale:</strong> {rule.rationale.substring(0, 80)}...</div>
                          </div>
                        </div>
                       );
                    })()}

                    <p style={{ fontSize: '0.65rem', opacity: 0.6, fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                      ⚠ Preview only. Decisions do not modify active production systems.
                    </p>
                 </div>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function ScoreItem({ label, score, inverted }: { label: string, score?: number, inverted?: boolean }) {
  if (score === undefined) return null;
  
  const getColor = (s: number) => {
    if (inverted) {
      if (s > 70) return 'var(--block)';
      if (s > 40) return 'var(--escalate)';
      return 'var(--safe)';
    } else {
      if (s > 80) return 'var(--safe)';
      if (s > 50) return 'var(--escalate)';
      return 'var(--block)';
    }
  };

  return (
    <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getColor(score), letterSpacing: '-0.02em' }}>{score}</div>
    </div>
  );
}
