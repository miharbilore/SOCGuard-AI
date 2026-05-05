"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import DashboardShell from '@/components/dashboard/DashboardShell';

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Research & Development (V3)</div>
        <h1>Adversarial Agent Lab</h1>
        <p className="description">
          A secure sandbox for synthesizing attack patterns and evaluating deterministic defense proposals.
        </p>
      </header>

      {/* Overview Section */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Lab Overview</h2>
        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="info-item">
            <h4>Red Team</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Synthesizes sanitized, non-operational attack candidates.</p>
          </div>
          <div className="info-item">
            <h4>Blue Team</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Proposes deterministic detection signatures.</p>
          </div>
          <div className="info-item">
            <h4>Judge Agent</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Provides advisory scores and alignment analysis.</p>
          </div>
          <div className="info-item">
            <h4>Human Review</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Final authority for promotion and validation.</p>
          </div>
        </div>
      </section>

      {/* Main Lab Records Section */}
      <div className="main-grid" style={{ gridTemplateColumns: selectedRecordId ? '1.5fr 1fr' : '1fr' }}>
        <div className="card">
          <h2 className="section-title">Research Records ({records.length})</h2>
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Attack Type</th>
                  <th>Safety</th>
                  <th>Judge Rec</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} 
                      onClick={() => setSelectedRecordId(record.id)}
                      style={{ cursor: 'pointer', background: selectedRecordId === record.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{record.id}</td>
                    <td><span style={{ fontSize: '0.75rem' }}>{record.redTeamCandidate.attackType}</span></td>
                    <td>
                      <span className={`badge badge-${record.redTeamCandidate.safetyStatus === 'SANITIZED' ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.6rem' }}>
                        {record.redTeamCandidate.safetyStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: record.judgeRecommendation?.recommendation === 'RECOMMEND_APPROVE_FOR_REVIEW' ? 'var(--safe)' : 'var(--escalate)' 
                      }}>
                        {record.judgeRecommendation?.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {record.humanReviewDecision ? (
                        <span className={`badge`} style={{ fontSize: '0.6rem', background: 'var(--human)', color: 'white', border: 'none' }}>
                          {record.humanReviewDecision.decision.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="badge badge-ESCALATE" style={{ fontSize: '0.6rem' }}>PENDING</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details and Review Panel */}
        {selectedRecord && (
          <div className="card">
            <h2 className="section-title">Record Details: {selectedRecord.id}</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <h4>Sanitized Prompt</h4>
                <code style={{ display: 'block', padding: '1rem', background: '#000', borderRadius: '4px', fontSize: '0.8rem', color: '#0f0', marginBottom: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {selectedRecord.redTeamCandidate.sanitizedPrompt}
                </code>
              </div>

              <div className="info-item">
                <h4>Blue Proposal</h4>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                    Pattern: <code style={{ color: 'var(--safe)' }}>{selectedRecord.blueTeamProposal?.proposedRulePattern}</code>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rationale: {selectedRecord.blueTeamProposal?.rationale}</div>
                </div>
              </div>

              <div className="info-item">
                <h4>Judge Scores (Advisory)</h4>
                <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div className="metric-card" style={{ padding: '0.5rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem' }}>{selectedRecord.judgeRecommendation?.realismScore}</div>
                    <div className="metric-label">Realism</div>
                  </div>
                  <div className="metric-card" style={{ padding: '0.5rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem' }}>{selectedRecord.judgeRecommendation?.coverageScore}</div>
                    <div className="metric-label">Coverage</div>
                  </div>
                  <div className="metric-card" style={{ padding: '0.5rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem', color: (selectedRecord.judgeRecommendation?.falsePositiveRiskScore || 0) > 70 ? 'var(--block)' : 'var(--safe)' }}>
                      {selectedRecord.judgeRecommendation?.falsePositiveRiskScore}
                    </div>
                    <div className="metric-label">FP Risk</div>
                  </div>
                  <div className="metric-card" style={{ padding: '0.5rem' }}>
                    <div className="metric-value" style={{ fontSize: '1.2rem' }}>{selectedRecord.judgeRecommendation?.safetyScore}</div>
                    <div className="metric-label">Safety</div>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="info-item">
                <h4>Audit Trail</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.75rem', opacity: 0.8, background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  {selectedRecord.auditTrail.map((entry, i) => (
                    <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}>
                      <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                        [{entry.timestamp.split('T')[1].split('.')[0]}] {entry.actor}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{entry.action}</div>
                      <div style={{ paddingLeft: '0.5rem', marginTop: '0.25rem', borderLeft: '1px solid var(--border)' }}>{entry.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Review Controls */}
              <div className="info-item" style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h4 style={{ color: 'var(--human)' }}>Human Review Decision</h4>
                
                {selectedRecord.humanReviewDecision ? (
                  <div className="guidance" style={{ background: 'rgba(236, 72, 153, 0.1)', borderColor: 'var(--human)', color: 'var(--text)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--human)', marginBottom: '0.5rem' }}>
                      DECISION: {selectedRecord.humanReviewDecision.decision.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}><strong>Reviewer:</strong> {selectedRecord.humanReviewDecision.reviewerId}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong>Notes:</strong> {selectedRecord.humanReviewDecision.reviewerNotes}
                    </div>
                  </div>
                ) : (
                  <div className="review-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="Reviewer ID" 
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}
                    />
                    <textarea 
                      placeholder="Review rationale..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      style={{ height: '80px', marginBottom: 0, fontSize: '0.9rem' }}
                    />
                    
                    {error && <div style={{ color: 'var(--block)', fontSize: '0.85rem' }}>⚠ {error}</div>}

                    <div className="button-group" style={{ gap: '0.5rem' }}>
                      <button onClick={() => handleDecision(selectedRecord.id, 'APPROVE_FOR_BOTH')} className="btn-primary" style={{ background: 'var(--safe)', fontSize: '0.75rem', flex: 1 }}>Approve Both</button>
                      <button onClick={() => handleDecision(selectedRecord.id, 'REJECT')} className="btn-secondary" style={{ borderColor: 'var(--block)', color: 'var(--block)', fontSize: '0.75rem', flex: 1 }}>Reject</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="card" style={{ marginTop: '3rem', borderLeft: '4px solid var(--escalate)', background: 'rgba(245, 158, 11, 0.05)' }}>
        <h3 style={{ color: 'var(--escalate)', marginBottom: '1rem' }}>⚠ Safety & Governance</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          All attack patterns are sanitized. Human review is mandatory for all record promotions. 
          Judge recommendations are ADVISORY.
        </p>
      </section>
    </DashboardShell>
  );
}
