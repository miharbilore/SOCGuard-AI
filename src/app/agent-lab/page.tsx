"use client";

import { useState } from 'react';
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

  const handleRunSingle = async () => {
    setIsRunning(true);
    setStatusMessage('Running single agent research cycle...');
    setResults(null);
    setSelectedRecord(null);

    try {
      const cycleResult = await runSingleAgentLabCycle(
        DEFAULT_AGENT_CONFIG, 
        'manual-ui-run', 
        candidatesPerCycle
      );
      
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
    } catch (err) {
      console.error(err);
      setStatusMessage('Error running cycle.');
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
        ⚠ Controlled demo runner. Mock agents only. This is not uncontrolled learning. Generated candidates are advisory, sanitized, and never auto-approved, auto-deployed, or used to mutate production rules.
      </div>

      <header style={{ marginBottom: '2.5rem' }}>
        <div className="subtitle">Agent Pipeline (V4)</div>
        <h1>Agent Lab Runner</h1>
        <p className="description" style={{ margin: 0 }}>
          Orchestrate automated research cycles where agents synthesize attacks and propose defenses.
        </p>
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

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Provider:</span> <span style={{ fontWeight: 800 }}>MOCK</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>LLM Agents:</span> <span style={{ color: 'var(--block)', fontWeight: 800 }}>DISABLED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Auto-Approval:</span> <span style={{ color: 'var(--block)', fontWeight: 800 }}>FALSE</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    onClick={handleRunSingle} 
                    disabled={isRunning}
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                  >
                    Run Single Cycle
                  </button>
                  <button 
                    onClick={handleRunSession} 
                    disabled={isRunning}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                  >
                    Run Limited Session
                  </button>
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
                      <th>Decision</th>
                      <th>Score</th>
                      <th>Status</th>
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
                        <td><span style={{ fontWeight: 800, color: record.riskScore > 70 ? 'var(--block)' : 'inherit' }}>{record.riskScore}</span></td>
                        <td>
                          <span className={`badge badge-${record.wasDetected ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.65rem' }}>
                            {record.wasDetected ? 'DETECTED' : 'MISSED'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               <SectionCard title="Candidate Intelligence" subtitle="Agent-generated adversarial data">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Sanitized Prompt</h4>
                      <code style={{ display: 'block', padding: '1rem', background: '#0F172A', borderRadius: '8px', color: '#10B981', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {selectedRecord.redTeamCandidate.sanitizedPrompt}
                      </code>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>V1 Analysis Summary</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{selectedRecord.analysisResult.explanation.summary}</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Matched Categories</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selectedRecord.matchedCategories.map(cat => (
                          <span key={cat} style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
               </SectionCard>

               <SectionCard title="Defense & Curation" subtitle="Blue Team proposal and vault status">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Blue Team Proposed Pattern</h4>
                      <code style={{ display: 'block', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.04)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--accent)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        {selectedRecord.blueTeamProposal.proposedRulePattern}
                      </code>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>JUDGE REALISM</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedRecord.judgeRecommendation.realismScore}</div>
                       </div>
                       <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>JUDGE SAFETY</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedRecord.judgeRecommendation.safetyScore}</div>
                       </div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>Vault Entry: {selectedRecord.curatedRuleVaultEntry.id}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                        <strong>Status:</strong> {selectedRecord.curatedRuleVaultEntry.status}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {selectedRecord.curatedRuleVaultEntry.provenance}
                      </div>
                    </div>
                  </div>
               </SectionCard>
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
