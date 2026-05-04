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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Link href="/" className="nav-link" style={{ marginBottom: 0 }}>← Back to Demo</Link>
          <Link href="/v2" className="nav-link" style={{ marginBottom: 0 }}>V2 Pipeline Demo →</Link>
        </div>
        <div className="subtitle">Academic Benchmark Results</div>
        <h1>SOCGuard AI Evaluation</h1>
        <p className="description">
          Deterministic benchmark on synthetic SIEM prompt injection dataset.
        </p>
        <div className="alert alert-info" style={{ marginTop: '1rem', borderLeft: '4px solid var(--accent)' }}>
          <strong>Academic Disclaimer:</strong> Metrics are calculated on a small synthetic research dataset (30 samples). 
          SOCGuard is a deterministic-first proof of concept; it does not use LLMs in its core pipeline and is not intended for production enterprise deployment as a standalone replacement for SIEM or EDR systems.
        </div>
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
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Difficulty Breakdown */}
        <section className="card">
          <h2 className="section-title">Analysis by Difficulty</h2>
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>TP/FN (Inj)</th>
                  <th>TN/FP (Ben)</th>
                  <th>Det Rate</th>
                </tr>
              </thead>
              <tbody>
                {perDifficulty.map(d => (
                  <tr key={d.difficulty}>
                    <td><strong>{d.difficulty}</strong></td>
                    <td>{d.truePositives} / {d.falseNegatives}</td>
                    <td>{d.trueNegatives} / {d.falsePositives}</td>
                    <td style={{ color: d.detectionRateOnInjected > 0.8 ? 'var(--safe)' : 'var(--block)', fontWeight: 'bold' }}>
                      {toPct(d.detectionRateOnInjected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Category Coverage */}
        <section className="card">
          <h2 className="section-title">Category Coverage</h2>
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Expected</th>
                  <th>Detected</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {perCategory.map(c => (
                  <tr key={c.category}>
                    <td><code>{c.category}</code></td>
                    <td>{c.expectedCount}</td>
                    <td>{c.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--card-bg)', borderRadius: '4px', width: '50px' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${c.coveragePercentage}%`, 
                            background: c.coveragePercentage >= 100 ? 'var(--safe)' : 'var(--escalate)',
                            borderRadius: '4px'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{c.coveragePercentage.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Attack Vector Breakdown */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Per Attack Vector (Recall)</h2>
        <div className="results-table-container">
          <table>
            <thead>
              <tr>
                <th>Attack Vector</th>
                <th>Injected Samples</th>
                <th>Detected (TP)</th>
                <th>Missed (FN)</th>
                <th>Recall</th>
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
                        <span style={{ color: gt?.label === 'INJECTED' ? 'var(--block)' : 'var(--safe)', fontWeight: 'bold' }}>
                          {gt?.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {gt?.difficulty} | {gt?.attackVector}
                        </span>
                      </div>
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
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        {gt?.expectedCategory || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {triggeredRules || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="section-title">Research Limitations</h2>
        <ul className="rationale" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li><strong>Synthetic Dataset:</strong> Benchmark is conducted on a small, curated set of 30 log samples. Real-world SIEM traffic is significantly noisier and higher volume.</li>
          <li><strong>Stateless Analysis:</strong> Each log is analyzed in isolation. Correlation across multiple events (session tracking) is not yet implemented.</li>
          <li><strong>Deterministic Rules:</strong> Detection relies on regex-based signatures and context heuristics. It may miss novel or highly creative semantic injections that do not match existing patterns.</li>
          <li><strong>Bounded Decoding:</strong> Multi-pass decoding is capped at 2 layers to ensure deterministic performance and prevent recursion attacks.</li>
          <li><strong>Language Support:</strong> Core rules focus on English and Turkish. Other languages or non-Latin scripts have limited coverage.</li>
          <li><strong>No LLM in Core:</strong> This prototype purposefully avoids LLM calls in the decision path to maintain sub-millisecond latency and auditability.</li>
        </ul>
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
