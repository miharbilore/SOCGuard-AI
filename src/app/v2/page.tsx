"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_THREAT_RECORDS, ThreatIntelRecord } from '../../modules/socguard/threat-intel';
import { generateVariantSetForThreatIntel, AttackVariant } from '../../modules/socguard/attack-variants';
import { generateCandidateRulesFromThreatIntel, CandidateRule } from '../../modules/socguard/rule-candidates';
import { runRegressionForCandidateRules, CandidateRuleTestResult } from '../../modules/socguard/regression-runner';
import { createReviewItem, RuleReviewItem } from '../../modules/socguard/review-queue';
import DashboardShell from '@/components/dashboard/DashboardShell';

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

      // 5. Review Queue
      const items = allCandidates.map((c, i) => createReviewItem(c, results[i]));
      setReviewItems(items);

      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Rule Pack Update Pipeline</div>
        <h1>Rule Intelligence</h1>
        <p className="description">
          Transformation of raw threat intelligence into structured detection rules.
        </p>
        <div style={{ 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid #ffc107', 
          color: '#ffc107', 
          padding: '0.75rem', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginTop: '1rem'
        }}>
          <strong>Governance Notice:</strong> Every candidate rule requires explicit human analyst action.
        </div>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="placeholder">Orchestrating V2 Pipeline Stages...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stage 1: Threat Intel */}
          <section className="card">
            <h2 className="section-title">1. Threat Intel Intake</h2>
            <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {threatRecords.map(r => (
                <div key={r.id} className="finding-item" style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>{r.id}: {r.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Source: {r.sourceName}</div>
                  <p style={{ fontSize: '0.9rem' }}>{r.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stage 2: Attack Variants */}
          <section className="card">
            <h2 className="section-title">2. Attack Variant Generation</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#000', padding: '1rem', borderRadius: '4px' }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '0.5rem' }}>Type</th>
                    <th style={{ padding: '0.5rem' }}>Variant</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.slice(0, 10).map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--accent)' }}>{v.transformType}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{v.variant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Stage 3: Candidate Rules */}
          <section className="card">
            <h2 className="section-title">3. Candidate Rule Generation</h2>
            <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {candidates.map(c => (
                <div key={c.id} className="finding-item" style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{c.id}</span>
                    <span className="badge badge-HIGH" style={{ fontSize: '0.7rem' }}>{c.severity}</span>
                  </div>
                  <code style={{ display: 'block', background: '#000', padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#0f0' }}>
                    {c.suggestedPattern}
                  </code>
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
                  borderLeft: `4px solid ${res.recommendation === 'APPROVE_FOR_REVIEW' ? '#28a745' : '#dc3545'}`,
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Rule ID: {res.candidateRuleId}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        TP: {res.matchedInjected} | FP: {res.matchedBenign} | Precision: {(res.precisionEstimate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className={`badge badge-${res.recommendation === 'APPROVE_FOR_REVIEW' ? 'SAFE' : 'BLOCK'}`}>
                      {res.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
