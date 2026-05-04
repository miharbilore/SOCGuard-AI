"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_THREAT_RECORDS, ThreatIntelRecord } from '../../modules/socguard/threat-intel';
import { generateVariantSetForThreatIntel, AttackVariant } from '../../modules/socguard/attack-variants';
import { generateCandidateRulesFromThreatIntel, CandidateRule } from '../../modules/socguard/rule-candidates';
import { runRegressionForCandidateRules, CandidateRuleTestResult } from '../../modules/socguard/regression-runner';
import { createReviewItem, RuleReviewItem } from '../../modules/socguard/review-queue';

export default function V2PipelineDemo() {
  const [threatRecords, setThreatRecords] = useState<ThreatIntelRecord[]>([]);
  const [variants, setVariants] = useState<AttackVariant[]>([]);
  const [candidates, setCandidates] = useState<CandidateRule[]>([]);
  const [regressionResults, setRegressionResults] = useState<CandidateRuleTestResult[]>([]);
  const [reviewItems, setReviewItems] = useState<RuleReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate the pipeline processing
    setTimeout(() => {
      // 1. Intake
      const records = SAMPLE_THREAT_RECORDS;
      setThreatRecords(records);

      // 2. Variant Generation
      const allVariants: AttackVariant[] = [];
      records.forEach(r => allVariants.push(...generateVariantSetForThreatIntel(r)));
      setVariants(allVariants);

      // 3. Candidate Rule Generation
      const allCandidates: CandidateRule[] = [];
      records.forEach(r => allCandidates.push(...generateCandidateRulesFromThreatIntel(r)));
      setCandidates(allCandidates);

      // 4. Regression Testing
      const results = runRegressionForCandidateRules(allCandidates);
      setRegressionResults(results);

      // 5. Review Queue (Items remain PENDING by default in the main pipeline)
      // MANDATORY: Every item in the pipeline starts as PENDING to enforce human-in-the-loop governance.
      const items = allCandidates.map((c, i) => createReviewItem(c, results[i]));
      setReviewItems(items);

      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <main className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link href="/" className="nav-link" style={{ marginBottom: 0 }}>← Home</Link>
          <Link href="/evaluation" className="nav-link" style={{ marginBottom: 0 }}>Evaluation Dashboard →</Link>
        </div>
        <h1>SOCGuard AI V2</h1>
        <div className="subtitle">Controlled Rule Pack Pipeline</div>
        <p className="description" style={{ maxWidth: '800px', margin: '1rem auto' }}>
          This page demonstrates the SOCGuard AI V2 update pipeline. It shows how raw threat intelligence 
          is transformed into structured detection rules through a multi-stage, human-governed process.
        </p>
        <div style={{ 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid #ffc107', 
          color: '#ffc107', 
          padding: '0.75rem', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <strong>Governance Notice:</strong> This V2 pipeline does not mutate active detection rules. 
          <strong> No rule is approved automatically.</strong> Every candidate rule requires explicit 
          human analyst action before it can enter a draft rule pack.
        </div>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="placeholder">Orchestrating V2 Pipeline Stages...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          
          {/* Stage 1: Threat Intel */}
          <section className="card">
            <h2 className="section-title">1. Threat Intel Intake</h2>
            <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {threatRecords.map(r => (
                <div key={r.id} className="finding-item" style={{ border: '1px solid var(--border)', padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>{r.id}: {r.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Source: {r.sourceName} ({r.sourceType})</div>
                  <p style={{ fontSize: '0.9rem' }}>{r.summary}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    {r.attackCategories.map(cat => (
                      <span key={cat} className="badge badge-MEDIUM" style={{ fontSize: '0.7rem', marginRight: '0.5rem' }}>{cat}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stage 2: Attack Variants */}
          <section className="card">
            <h2 className="section-title">2. Attack Variant Generation (Sample)</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#000', padding: '1rem', borderRadius: '4px' }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '0.5rem' }}>Type</th>
                    <th style={{ padding: '0.5rem' }}>Variant</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.slice(0, 15).map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--accent)' }}>{v.transformType}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{v.variant}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} style={{ padding: '0.5rem', textAlign: 'center', opacity: 0.5 }}>... total {variants.length} variants generated offline ...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Stage 3: Candidate Rules */}
          <section className="card">
            <h2 className="section-title">3. Candidate Rule Generation</h2>
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
              Candidate rules are generated based on threat intel but are <strong>not active</strong>.
            </div>
            <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {candidates.map(c => (
                <div key={c.id} className="finding-item" style={{ border: '1px solid var(--border)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{c.id}</span>
                    <span className="badge badge-HIGH" style={{ fontSize: '0.7rem' }}>{c.severity}</span>
                  </div>
                  <code style={{ display: 'block', background: '#000', padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#0f0' }}>
                    {c.suggestedPattern}
                  </code>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Category: {c.category}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>{c.rationale}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Stage 4: Regression Results */}
          <section className="card">
            <h2 className="section-title">4. Offline Regression Testing</h2>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              {regressionResults.map(res => (
                <div key={res.candidateRuleId} className="finding-item" style={{ 
                  padding: '1rem',
                  borderLeft: `4px solid ${res.recommendation === 'APPROVE_FOR_REVIEW' ? '#28a745' : '#dc3545'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Rule ID: {res.candidateRuleId}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        TP: {res.matchedInjected} | FP: {res.matchedBenign} | Precision: {(res.precisionEstimate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`badge badge-${res.recommendation === 'APPROVE_FOR_REVIEW' ? 'SAFE' : 'BLOCK'}`} style={{ marginBottom: '0.25rem' }}>
                        {res.recommendation}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{res.reasons[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stage 5: Review Queue */}
          <section className="card">
            <h2 className="section-title">5. Human Review Queue (Mandatory)</h2>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '4px' }}>
              {reviewItems.slice(0, 3).map(item => (
                <div key={item.id} style={{ 
                  padding: '1.5rem', 
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.id}</div>
                    <div style={{ fontSize: '0.85rem' }}>Pattern: {item.candidateRule.suggestedPattern}</div>
                    <div className="badge badge-PENDING" style={{ marginTop: '0.5rem' }}>{item.reviewerDecision}</div>
                  </div>
                  <div className="button-group" style={{ margin: 0 }}>
                    <button className="btn-primary" disabled style={{ opacity: 0.3 }}>Approve</button>
                    <button className="btn-secondary" disabled style={{ opacity: 0.3 }}>Reject</button>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.5, fontSize: '0.85rem' }}>
                All rules in the pipeline remain PENDING. Human reviewer action is required.
              </div>
            </div>
          </section>

          {/* Stage 6: Draft Rule Pack */}
          <section className="card" style={{ borderColor: 'var(--accent)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <h2 className="section-title">6. Draft Rule Pack Generation</h2>
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              opacity: 0.8
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Draft Rule Pack Generated</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Rule pack construction is blocked because no reviewer decisions have been made.
              </p>
            </div>
          </section>

          {/* Optional Simulation Notice */}
          <section className="card" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid #444' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Simulated Approval Preview</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>
              Optional simulated approval preview is intentionally disabled in this build to avoid 
              implying automatic approval in the update pipeline. Real rule packs require 
              authenticated human analyst authorization.
            </p>
          </section>

        </div>
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
        SOCGuard AI V2 Research Pipeline &copy; 2026 | academic-poc-v2
      </footer>
    </main>
  );
}
