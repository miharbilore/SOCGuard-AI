"use client";

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import MetricCard from '@/components/dashboard/MetricCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import RiskBadge from '@/components/dashboard/RiskBadge';
import { 
  runSingleAgentLabCycle, 
  runLimitedAgentLabSession,
  AgentLabCycleResult,
  AgentLabSessionResult,
  AgentLabCycleRecord,
  DEFAULT_AGENT_CONFIG,
  NextStepRecommendation
} from '@/modules/socguard/agent-adapters';

export default function AgentLabRunnerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AgentLabSessionResult | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AgentLabCycleRecord | null>(null);
  
  // Settings
  const [cycles, setCycles] = useState(1);
  const [candidatesPerCycle, setCandidatesPerCycle] = useState(3);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [statusMessage, setStatusMessage] = useState('');
  const [serverStatus, setServerStatus] = useState<{
    providerMode: string;
    enableLLMAgents: boolean;
    hasPrimaryApiKey: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/agent-lab/status')
      .then(res => res.json())
      .then(data => setServerStatus(data))
      .catch(err => console.error(err));
  }, []);

  const handleRunSingle = async () => {
    setIsRunning(true);
    setStatusMessage('Initiating server-side research cycle...');
    setResults(null);
    setSelectedRecord(null);

    try {
      const response = await fetch('/api/agent-lab/run-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxCandidates: candidatesPerCycle })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Server error during cycle');
      }

      const cycleResult: AgentLabCycleResult = await response.json();
      
      // Wrap in session result for consistent UI
      const sessionResult: AgentLabSessionResult = {
        id: `SESS-S-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        cyclesRun: 1,
        totalCandidates: cycleResult.totalCandidates,
        detectedCount: cycleResult.detectedCount,
        missedCount: cycleResult.missedCount,
        curatedEntries: cycleResult.curatedEntries,
        cycleResults: [cycleResult],
        warnings: cycleResult.warnings
      };
      
      setResults(sessionResult);
      setStatusMessage('Cycle completed.');
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSession = async () => {
    setIsRunning(true);
    setStatusMessage(`Running session with ${cycles} cycles...`);
    setResults(null);
    setSelectedRecord(null);

    try {
      const sessionResult = await runLimitedAgentLabSession(
        cycles,
        intervalMs,
        candidatesPerCycle,
        DEFAULT_AGENT_CONFIG
      );
      
      setResults(sessionResult);
      setStatusMessage('Session completed.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error running session.');
    } finally {
      setIsRunning(false);
    }
  };

  const allRecords = results?.cycleResults.flatMap(c => c.records) || [];

  return (
    <DashboardShell>
      {/* Governance Banner */}
      <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid var(--escalate)', color: 'var(--escalate)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem', fontWeight: 800 }}>
        ⚠ Controlled demo runner. Single Cycle may use server-side API-backed agents when explicitly enabled; Limited Session remains mock/local in this build. Generated candidates are advisory, sanitized, and never auto-approved, auto-deployed, or used to mutate production rules. This is not uncontrolled learning. API keys are strictly server-side and never exposed to the browser.
        <div style={{ marginTop: '0.5rem', opacity: 0.8 }}>Note: After editing .env.local, you must restart the dev server.</div>
      </div>

      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="subtitle">Agent Pipeline (V4)</div>
            <h1>Agent Lab Runner</h1>
            <p className="description" style={{ margin: 0 }}>
              Orchestrate automated research cycles where agents synthesize attacks and propose defenses.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Security Status</div>
             <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: '0.7rem' }}>
                  KEY: SECURE (SERVER-ONLY)
                </span>
             </div>
          </div>
        </div>
      </header>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Settings Panel */}
        <div className="settings-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SectionCard title="Runtime Settings" subtitle="Control lab safety limits">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="setting-group">
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cycles (Max 10)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={cycles} 
                    onChange={(e) => setCycles(parseInt(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
                <div className="setting-group">
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Candidates / Cycle (Max 10)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={candidatesPerCycle} 
                    onChange={(e) => setCandidatesPerCycle(parseInt(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
                <div className="setting-group">
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Interval (Min 1000ms)</label>
                  <input 
                    type="number" 
                    min={1000} 
                    step={500}
                    value={intervalMs} 
                    onChange={(e) => setIntervalMs(parseInt(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Provider Mode:</span> <span style={{ fontWeight: 800 }}>{serverStatus?.providerMode || 'LOADING...'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>LLM Agents Enabled:</span> <span style={{ color: serverStatus?.enableLLMAgents ? 'var(--safe)' : 'var(--block)', fontWeight: 800 }}>{serverStatus ? (serverStatus.enableLLMAgents ? 'ENABLED' : 'DISABLED') : 'LOADING...'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>API Key:</span> <span style={{ color: 'var(--safe)', fontWeight: 800 }}>{serverStatus?.hasPrimaryApiKey ? 'PRESENT (Server-side only)' : 'MISSING'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Single Cycle Mode:</span> <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{serverStatus?.providerMode === 'API_BACKED' ? 'API-backed via server route' : 'MOCK'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Limited Session Mode:</span> <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>MOCK/local only in this build</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <div>
                    <button 
                      onClick={handleRunSingle} 
                      disabled={isRunning}
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                    >
                      Run Single Cycle
                    </button>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>Uses the server-side /api/agent-lab/run-cycle route. If LLM agents are enabled in .env.local, this can call the configured provider.</div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button 
                      onClick={handleRunSession} 
                      disabled={isRunning}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                    >
                      Run Limited Session
                    </button>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>Runs a limited local/mock session only. It does not call external APIs in this build.</div>
                  </div>
                </div>
                
                {isRunning && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>
                    {statusMessage}
                  </div>
                )}
             </div>
          </SectionCard>

          {results && (
            <SectionCard title="Session Summary" subtitle="Aggregation of lab results">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Candidates:</span>
                  <span style={{ fontWeight: 800 }}>{results.totalCandidates}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Detected:</span>
                  <span style={{ fontWeight: 800, color: 'var(--safe)' }}>{results.detectedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Missed:</span>
                  <span style={{ fontWeight: 800, color: results.missedCount > 0 ? 'var(--block)' : 'inherit' }}>{results.missedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Curated Vault:</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{results.curatedEntries.length}</span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Results Content */}
        <div className="results-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SectionCard title="Cycle Records" subtitle="Step-by-step agent research traces">
            {!results && !isRunning ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                Configure settings and start a research cycle to see results.
              </div>
            ) : isRunning && allRecords.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 700 }}>
                Synthesizing research data...
              </div>
            ) : (
              <div className="results-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Attack Type</th>
                      <th>V1 Decision</th>
                      <th>Blue</th>
                      <th>Judge</th>
                      <th>Curator</th>
                      <th>Next Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecords.map((record, idx) => (
                      <tr 
                        key={`${record.redTeamCandidate.id}-${idx}`}
                        onClick={() => setSelectedRecord(record)}
                        className={selectedRecord?.redTeamCandidate.id === record.redTeamCandidate.id ? 'selected' : ''}
                        style={{ cursor: 'pointer' }}
                      >
                        <td><code>{record.redTeamCandidate.id}</code></td>
                        <td><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{record.redTeamCandidate.attackType}</span></td>
                        <td><StatusBadge status={record.policyDecision} type={record.wasDetected ? 'success' : 'error'} /></td>
                        <td>
                          <span className={`badge badge-${record.blueTeamProposal ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                            {record.blueTeamProposal ? 'PROPOSED' : 'MISSING'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${record.judgeRecommendation ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                            {record.judgeRecommendation ? 'ADVISORY' : 'MISSING'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${record.curatedRuleVaultEntry ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                            {record.curatedRuleVaultEntry ? 'VAULT ENTRY' : 'MISSING'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>
                            {record.recommendedNextStep.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Record Details Panel */}
          {selectedRecord && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {/* Timeline Header */}
               <SectionCard title="Agent Pipeline Timeline" subtitle="Lifecycle of this research record">
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                    {[
                      { label: 'Red Team', sub: 'Candidate Created', status: 'DONE' },
                      { label: 'V1 Analyzer', sub: selectedRecord.wasDetected ? 'Detected' : 'Missed', status: 'DONE' },
                      { label: 'Blue Team', sub: 'Defense Proposed', status: 'DONE' },
                      { label: 'Judge', sub: 'Advisory Evaluated', status: 'DONE' },
                      { label: 'Curator', sub: 'Vault Entry Created', status: 'DONE' },
                      { label: 'Human Review', sub: 'Pending Review', status: 'NEEDS_REVIEW' }
                    ].map((step, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{step.label}</div>
                        <div style={{ margin: '0.5rem 0' }}>
                           <StatusBadge status={step.status} type={step.status === 'DONE' ? 'success' : 'warning'} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{step.sub}</div>
                        {i < 5 && (
                          <div style={{ position: 'absolute', top: '2.5rem', right: '-10%', width: '20%', borderTop: '2px dashed var(--border)', zIndex: 0 }}></div>
                        )}
                      </div>
                    ))}
                  </div>
               </SectionCard>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                 {/* A. Red Team Output */}
                 <SectionCard title="[A] Red Team Output" subtitle="Adversarial Synthesis">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '0.75rem' }}><strong>ID:</strong> {selectedRecord.redTeamCandidate.id}</div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Attack Type:</strong> {selectedRecord.redTeamCandidate.attackType}</div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Language:</strong> { (selectedRecord.redTeamCandidate as any).language || 'Not specified' }</div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Safety Status:</strong> <span style={{ color: 'var(--safe)' }}>{selectedRecord.redTeamCandidate.safetyStatus}</span></div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Sanitized Prompt</h4>
                        <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: '6px', color: '#10B981', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {selectedRecord.redTeamCandidate.sanitizedPrompt}
                        </code>
                      </div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Target Weakness:</strong> {selectedRecord.redTeamCandidate.targetWeakness}</div>
                    </div>
                 </SectionCard>

                 {/* B. V1 Detection Result */}
                 <SectionCard title="[B] V1 Detection Result" subtitle="Deterministic Analyzer">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusBadge status={selectedRecord.policyDecision} type={selectedRecord.wasDetected ? 'success' : 'error'} />
                        <span className={`badge badge-${selectedRecord.wasDetected ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.7rem' }}>
                          {selectedRecord.wasDetected ? 'DETECTED' : 'MISSED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Risk Score:</strong> <span style={{ fontWeight: 800 }}>{selectedRecord.riskScore}</span></div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Matched Categories</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {selectedRecord.matchedCategories.map(cat => (
                            <span key={cat} style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{cat}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Explanation Summary</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{selectedRecord.analysisResult.explanation.summary}</p>
                      </div>
                    </div>
                 </SectionCard>

                 {/* C. Blue Team Proposal */}
                 <SectionCard title="[C] Blue Team Proposal" subtitle="Defensive Synthesis">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '0.75rem' }}><strong>Proposed Category:</strong> {selectedRecord.blueTeamProposal.proposedCategory}</div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Suggested Pattern</h4>
                        <code style={{ display: 'block', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.04)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--accent)', borderRadius: '6px', fontSize: '0.8rem' }}>
                          {selectedRecord.blueTeamProposal.proposedRulePattern}
                        </code>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>SEVERITY</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedRecord.blueTeamProposal.severity}</div>
                         </div>
                         <div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIDENCE</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedRecord.blueTeamProposal.confidence}%</div>
                         </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>False Positive Risks</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                          {selectedRecord.blueTeamProposal.falsePositiveRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Rationale</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{selectedRecord.blueTeamProposal.rationale}</p>
                      </div>
                    </div>
                 </SectionCard>

                 {/* D. Judge Advisory */}
                 <SectionCard title="[D] Judge Advisory" subtitle="Advisory evaluation (not final approval)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem' }}><strong>Recommendation:</strong></span>
                        <StatusBadge status={selectedRecord.judgeRecommendation.recommendation} type="info" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                         {[
                           { label: 'Realism', score: selectedRecord.judgeRecommendation.realismScore },
                           { label: 'Coverage', score: selectedRecord.judgeRecommendation.coverageScore },
                           { label: 'FP Risk', score: selectedRecord.judgeRecommendation.falsePositiveRiskScore },
                           { label: 'Safety', score: selectedRecord.judgeRecommendation.safetyScore }
                         ].map(s => (
                           <div key={s.label} style={{ background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>{s.label.toUpperCase()}</div>
                              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{s.score}</div>
                           </div>
                         ))}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Reasons</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                          {selectedRecord.judgeRecommendation.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Limitations</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                          {selectedRecord.judgeRecommendation.limitations.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--escalate)', fontWeight: 800, textAlign: 'center', padding: '0.5rem', background: 'rgba(217, 119, 6, 0.05)', borderRadius: '4px' }}>
                        ADVISORY — not a final approval
                      </div>
                    </div>
                 </SectionCard>

                 {/* E. Curator Output */}
                 <SectionCard title="[E] Curator Output" subtitle="Candidate only (not an active rule)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '0.75rem' }}><strong>Vault Entry ID:</strong> <code>{selectedRecord.curatedRuleVaultEntry.id}</code></div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Status:</strong> <span style={{ fontWeight: 800 }}>{selectedRecord.curatedRuleVaultEntry.status}</span></div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Proposed Category:</strong> {selectedRecord.curatedRuleVaultEntry.proposedCategory}</div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Suggested Pattern</h4>
                        <code style={{ display: 'block', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem' }}>
                          {selectedRecord.curatedRuleVaultEntry.suggestedPattern}
                        </code>
                      </div>
                      <div style={{ fontSize: '0.75rem' }}><strong>Confidence:</strong> {selectedRecord.curatedRuleVaultEntry.confidence}%</div>
                      <div>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Provenance Summary</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>{selectedRecord.curatedRuleVaultEntry.provenance}</p>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, textAlign: 'center', padding: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '4px' }}>
                        Curator converts Red + Blue + Judge outputs into a Rule Vault candidate.
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--escalate)', fontWeight: 800, textAlign: 'center' }}>
                        Human review is still required before benchmark or rule-pack promotion.
                      </div>
                    </div>
                 </SectionCard>
               </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </DashboardShell>
  );
}
