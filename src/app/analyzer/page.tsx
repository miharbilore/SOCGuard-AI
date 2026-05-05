"use client";

import { useState } from 'react';
import { analyzeLog } from '../../modules/socguard/demo';
import { getSampleLogs } from '../../modules/socguard/dataset/sample-logs';
import { AnalysisResult, LogEntry } from '../../modules/socguard/types';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import RiskBadge from '@/components/dashboard/RiskBadge';

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
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Interactive Research Utility</div>
        <h1>Log Analyzer</h1>
        <p className="description" style={{ margin: 0 }}>
          Test raw SIEM-style log entries against the deterministic SOCGuard detection pipeline.
        </p>
      </header>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Panel: Input */}
        <SectionCard title="Log Input" subtitle="Paste or load sample data">
          <textarea 
            placeholder="Paste SIEM-style log entry here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '280px', 
              background: 'rgba(0,0,0,0.02)', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              padding: '1.25rem', 
              color: 'var(--text)', 
              fontSize: '0.95rem',
              fontFamily: 'monospace',
              resize: 'vertical',
              marginBottom: '1.5rem'
            }}
          />
          <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button 
              className="btn-primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input}
              style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Log'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('BENIGN')}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Load Benign
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('INJECTED')}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Load Injected
            </button>
          </div>
        </SectionCard>

        {/* Right Panel: Analysis Result */}
        <SectionCard title="Analysis Results" subtitle="Traceable pipeline output">
          {result ? (
            <div className="result-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <StatusBadge status={result.policyDecision} type={result.policyDecision === 'SAFE' ? 'success' : 'error'} />
                <div className="score-display" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: result.riskScore.score >= 51 ? 'var(--block)' : 'var(--safe)' }}>{result.riskScore.score}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Risk: {result.riskScore.level}</div>
                </div>
              </div>

              <div className="detail-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Decision Summary</h4>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{result.explanation.summary}</p>
                </div>

                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Rational Basis</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-soft)', borderLeft: '3px solid var(--border)', paddingLeft: '1rem', margin: 0, lineHeight: 1.5 }}>
                    {result.explanation.decisionRationale}
                  </p>
                </div>

                {/* Evidence Section */}
                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>
                    Evidence Detected ({result.explanation.suspiciousEvidence.length})
                  </h4>
                  <div className="findings-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.explanation.suspiciousEvidence.length > 0 ? (
                      result.explanation.suspiciousEvidence.map((ev, i) => (
                        <div key={i} className="finding-box" style={{ background: 'white', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <div className="finding-top" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.75rem' }}>{ev.ruleId || 'SIG-000'}</span>
                            <RiskBadge level={ev.severity} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{ev.category}</span>
                          </div>
                          <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: '6px', color: '#10B981', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                            {ev.matchedText}
                          </code>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{ev.reason}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No suspicious patterns identified.</p>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Recommended Action</h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--human)', background: 'rgba(219, 39, 119, 0.04)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(219, 39, 119, 0.1)', fontWeight: 600 }}>
                    {result.explanation.recommendedAction}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isAnalyzing ? "Orchestrating pipeline..." : "Enter a log to begin analysis."}
            </div>
          )}
        </SectionCard>
      </div>

      <section style={{ marginTop: '4rem', padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Research Context</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          <div className="context-item">
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Untrusted Data Sources</h5>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>SIEM logs originate from external hosts. Attackers can embed payloads in headers like User-Agent to target downstream AI analyzers.</p>
          </div>
          <div className="context-item">
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Indirect Prompt Injection</h5>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>LLMs often fail to distinguish between instructions and data. Indirect injection bypasses direct user controls via poisoned external context.</p>
          </div>
          <div className="context-item">
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Deterministic Guarding</h5>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>SOCGuard enforces signature-based policies before AI interaction, ensuring that malicious semantics are neutralized at the wire level.</p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
