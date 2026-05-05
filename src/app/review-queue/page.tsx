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
      <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid var(--human)', color: 'var(--human)', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Demo-only human review queue. Decisions update local state only and do not modify production rules, production datasets, or deployed rule packs.
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Governance & Validation</div>
        <h1>Human Review Queue</h1>
        <p className="description">
          Human-governed approval workflow for adversarial lab outputs. Promoting research candidates to benchmarks or rule candidates.
        </p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard label="Pending" value={metrics.pending} color={metrics.pending > 0 ? 'var(--escalate)' : 'var(--text-muted)'} />
        <MetricCard label="Approved (Bench)" value={metrics.approvedBench} color="var(--safe)" />
        <MetricCard label="Approved (Rule)" value={metrics.approvedRule} color="var(--accent)" />
        <MetricCard label="Needs Revision" value={metrics.needsRevision} color="var(--escalate)" />
        <MetricCard label="Rejected" value={metrics.rejected} color="var(--block)" />
      </section>

      <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: selectedRecordId ? '1.2fr 1fr' : '1fr', gap: '2rem' }}>
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
                    style={{ 
                      cursor: 'pointer', 
                      background: selectedRecordId === record.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      borderLeft: selectedRecordId === record.id ? '4px solid var(--accent)' : 'none'
                    }}
                  >
                    <td><code>{record.id}</code></td>
                    <td><span style={{ fontSize: '0.85rem' }}>{record.redTeamCandidate.attackType}</span></td>
                    <td>
                       <span className={`badge badge-${record.redTeamCandidate.safetyStatus === 'SANITIZED' ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                        {record.redTeamCandidate.safetyStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: record.judgeRecommendation?.recommendation === 'RECOMMEND_APPROVE_FOR_REVIEW' ? 'var(--safe)' : 'var(--escalate)' 
                      }}>
                        {record.judgeRecommendation?.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {record.humanReviewDecision ? (
                        <span className="badge" style={{ background: 'var(--human)', color: 'white', border: 'none', fontSize: '0.65rem' }}>
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

        {/* Details Panel */}
        {selectedRecord && (
          <div className="details-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SectionCard title={`Details: ${selectedRecord.id}`} subtitle="Deep dive into record components">
              <div className="details-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="detail-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sanitized Prompt</h4>
                  <code style={{ display: 'block', padding: '1rem', background: '#000', borderRadius: '4px', fontSize: '0.85rem', color: '#0f0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {selectedRecord.redTeamCandidate.sanitizedPrompt}
                  </code>
                </div>

                <div className="detail-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target Weakness</h4>
                  <p style={{ fontSize: '0.95rem' }}>{selectedRecord.redTeamCandidate.targetWeakness}</p>
                </div>

                <div className="detail-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Blue Team Proposal</h4>
                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--accent)' }}>
                      Pattern: <code style={{ color: 'var(--safe)' }}>{selectedRecord.blueTeamProposal?.proposedRulePattern}</code>
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Rationale: {selectedRecord.blueTeamProposal?.rationale}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Judge Advisory Recommendation</h4>
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--escalate)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--escalate)' }}>
                    <strong>ADVISORY:</strong> These scores are generated by a deterministic heuristic judge and do not represent final human approval.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                     <ScoreItem label="Realism" score={selectedRecord.judgeRecommendation?.realismScore} />
                     <ScoreItem label="Coverage" score={selectedRecord.judgeRecommendation?.coverageScore} />
                     <ScoreItem label="FP Risk" score={selectedRecord.judgeRecommendation?.falsePositiveRiskScore} inverted />
                     <ScoreItem label="Safety" score={selectedRecord.judgeRecommendation?.safetyScore} />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}><strong>Reasons:</strong> {selectedRecord.judgeRecommendation?.reasons.join(', ')}</div>
                    <div><strong>Limitations:</strong> {selectedRecord.judgeRecommendation?.limitations.join(', ')}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Audit Trail</h4>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                    {selectedRecord.auditTrail.map((entry, i) => (
                      <div key={i} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{entry.actor}: {entry.action}</div>
                        <div>{entry.notes}</div>
                        <div style={{ opacity: 0.5 }}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Review Form */}
            <SectionCard title="Human Review Action" subtitle="Final authority decision">
              {selectedRecord.humanReviewDecision ? (
                <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid var(--human)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--human)', marginBottom: '0.5rem' }}>
                    DECISION APPLIED: {selectedRecord.humanReviewDecision.decision.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}><strong>Reviewer:</strong> {selectedRecord.humanReviewDecision.reviewerId}</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}><strong>Notes:</strong> {selectedRecord.humanReviewDecision.reviewerNotes}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Reviewer ID (e.g., ANALYST-01)" 
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem', borderRadius: '4px' }}
                    />
                  </div>
                  <div className="form-group">
                    <textarea 
                      placeholder="Reviewer rationale and notes (min 5 characters)..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      style={{ width: '100%', height: '80px' }}
                    />
                  </div>
                  
                  {error && <div style={{ color: 'var(--block)', fontSize: '0.85rem', fontWeight: 'bold' }}>⚠ {error}</div>}

                  <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button onClick={() => handleReview('APPROVE_FOR_BOTH')} className="btn-primary" style={{ background: 'var(--safe)', flex: 1 }}>Approve Both</button>
                    <button onClick={() => handleReview('APPROVE_FOR_BENCHMARK')} className="btn-secondary" style={{ flex: 1 }}>Bench Only</button>
                    <button onClick={() => handleReview('APPROVE_FOR_RULE_CANDIDATE')} className="btn-secondary" style={{ flex: 1 }}>Rule Only</button>
                  </div>
                  <div className="button-group" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleReview('NEEDS_REVISION')} className="btn-secondary" style={{ borderColor: 'var(--escalate)', color: 'var(--escalate)', flex: 1 }}>Revision</button>
                    <button onClick={() => handleReview('REJECT')} className="btn-secondary" style={{ borderColor: 'var(--block)', color: 'var(--block)', flex: 1 }}>Reject</button>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Promotion Preview */}
            {selectedRecord.humanReviewDecision && (
              <SectionCard title="Promotion Preview" subtitle="Simulated downstream effect">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isApprovedForBenchmark(selectedRecord) && (() => {
                       const bench = promoteToBenchmarkCandidate(selectedRecord);
                       return (
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>BENCHMARK CANDIDATE: {bench.id}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            <div><strong>Category:</strong> {bench.expectedCategory}</div>
                            <div><strong>Vector:</strong> {bench.attackVector}</div>
                            <div style={{ marginTop: '0.25rem' }}><strong>Description:</strong> {bench.shortDescription}</div>
                          </div>
                        </div>
                       );
                    })()}

                    {isApprovedForRuleCandidate(selectedRecord) && (() => {
                      const rule = promoteToRuleCandidate(selectedRecord);
                      return (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--safe)', padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--safe)' }}>V2 CANDIDATE RULE: {rule.id}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            <div><strong>Pattern:</strong> <code style={{ color: 'var(--safe)' }}>{rule.suggestedPattern}</code></div>
                            <div><strong>Severity:</strong> {rule.severity}</div>
                            <div style={{ marginTop: '0.25rem' }}><strong>Rationale:</strong> {rule.rationale.substring(0, 80)}...</div>
                          </div>
                        </div>
                      );
                    })()}

                    <p style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic', margin: 0 }}>
                      ⚠ Preview only. This does not modify active rules, production datasets, or rule packs.
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
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: getColor(score) }}>{score}</div>
    </div>
  );
}
