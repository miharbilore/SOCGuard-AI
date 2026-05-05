"use client";

import { useEffect, useState } from 'react';
import { analyzeSampleDataset } from '../../modules/socguard/demo';
import { DatasetEvaluation } from '../../modules/socguard/types';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';

export default function EvaluationPage() {
  const [evaluation, setEvaluation] = useState<DatasetEvaluation | null>(null);

  useEffect(() => {
    const results = analyzeSampleDataset();
    setEvaluation(results);
  }, []);

  if (!evaluation) {
    return <DashboardShell><div className="placeholder">Running academic benchmark pipeline...</div></DashboardShell>;
  }

  const { metrics, perDifficulty, perAttackVector, perCategory, results } = evaluation;

  const toPct = (val: number) => (val * 100).toFixed(1) + '%';

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Academic Benchmark Results</div>
        <h1>Evaluation Dashboard</h1>
        <p className="description" style={{ margin: '0' }}>
          Deterministic benchmark on synthetic SIEM prompt injection dataset. Results represent performance across multiple threat vectors.
        </p>
      </header>

      {/* Primary Metrics */}
      <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard label="Accuracy" value={toPct(metrics.accuracy)} trend="neutral" />
        <MetricCard label="Precision" value={toPct(metrics.precision)} color="var(--safe)" trend="up" />
        <MetricCard label="Recall (Sensitivity)" value={toPct(metrics.recall)} color="var(--escalate)" trend="down" />
        <MetricCard label="F1 Score" value={toPct(metrics.f1Score)} color="var(--block)" trend="neutral" />
      </section>

      <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left: Confusion Matrix */}
        <SectionCard title="Confusion Matrix" subtitle="Type I and Type II Error analysis">
          <div className="results-table-container">
            <table className="confusion-matrix">
              <thead>
                <tr>
                  <th></th>
                  <th>Predicted: BENIGN</th>
                  <th>Predicted: INJECTED</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Actual: BENIGN</th>
                  <td className="matrix-cell safe-cell">
                    <strong>{metrics.trueNegatives}</strong>
                    <span>True Negatives</span>
                  </td>
                  <td className="matrix-cell error-cell">
                    <strong>{metrics.falsePositives}</strong>
                    <span>False Positives (Type I)</span>
                  </td>
                </tr>
                <tr>
                  <th>Actual: INJECTED</th>
                  <td className="matrix-cell error-cell">
                    <strong>{metrics.falseNegatives}</strong>
                    <span>False Negatives (Type II)</span>
                  </td>
                  <td className="matrix-cell threat-cell">
                    <strong>{metrics.truePositives}</strong>
                    <span>True Positives</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Right: Difficulty Breakdown */}
        <SectionCard title="Analysis by Difficulty" subtitle="Performance across complexity levels">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Inj (TP/FN)</th>
                  <th>Det Rate</th>
                </tr>
              </thead>
              <tbody>
                {perDifficulty.map(d => (
                  <tr key={d.difficulty}>
                    <td><strong>{d.difficulty}</strong></td>
                    <td>{d.truePositives} / {d.falseNegatives}</td>
                    <td style={{ color: d.detectionRateOnInjected > 0.8 ? 'var(--safe)' : 'var(--escalate)', fontWeight: 'bold' }}>
                      {toPct(d.detectionRateOnInjected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-content-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Category Coverage */}
        <SectionCard title="Category Coverage" subtitle="Recall by threat category">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Exp / Det</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {perCategory.map(c => (
                  <tr key={c.category}>
                    <td><code>{c.category}</code></td>
                    <td>{c.expectedCount} / {c.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ 
                            width: `${c.coveragePercentage}%`, 
                            background: c.coveragePercentage >= 100 ? 'var(--safe)' : 'var(--escalate)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.coveragePercentage.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Attack Vector */}
        <SectionCard title="Per Attack Vector" subtitle="Recall by specific vector">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Attack Vector</th>
                  <th>Detected</th>
                  <th>Recall</th>
                </tr>
              </thead>
              <tbody>
                {perAttackVector.map(v => (
                  <tr key={v.attackVector}>
                    <td><code>{v.attackVector}</code></td>
                    <td>{v.detected} / {v.total}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ 
                            width: toPct(v.detectionRate), 
                            background: v.detectionRate > 0.8 ? 'var(--safe)' : 'var(--escalate)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{toPct(v.detectionRate)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Detailed Log */}
      <SectionCard title="Detailed Analysis Log" subtitle="Sample-by-sample decision traceability">
        <div className="results-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Ground Truth</th>
                <th>Decision</th>
                <th>Score</th>
                <th>Expected Category</th>
                <th>Triggered Rules</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => {
                const gt = res.groundTruth;
                const triggeredRules = Array.from(new Set(res.findings.map(f => f.ruleId))).join(', ');
                
                return (
                  <tr key={res.id}>
                    <td><code>{res.inputLog.id}</code></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: gt?.label === 'INJECTED' ? 'var(--block)' : 'var(--safe)', fontWeight: 700, fontSize: '0.75rem' }}>
                          {gt?.label}
                        </span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                          {gt?.difficulty} | {gt?.attackVector}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${res.policyDecision === 'SAFE' ? 'success' : res.policyDecision === 'BLOCK' ? 'error' : 'warning'}`}>
                        {res.policyDecision}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: res.riskScore.score >= 51 ? 'var(--block)' : 'white' }}>
                        {res.riskScore.score}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>
                        {gt?.expectedCategory || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {triggeredRules || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <style jsx>{`
        .confusion-matrix {
          width: 100%;
          border-collapse: separate;
          border-spacing: 12px;
        }
        .confusion-matrix th {
          background: transparent;
          text-align: center;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .matrix-cell {
          padding: 1.5rem;
          text-align: center;
          border-radius: 8px;
          border: 1px solid var(--border);
          width: 50%;
          background: white;
        }
        .matrix-cell strong {
          display: block;
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        .matrix-cell span {
          font-size: 0.65rem;
          text-transform: uppercase;
          opacity: 0.7;
          font-weight: 700;
        }
        .safe-cell { background: rgba(5, 150, 105, 0.05); border-color: rgba(5, 150, 105, 0.1); color: var(--safe); }
        .threat-cell { background: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.1); color: var(--block); }
        .error-cell { background: rgba(217, 119, 6, 0.05); border-color: rgba(217, 119, 6, 0.1); color: var(--escalate); }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
          overflow: hidden;
          min-width: 60px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .status-badge {
          display: inline-flex;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
        }
        .status-success { background: rgba(16, 185, 129, 0.1); color: var(--safe); border-color: rgba(16, 185, 129, 0.2); }
        .status-warning { background: rgba(245, 158, 11, 0.1); color: var(--escalate); border-color: rgba(245, 158, 11, 0.2); }
        .status-error { background: rgba(239, 68, 68, 0.1); color: var(--block); border-color: rgba(239, 68, 68, 0.2); }
      `}</style>
    </DashboardShell>
  );
}
