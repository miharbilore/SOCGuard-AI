"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyzeSampleDataset } from '../../modules/socguard/demo';

export default function EvaluationPage() {
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    const results = analyzeSampleDataset();
    setEvaluation(results);
  }, []);

  if (!evaluation) {
    return <div className="container placeholder">Running benchmark pipeline...</div>;
  }

  const detectionRate = ((evaluation.detectedInjectedCount / evaluation.injectedCount) * 100).toFixed(1);
  const fpRate = ((evaluation.falsePositives / evaluation.benignCount) * 100).toFixed(1);
  const fnRate = ((evaluation.falseNegatives / evaluation.injectedCount) * 100).toFixed(1);

  return (
    <main className="container">
      <header>
        <Link href="/" className="nav-link">← Back to Demo</Link>
        <div className="subtitle">Performance Metrics</div>
        <h1>SOCGuard AI Evaluation</h1>
        <p className="description">
          Deterministic benchmark on synthetic SIEM prompt injection dataset. 
          This page evaluates the effectiveness of the pipeline against known malicious and benign samples.
        </p>
      </header>

      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">Summary Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{evaluation.totalLogs}</div>
            <div className="metric-label">Total Logs</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--safe)' }}>{detectionRate}%</div>
            <div className="metric-label">Detection Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--block)' }}>{fpRate}%</div>
            <div className="metric-label">False Positive Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--escalate)' }}>{fnRate}%</div>
            <div className="metric-label">False Negative Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{evaluation.averageLatencyMs.toFixed(2)}ms</div>
            <div className="metric-label">Avg Latency</div>
          </div>
        </div>

        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <div className="metric-card">
            <div className="metric-value">{evaluation.benignCount}</div>
            <div className="metric-label">Benign Samples</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{evaluation.injectedCount}</div>
            <div className="metric-label">Injected Samples</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{evaluation.detectedInjectedCount}</div>
            <div className="metric-label">Correct Detections</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{evaluation.falsePositives}</div>
            <div className="metric-label">False Positives</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Detailed Results</h2>
        <div className="results-table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Expected</th>
                <th>Decision</th>
                <th>Score</th>
                <th>Level</th>
                <th>Categories</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.results.map((res: any) => {
                const isCorrect = (res.inputLog.id.startsWith('i') && res.policyDecision !== 'SAFE') || 
                                 (res.inputLog.id.startsWith('b') && res.policyDecision === 'SAFE');
                
                return (
                  <tr key={res.id}>
                    <td><code>{res.inputLog.id}</code></td>
                    <td>
                      <span style={{ color: res.inputLog.id.startsWith('i') ? 'var(--block)' : 'var(--safe)' }}>
                        {res.inputLog.id.startsWith('i') ? 'INJECTED' : 'BENIGN'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${res.policyDecision}`}>
                        {res.policyDecision}
                      </span>
                    </td>
                    <td>{res.riskScore.score}</td>
                    <td>{res.riskScore.level}</td>
                    <td>
                      {Array.from(new Set(res.findings.map((f: any) => f.category))).join(', ') || '-'}
                    </td>
                    <td>{res.latencyMs}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="why-matters" style={{ marginTop: '2rem' }}>
        <h3>Limitations & Disclaimer</h3>
        <ul>
          <li className="why-item">
            <h5>Synthetic Dataset</h5>
            <p>The current benchmark uses a synthetic dataset specifically crafted to demonstrate prompt injection variants. It does not represent the full entropy of production SIEM logs.</p>
          </li>
          <li className="why-item">
            <h5>Dataset Scale</h5>
            <p>The evaluation is performed on a small set of samples. While it demonstrates the deterministic logic, larger datasets are required for enterprise-grade confidence.</p>
          </li>
          <li className="why-item">
            <h5>PoC Status</h5>
            <p>These results reflect the performance of a Proof of Concept. Real-world validation would involve thousands of diverse log entries and continuous rule tuning.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
