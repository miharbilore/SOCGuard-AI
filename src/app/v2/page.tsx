"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_THREAT_RECORDS, ThreatIntelRecord } from '../../modules/socguard/threat-intel';
import { generateVariantSetForThreatIntel, AttackVariant } from '../../modules/socguard/attack-variants';
import { generateCandidateRulesFromThreatIntel, CandidateRule } from '../../modules/socguard/rule-candidates';
import { runRegressionForCandidateRules, CandidateRuleTestResult } from '../../modules/socguard/regression-runner';
import { createReviewItem, RuleReviewItem, approveReviewItem } from '../../modules/socguard/review-queue';
import { buildDraftRulePackFromApprovedItems } from '../../modules/socguard/rule-pack/rule-pack-builder';
import { RULE_PACK_V1 } from '../../modules/socguard/rule-pack/rule-pack-v1';
import { RulePack } from '../../modules/socguard/rule-pack/rule-pack-types';

export default function V2PipelineDemo() {
  const [threatRecords, setThreatRecords] = useState<ThreatIntelRecord[]>([]);
  const [variants, setVariants] = useState<AttackVariant[]>([]);
  const [candidates, setCandidates] = useState<CandidateRule[]>([]);
  const [regressionResults, setRegressionResults] = useState<CandidateRuleTestResult[]>([]);
  const [reviewItems, setReviewItems] = useState<RuleReviewItem[]>([]);
  const [draftPack, setDraftPack] = useState<RulePack | null>(null);
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

      // 5. Review Queue (Items start as PENDING)
      const items = allCandidates.map((c, i) => createReviewItem(c, results[i]));
      
      // 6. Simulated Human Decisions (FOR DEMO ONLY)
      // In a real system, this state change happens via human interaction
      const demoDecisions = items.map(item => {
        if (item.regressionResult.matchedBenign === 0 && item.regressionResult.matchedInjected > 0) {
          // Simulated approval for rules with perfect regression metrics
          return approveReviewItem(
            item, 
            'local-demo-reviewer', 
            'Simulated Approval: High precision detected in regression testing with zero false positives.'
          );
        }
        return item; // Remains PENDING
      });
      setReviewItems(demoDecisions);

      // 7. Build Draft Pack from approved items
      const newPack = buildDraftRulePackFromApprovedItems({
        baseRulePack: RULE_PACK_V1,
        approvedReviewItems: demoDecisions,
        newVersion: '1.1.0',
        changelog: 'Automated V2 pipeline build demo with simulated human review.'
      });
      setDraftPack(newPack);

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
          <strong>Disclaimer:</strong> This V2 workflow does not mutate active detection rules. 
          It demonstrates a controlled offline update pipeline. <strong>This demo does not auto-approve rules; 
          approved examples are explicitly marked as simulated reviewer decisions.</strong>
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
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  borderLeft: `4px solid ${res.recommendation === 'APPROVE_FOR_REVIEW' ? '#28a745' : '#dc3545'}`
                }}>
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
              ))}
            </div>
          </section>

          {/* Stage 5: Review Queue */}
          <section className="card">
            <h2 className="section-title">5. Human Review Queue</h2>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '4px' }}>
              {reviewItems.slice(0, 5).map(item => (
                <div key={item.id} style={{ 
                  padding: '1.5rem', 
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.id} (Ref: {item.candidateRule.id})</div>
                    <div className={`badge badge-${item.reviewerDecision === 'APPROVED' ? 'SAFE' : 'PENDING'}`}>
                      {item.reviewerDecision}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Suggested Pattern:</strong> <code style={{ color: '#0f0' }}>{item.candidateRule.suggestedPattern}</code>
                  </div>
                  
                  {item.reviewedBy && (
                    <div style={{ 
                      background: 'rgba(0, 255, 157, 0.05)', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      borderLeft: '3px solid var(--safe)',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        Simulated Decision by: <span style={{ color: 'var(--accent)' }}>{item.reviewedBy}</span>
                      </div>
                      <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.9 }}>"{item.reviewerNotes}"</p>
                    </div>
                  )}

                  {item.reviewerDecision === 'PENDING' && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Await human analyst review... (Buttons disabled in demo flow)
                    </div>
                  )}
                  
                  <div className="button-group" style={{ margin: 0 }}>
                    <button className="btn-primary" disabled style={{ opacity: 0.3 }}>Approve</button>
                    <button className="btn-secondary" disabled style={{ opacity: 0.3 }}>Reject</button>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.5, fontSize: '0.85rem' }}>
                + {reviewItems.length - 5} more items in queue
              </div>
            </div>
          </section>

          {/* Stage 6: Draft Rule Pack */}
          <section className="card" style={{ borderColor: 'var(--accent)' }}>
            <h2 className="section-title">6. Draft Rule Pack Preview</h2>
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              This draft pack contains approved rules. <strong>Note: All new rules are initialized as "disabled" 
              and "DRAFT" status for safety.</strong>
            </div>
            {draftPack && (
              <div style={{ background: '#000', padding: '1.5rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>// SOCGuard Rule Pack v{draftPack.version} (DRAFT)</div>
                <div style={{ color: '#888' }}>
                  ID: {draftPack.id}<br />
                  Created: {draftPack.createdAt}<br />
                  Rules: {draftPack.rules.length}<br />
                  Status: {draftPack.status}
                </div>
                <div style={{ marginTop: '1rem', color: '#fff' }}>
                  {draftPack.rules.filter(r => r.reviewStatus === 'DRAFT').slice(0, 3).map(r => (
                    <div key={r.id} style={{ marginBottom: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #444' }}>
                      <div style={{ color: 'var(--accent)' }}>{r.id}: {r.pattern}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        Enabled: {r.enabled ? 'true' : 'false'} | Status: {r.reviewStatus} | Source: {r.source}
                      </div>
                    </div>
                  ))}
                  <div style={{ opacity: 0.5 }}>... total {draftPack.rules.length} rules in package ...</div>
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button className="btn-primary" disabled>Publish Versioned Pack (Locked in Demo)</button>
            </div>
          </section>

        </div>
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
        SOCGuard AI V2 Research Pipeline &copy; 2026 | academic-poc-v2
      </footer>
    </main>
  );
}
