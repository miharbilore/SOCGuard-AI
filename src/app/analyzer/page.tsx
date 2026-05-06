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
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Interactive Research Utility</div>
        <h1>Log Analyzer</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Test raw SIEM-style log entries against the deterministic SOCGuard detection pipeline.
        </p>
      </header>

      <div className="main-grid">
        {/* Left Panel: Input */}
        <SectionCard title="Log Input" subtitle="Paste or load sample data">
          <textarea 
            placeholder="Paste SIEM-style log entry here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ minHeight: '260px', marginBottom: '1.25rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input}
              style={{ flex: 1.5 }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Log'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('BENIGN')}
              style={{ flex: 1 }}
            >
              Load Benign
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => loadSample('INJECTED')}
              style={{ flex: 1 }}
            >
              Load Injected
            </button>
          </div>
        </SectionCard>

        {/* Right Panel: Analysis Result */}
        <SectionCard title="Analysis Results" subtitle="Traceable pipeline output">
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <StatusBadge status={result.policyDecision} type={result.policyDecision === 'SAFE' ? 'success' : 'error'} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: result.riskScore.score >= 51 ? 'var(--block)' : 'var(--safe)', lineHeight: 1 }}>{result.riskScore.score}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '0.2rem' }}>Risk: {result.riskScore.level}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Decision Summary</h4>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{result.explanation.summary}</p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Rational Basis</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', borderLeft: '3px solid var(--border)', paddingLeft: '1rem', margin: 0, lineHeight: 1.5 }}>
                    {result.explanation.decisionRationale}
                  </p>
                </div>

                {/* Evidence Section */}
                <div>
                  <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700 }}>
                    Evidence Detected ({result.explanation.suspiciousEvidence.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {result.explanation.suspiciousEvidence.length > 0 ? (
                      result.explanation.suspiciousEvidence.map((ev, i) => (
                        <div key={i} style={{ background: 'white', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.7rem' }}>{ev.ruleId || 'SIG-000'}</span>
                            <RiskBadge level={ev.severity} />
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{ev.category}</span>
                          </div>
                          <code style={{ display: 'block', padding: '0.75rem', background: '#0f172a', borderRadius: '6px', color: '#10b981', fontSize: '0.75rem', wordBreak: 'break-all', marginBottom: '0.625rem' }}>
                            {ev.matchedText}
                          </code>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.4 }}>{ev.reason}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No suspicious patterns identified.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Recommended Action</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--human)', background: 'rgba(124, 58, 237, 0.05)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(124, 58, 237, 0.1)', fontWeight: 700 }}>
                    {result.explanation.recommendedAction}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              {isAnalyzing ? "Orchestrating pipeline..." : "Enter a log to begin analysis."}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Research Context" subtitle="Deterministic Security vs. LLM Vulnerabilities" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Untrusted Data Sources</h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>SIEM logs originate from external hosts. Attackers can embed payloads in headers like User-Agent to target downstream AI analyzers.</p>
          </div>
          <div>
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Indirect Prompt Injection</h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>LLMs often fail to distinguish between instructions and data. Indirect injection bypasses direct user controls via poisoned external context.</p>
          </div>
          <div>
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Deterministic Guarding</h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>SOCGuard enforces signature-based policies before AI interaction, ensuring that malicious semantics are neutralized at the wire level.</p>
          </div>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
