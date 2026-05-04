"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  createDefaultAdversarialLabRecords, 
  applyHumanReviewDecision,
  AdversarialLabRecord,
  HumanDecisionType
} from '@/modules/socguard/adversarial-lab';

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
      setReviewerNotes(''); // Reset notes for next review
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <main className="container">
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/evaluation" className="nav-link">Evaluation</Link>
        <Link href="/v2" className="nav-link">V2 Pipeline</Link>
        <Link href="/adversarial-lab" className="nav-link" style={{ borderBottom: '2px solid var(--accent)' }}>V3 Adversarial Lab</Link>
      </nav>

      <header>
        <div className="subtitle">Research & Development (V3)</div>
        <h1>Adversarial Agent Lab</h1>
        <p className="description">
          A secure sandbox for synthesizing attack patterns and evaluating deterministic defense proposals.
          This lab ensures that all research is audited by human analysts before promotion.
        </p>
      </header>

      {/* Overview Section */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Lab Overview</h2>
        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="info-item">
            <h4>Red Team</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Synthesizes sanitized, non-operational attack candidates to test boundary conditions.</p>
          </div>
          <div className="info-item">
            <h4>Blue Team</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Proposes deterministic detection signatures (regex/keywords) for research candidates.</p>
          </div>
          <div className="info-item">
            <h4>Judge Agent</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Provides advisory scores and alignment analysis to speed up human auditing.</p>
          </div>
          <div className="info-item">
            <h4>Human Review</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Final authority. Approves records for benchmarks or production rule candidates.</p>
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
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>Reviewed at: {selectedRecord.humanReviewDecision.reviewedAt}</div>
                  </div>
                ) : (
                  <div className="review-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        placeholder="Reviewer ID (e.g. ANALYST-01)" 
                        value={reviewerId}
                        onChange={(e) => setReviewerId(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem', borderRadius: '4px', flex: 1, fontSize: '0.9rem' }}
                      />
                    </div>
                    <textarea 
                      placeholder="Enter review rationale (min 5 chars)..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      style={{ height: '100px', marginBottom: 0, fontSize: '0.9rem' }}
                    />
                    
                    {error && <div style={{ color: 'var(--block)', fontSize: '0.85rem', fontWeight: '600' }}>⚠ {error}</div>}

                    <div className="button-group" style={{ gap: '0.5rem' }}>
                      <button onClick={() => handleDecision(selectedRecord.id, 'APPROVE_FOR_BOTH')} className="btn-primary" style={{ background: 'var(--safe)', fontSize: '0.75rem', padding: '0.6rem 0.75rem', flex: 1 }}>Approve Both</button>
                      <button onClick={() => handleDecision(selectedRecord.id, 'APPROVE_FOR_BENCHMARK')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.6rem 0.75rem' }}>Bench Only</button>
                      <button onClick={() => handleDecision(selectedRecord.id, 'APPROVE_FOR_RULE_CANDIDATE')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.6rem 0.75rem' }}>Rule Only</button>
                    </div>
                    <div className="button-group" style={{ gap: '0.5rem' }}>
                      <button onClick={() => handleDecision(selectedRecord.id, 'NEEDS_REVISION')} className="btn-secondary" style={{ borderColor: 'var(--escalate)', color: 'var(--escalate)', fontSize: '0.75rem', padding: '0.6rem 0.75rem', flex: 1 }}>Request Revision</button>
                      <button onClick={() => handleDecision(selectedRecord.id, 'REJECT')} className="btn-secondary" style={{ borderColor: 'var(--block)', color: 'var(--block)', fontSize: '0.75rem', padding: '0.6rem 0.75rem', flex: 1 }}>Reject Record</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Disclaimer */}
      <section className="card" style={{ marginTop: '3rem', borderLeft: '4px solid var(--escalate)', background: 'rgba(245, 158, 11, 0.05)' }}>
        <h3 style={{ color: 'var(--escalate)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠</span> Safety & Governance Disclaimer
        </h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ marginBottom: '0.5rem' }}>• Generated prompts are <strong>sanitized</strong>; they contain no operational exploit code or live payloads.</p>
            <p style={{ marginBottom: '0.5rem' }}>• Judge recommendations are <strong>advisory only</strong>. The Judge lacks semantic context and serves only as a quality gate.</p>
            <p>• <strong>Human review is mandatory</strong>. No record can be promoted to benchmarks or rules without analyst authorization.</p>
          </div>
          <div>
            <p style={{ marginBottom: '0.5rem' }}>• This lab is a <strong>deterministic mockup</strong> designed for research architecture validation. No live LLM components are used.</p>
            <p>• <strong>Decisions do not activate rules</strong>. Promotion is a separate lifecycle event that occurs in the V2 Policy Engine.</p>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
        SOCGuard AI V3 Adversarial Agent Lab &copy; 2026 | research-sandbox-v3
      </footer>
    </main>
  );
}
