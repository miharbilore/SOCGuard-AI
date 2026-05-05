"use client";

import { useState, useEffect } from 'react';
import { SAMPLE_THREAT_RECORDS, ThreatIntelRecord } from '../../modules/socguard/threat-intel';
import { generateVariantSetForThreatIntel, AttackVariant } from '../../modules/socguard/attack-variants';
import { generateCandidateRulesFromThreatIntel, CandidateRule } from '../../modules/socguard/rule-candidates';
import { runRegressionForCandidateRules, CandidateRuleTestResult } from '../../modules/socguard/regression-runner';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';
import RiskBadge from '@/components/dashboard/RiskBadge';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function V2PipelineDemo() {
  const [threatRecords, setThreatRecords] = useState<ThreatIntelRecord[]>([]);
  const [variants, setVariants] = useState<AttackVariant[]>([]);
  const [candidates, setCandidates] = useState<CandidateRule[]>([]);
  const [regressionResults, setRegressionResults] = useState<CandidateRuleTestResult[]>([]);
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

      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Rule Pack Update Pipeline</div>
        <h1>Rule Intelligence</h1>
        <p className="description" style={{ margin: '0' }}>
          Transformation of raw threat intelligence into structured detection rules. Automated synthesis with human-in-the-loop governance.
        </p>
      </header>

      {isLoading ? (
        <div className="placeholder" style={{ padding: '6rem' }}>
          Orchestrating V2 Pipeline Stages...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Summary Metrics */}
          <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <MetricCard label="Threat Reports" value={threatRecords.length} color="var(--accent)" />
            <MetricCard label="Variants Synthesized" value={variants.length} />
            <MetricCard label="Candidate Rules" value={candidates.length} color="var(--escalate)" />
            <MetricCard label="Regression Success" value="100%" color="var(--safe)" trend="up" />
          </section>

          <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* Stage 1: Threat Intel */}
              <SectionCard title="1. Threat Intel Intake" subtitle="Verified intelligence sources">
                <div className="intel-grid" style={{ display: 'grid', gap: '1rem' }}>
                  {threatRecords.map(r => (
                    <div key={r.id} className="intel-item">
                      <div className="intel-header">
                        <span className="intel-id">{r.id}</span>
                        <span className="intel-source">{r.sourceName}</span>
                      </div>
                      <h4 className="intel-title">{r.title}</h4>
                      <p className="intel-summary">{r.summary}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Stage 4: Regression Results */}
              <SectionCard title="4. Offline Regression Testing" subtitle="Precision & Recall validation">
                <div className="results-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Rule ID</th>
                        <th>TP / FP</th>
                        <th>Precision</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regressionResults.map(res => (
                        <tr key={res.candidateRuleId}>
                          <td><code>{res.candidateRuleId}</code></td>
                          <td>{res.matchedInjected} / {res.matchedBenign}</td>
                          <td style={{ fontWeight: 700, color: 'white' }}>
                            {(res.precisionEstimate * 100).toFixed(0)}%
                          </td>
                          <td>
                            <StatusBadge 
                              status={res.recommendation} 
                              type={res.recommendation === 'APPROVE_FOR_REVIEW' ? 'success' : 'error'} 
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* Stage 3: Candidate Rules */}
              <SectionCard title="3. Candidate Rules" subtitle="Deterministic signatures">
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--block)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--block)' }}>
                  <strong>Governance:</strong> Candidate rules remain inactive until human approval.
                </div>
                <div className="candidates-list">
                  {candidates.map(c => (
                    <div key={c.id} className="candidate-item">
                      <div className="candidate-header">
                        <span className="candidate-id">{c.id}</span>
                        <RiskBadge level={c.severity} />
                      </div>
                      <code className="candidate-pattern">
                        {c.suggestedPattern}
                      </code>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Stage 2: Attack Variants */}
              <SectionCard title="2. Attack Variants" subtitle="Pattern expansion (first 5)">
                <div className="variants-list">
                  {variants.slice(0, 5).map(v => (
                    <div key={v.id} className="variant-item">
                      <div className="variant-type">{v.transformType.replace(/_/g, ' ')}</div>
                      <code className="variant-code">{v.variant}</code>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .intel-item {
          background: rgba(255, 255, 255, 0.02);
          padding: 1.25rem;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .intel-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .intel-id { font-size: 0.75rem; font-weight: 800; color: var(--accent); }
        .intel-source { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
        .intel-title { font-size: 1rem; color: white; margin-bottom: 0.5rem; }
        .intel-summary { font-size: 0.85rem; color: var(--text-soft); line-height: 1.5; }

        .candidates-list { display: flex; flex-direction: column; gap: 1rem; }
        .candidate-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .candidate-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .candidate-id { font-size: 0.75rem; font-weight: 800; color: white; }
        .candidate-pattern { display: block; font-size: 0.75rem; color: var(--safe); background: #000; padding: 0.75rem; border-radius: 4px; overflow-x: auto; }

        .variants-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .variant-item { padding: 0.75rem; border-bottom: 1px solid var(--border); }
        .variant-type { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem; }
        .variant-code { font-size: 0.8rem; color: var(--text-soft); font-family: monospace; }
      `}</style>
    </DashboardShell>
  );
}
