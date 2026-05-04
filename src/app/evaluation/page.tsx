"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyzeSampleDataset } from '../../modules/socguard/demo';
import { DatasetEvaluation } from '../../modules/socguard/types';

export default function EvaluationPage() {
  const [evaluation, setEvaluation] = useState<DatasetEvaluation | null>(null);

  useEffect(() => {
    const results = analyzeSampleDataset();
    setEvaluation(results);
  }, []);

  if (!evaluation) {
    return <div className="container placeholder">Running academic benchmark pipeline...</div>;
  }

  const { metrics, perDifficulty, perAttackVector, perCategory, results } = evaluation;

  const toPct = (val: number) => (val * 100).toFixed(1) + '%';

  return (
    <main className="container">
      <header>
        <Link href="/" className="nav-link">← Back to Demo</Link>
        <div className="subtitle">Academic Benchmark Results</div>
        <h1>SOCGuard AI Evaluation</h1>
        <p className="description">
          Deterministic benchmark on synthetic SIEM prompt injection dataset. 
          Metrics are calculated on a small synthetic dataset and should not be interpreted as production-level performance.
        </p>
      </header>

      {/* Primary Metrics */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Core Performance Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{toPct(metrics.accuracy)}</div>
            <div className="metric-label">Accuracy</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--safe)' }}>{toPct(metrics.precision)}</div>
            <div className="metric-label">Precision</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--escalate)' }}>{toPct(metrics.recall)}</div>
            <div className="metric-label">Recall (Sensitivity)</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--block)' }}>{toPct(metrics.f1Score)}</div>
            <div className="metric-label">F1 Score</div>
          </div>
        </div>
      </section>

      {/* Confusion Matrix */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Confusion Matrix</h2>
        <div className="results-table-container">
          <table className="confusion-matrix">
            <thead>
              <tr>
                <th></th>
                <th>Predicted: BENIGN (Safe)</th>
                <th>Predicted: INJECTED (Suspect)</th>
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
                  <span>False Positives</span>
                </td>
              </tr>
              <tr>
                <th>Actual: INJECTED</th>
                <td className="matrix-cell error-cell">
                  <strong>{metrics.falseNegatives}</strong>
                  <span>False Negatives</span>
                </td>
                <td className="matrix-cell threat-cell">
                  <strong>{metrics.truePositives}</strong>
                  <span>True Positives</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Difficulty Breakdown */}
        <section className="card">
          <h2 className="section-title">Per Difficulty</h2>
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Total</th>
                  <th>Detected</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {perDifficulty.map(d => (
                  <tr key={d.difficulty}>
                    <td><strong>{d.difficulty}</strong></td>
                    <td>{d.total}</td>
                    <td>{d.detected}</td>
                    <td>{toPct(d.detectionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Category Frequency */}
        <section className="card">
          <h2 className="section-title">Detection Frequency</h2>
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Findings</th>
                </tr>
              </thead>
              <tbody>
                {perCategory.map(c => (
                  <tr key={c.category}>
                    <td><code>{c.category}</code></td>
                    <td>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Attack Vector Breakdown */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Per Attack Vector</h2>
        <div className="results-table-container">
          <table>
            <thead>
              <tr>
                <th>Attack Vector</th>
                <th>Total Samples</th>
                <th>Detected</th>
                <th>Missed</th>
                <th>Detection Rate</th>
              </tr>
            </thead>
            <tbody>
              {perAttackVector.map(v => (
                <tr key={v.attackVector}>
                  <td><code>{v.attackVector}</code></td>
                  <td>{v.total}</td>
                  <td>{v.detected}</td>
                  <td>{v.missed}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--card-bg)', borderRadius: '4px' }}>
                        <div style={{ 
                          height: '100%', 
                          width: toPct(v.detectionRate), 
                          background: v.detectionRate > 0.8 ? 'var(--safe)' : 'var(--escalate)',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span>{toPct(v.detectionRate)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed Results */}
      <section className="card">
        <h2 className="section-title">Detailed Analysis Log</h2>
        <div className="results-table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Actual Label</th>
                <th>Policy Decision</th>
                <th>Risk Score</th>
                <th>Triggered Rules</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => {
                const isActuallyInjected = res.inputLog.id.startsWith('i');
                const triggeredRules = Array.from(new Set(res.findings.map(f => f.ruleId))).join(', ');
                
                return (
                  <tr key={res.id}>
                    <td><code>{res.inputLog.id}</code></td>
                    <td>
                      <span style={{ color: isActuallyInjected ? 'var(--block)' : 'var(--safe)' }}>
                        {isActuallyInjected ? 'INJECTED' : 'BENIGN'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${res.policyDecision}`}>
                        {res.policyDecision}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 'bold', color: res.riskScore.score >= 51 ? 'var(--block)' : 'inherit' }}>
                        {res.riskScore.score}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {triggeredRules || '-'}
                      </div>
                    </td>
                    <td>{res.latencyMs}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .confusion-matrix {
          width: 100%;
          border-collapse: separate;
          border-spacing: 8px;
        }
        .confusion-matrix th {
          background: transparent;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .matrix-cell {
          padding: 1.5rem;
          text-align: center;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .matrix-cell strong {
          display: block;
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .matrix-cell span {
          font-size: 0.7rem;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .safe-cell { background: rgba(0, 255, 157, 0.05); border-color: rgba(0, 255, 157, 0.2); }
        .threat-cell { background: rgba(255, 78, 78, 0.05); border-color: rgba(255, 78, 78, 0.2); }
        .error-cell { background: rgba(255, 166, 0, 0.05); border-color: rgba(255, 166, 0, 0.2); }
      `}</style>
    </main>
  );
}
