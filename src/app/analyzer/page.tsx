"use client";

import { useState } from 'react';
import Link from 'next/link';
import { analyzeLog } from '../../modules/socguard/demo';
import { getSampleLogs } from '../../modules/socguard/dataset/sample-logs';
import { AnalysisResult, LogEntry } from '../../modules/socguard/types';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function AnalyzerPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    
    // Artificial delay for effect
    setTimeout(() => {
      const log: LogEntry = {
        id: `user-input-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'interactive-demo',
        payload: input
      };
      
      const analysis = analyzeLog(log);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 400);
  };

  const loadSample = (type: 'BENIGN' | 'INJECTED') => {
    const samples = getSampleLogs().filter(s => s.label === type);
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setInput(randomSample.raw);
    setResult(null);
  };

  return (
    <DashboardShell>
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Interactive Research Utility</div>
        <h1>Log Analyzer</h1>
        <p className="description">
          Test raw SIEM-style log entries against the deterministic SOCGuard detection pipeline.
        </p>
      </header>

      <div className="main-grid">
        {/* Left Panel: Input */}
        <div className="card">
          <h2 className="section-title">Log Input</h2>
          <textarea 
            placeholder="Paste SIEM-style log entry here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ minHeight: '200px' }}
          />
          <div className="button-group">
            <button 
              className="btn-primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Log'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('BENIGN')}
            >
              Load Benign Sample
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('INJECTED')}
            >
              Load Injected Sample
            </button>
          </div>
        </div>

        {/* Right Panel: Analysis Result */}
        <div className="card">
          <h2 className="section-title">Analysis Results <span className="badge badge-ADVISORY" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginLeft: '0.5rem' }}>ADVISORY</span></h2>
          
          {result ? (
            <div className="result-content">
              <div className="result-header">
                <div className={`badge badge-${result.policyDecision}`}>
                  {result.policyDecision}
                </div>
                <div className="score-display">
                  <div className="score-value">{result.riskScore.score}</div>
                  <div className="score-label">Risk Score ({result.riskScore.level})</div>
                  <div className="latency">Processed in {result.latencyMs}ms</div>
                </div>
              </div>

              <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="info-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Explanation</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{result.explanation.summary}</p>
                </div>

                <div className="info-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Decision Rationale</h4>
                  <p className="rationale" style={{ borderLeft: '3px solid var(--border)', paddingLeft: '1rem' }}>
                    {result.explanation.decisionRationale}
                  </p>
                </div>

                {/* Evidence Section */}
                <div className="info-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Suspicious Evidence ({result.explanation.suspiciousEvidence.length})
                  </h4>
                  <div className="findings-list">
                    {result.explanation.suspiciousEvidence.length > 0 ? (
                      result.explanation.suspiciousEvidence.map((ev, i) => (
                        <div key={i} className="finding-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                          <div className="finding-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{ev.ruleId || 'SIG-000'}</span>
                            <span className={`badge badge-${ev.severity}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              {ev.severity}
                            </span>
                            <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>{ev.category}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                            Line {ev.lineNumber || 'N/A'} | Confidence: {(ev.confidence * 100).toFixed(0)}%
                          </div>
                          <code style={{ 
                            display: 'block', 
                            padding: '0.75rem', 
                            background: '#000', 
                            borderRadius: '4px',
                            marginBottom: '0.5rem',
                            wordBreak: 'break-all',
                            color: '#0f0',
                            fontSize: '0.85rem'
                          }}>
                            {ev.matchedText || 'Pattern Match'}
                          </code>
                          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{ev.reason}</div>
                        </div>
                      ))
                    ) : (
                      <p className="rationale">No suspicious evidence identified by deterministic signatures.</p>
                    )}
                  </div>
                </div>

                {/* Scoring Breakdown */}
                <div className="info-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Scoring Breakdown</h4>
                  <div className="findings-list">
                    {result.riskScore.factors.map((f, i) => (
                      <div key={i} className="finding-item" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 'bold' }}>{f.factor}</span>
                          <span style={{ color: 'var(--block)', fontWeight: 'bold' }}>+{f.points} pts</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{f.reason}</div>
                        {f.relatedRuleIds && f.relatedRuleIds.length > 0 && (
                          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>
                            Rule(s): {f.relatedRuleIds.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="info-item">
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Recommended Action</h4>
                  <div className="guidance">
                    {result.explanation.recommendedAction}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              {isAnalyzing ? (
                "Orchestrating deterministic pipeline..."
              ) : (
                "Enter a log or load a sample to start the security analysis."
              )}
            </div>
          )}
        </div>
      </div>

      <section className="why-matters" style={{ marginTop: '4rem' }}>
        <h3>Research Context</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="why-item">
            <h5>Untrusted Data</h5>
            <p>Log data is often treated as text, but it originates from external sources and can contain malicious payloads targeting the analyzer itself.</p>
          </div>
          <div className="why-item">
            <h5>Indirect Injection</h5>
            <p>LLMs can confuse data with instructions. Without a guard layer, an LLM might execute commands hidden in a User-Agent or Proxy header.</p>
          </div>
          <div className="why-item">
            <h5>Deterministic Safety</h5>
            <p>SOCGuard enforces fixed security policies before any LLM usage, preventing semantic persuasion and ensuring audit-ready results.</p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
