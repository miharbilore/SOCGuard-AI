"use client";

import { useState } from 'react';
import { analyzeLog } from '../modules/socguard/demo';
import { getSampleLogs } from '../modules/socguard/dataset/sample-logs';
import { AnalysisResult, LogEntry } from '../modules/socguard/types';

export default function Home() {
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
    <main className="container">
      <header>
        <div className="subtitle">Cybersecurity Research Tool</div>
        <h1>SOCGuard AI</h1>
        <p className="description">
          This proof of concept detects malicious instructions hidden inside log data 
          before an LLM-based SOC assistant can treat them as commands.
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
          <h2 className="section-title">Analysis Results</h2>
          
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

              <div className="info-grid">
                <div className="info-item">
                  <h4>Findings ({result.findings.length})</h4>
                  {result.findings.length > 0 ? (
                    <div className="findings-list">
                      {result.findings.map((f, i) => (
                        <div key={i} className="finding-item">
                          <div className="finding-header">
                            <span>{f.category}</span>
                            <span>{f.severity}</span>
                          </div>
                          <div className="finding-text">{f.matchedText || 'Obfuscation Pattern'}</div>
                          <div className="finding-reason">{f.reason}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rationale">No anomalies identified by deterministic rules.</p>
                  )}
                </div>

                <div className="info-item">
                  <h4>Explanation</h4>
                  <p>{result.explanation.summary}</p>
                </div>

                <div className="info-item">
                  <h4>Decision Rationale</h4>
                  <p className="rationale">{result.explanation.decisionRationale}</p>
                </div>

                <div className="info-item">
                  <h4>Recommended Action</h4>
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

      <section className="why-matters">
        <h3>Why this matters</h3>
        <ul>
          <li className="why-item">
            <h5>Untrusted Data</h5>
            <p>Log data is often treated as text, but it originates from external sources and can contain malicious payloads targeting the analyzer itself.</p>
          </li>
          <li className="why-item">
            <h5>Indirect Injection</h5>
            <p>LLMs can confuse data with instructions. Without a guard layer, an LLM might execute commands hidden in a User-Agent or Proxy header.</p>
          </li>
          <li className="why-item">
            <h5>Deterministic Safety</h5>
            <p>SOCGuard enforces fixed security policies before any LLM usage, preventing semantic persuasion and ensuring audit-ready results.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
