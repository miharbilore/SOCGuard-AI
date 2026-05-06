"use client";

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { 
  runLimitedAgentLabSession,
  AgentLabCycleResult,
  AgentLabSessionResult,
  AgentLabCycleRecord,
  DEFAULT_AGENT_CONFIG,
} from '@/modules/socguard/agent-adapters';

export default function AgentLabRunnerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AgentLabSessionResult | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AgentLabCycleRecord | null>(null);
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
      const sessionResult = await runLimitedAgentLabSession(cycles, intervalMs, candidatesPerCycle, DEFAULT_AGENT_CONFIG);
      setResults(sessionResult);
      setStatusMessage('Session completed.');
    } catch {
      setStatusMessage('Error running session.');
    } finally {
      setIsRunning(false);
    }
  };

  const allRecords = results?.cycleResults.flatMap(c => c.records) || [];
  const r = selectedRecord; // shorthand

  return (
    <DashboardShell>
      {/* Governance Banner */}
      <div className="governance-banner warning" style={{ marginBottom: '1.5rem' }}>
        <span>⚠</span>
        <div>
          <div>Controlled demo runner. Single Cycle may use server-side API-backed agents when explicitly enabled; Limited Session remains mock/local. Generated candidates are advisory, sanitized, and never auto-approved or used to mutate production rules.</div>
          <div style={{ marginTop: '0.25rem', opacity: 0.7, fontSize: '0.75rem' }}>After editing .env.local, restart the dev server. API keys are strictly server-side.</div>
        </div>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Adversarial Research & Synthesis</div>
        <h1>Agent Lab</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Simulate multi-agent attack and defense cycles to generate robust security signatures.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SectionCard title="Runtime Settings" subtitle="Control lab safety limits">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SettingInput label="Cycles (Max 10)" value={cycles} min={1} max={10} disabled={isRunning} onChange={v => setCycles(v)} />
              <SettingInput label="Candidates / Cycle (Max 10)" value={candidatesPerCycle} min={1} max={10} disabled={isRunning} onChange={v => setCandidatesPerCycle(v)} />
              <SettingInput label="Interval (Min 1000ms)" value={intervalMs} min={1000} step={500} disabled={isRunning} onChange={v => setIntervalMs(v)} />

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <StatusRow label="Provider Mode" value={serverStatus?.providerMode || 'LOADING...'} />
                <StatusRow label="LLM Agents" value={serverStatus ? (serverStatus.enableLLMAgents ? 'ENABLED' : 'DISABLED') : 'LOADING...'} color={serverStatus?.enableLLMAgents ? 'var(--safe)' : 'var(--block)'} />
                <StatusRow label="API Key" value={serverStatus?.hasPrimaryApiKey ? 'PRESENT' : 'MISSING'} color="var(--safe)" />
                <StatusRow label="Single Cycle" value={serverStatus?.providerMode === 'API_BACKED' ? 'API-backed' : 'MOCK'} color="var(--accent)" />
                <StatusRow label="Limited Session" value="MOCK only" color="var(--text-muted)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={handleRunSingle} disabled={isRunning} className="btn-primary" style={{ width: '100%' }}>
                  Run Single Cycle
                </button>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>Server-side route. Uses configured provider if enabled.</div>
                <button onClick={handleRunSession} disabled={isRunning} className="btn-secondary" style={{ width: '100%', marginTop: '0.25rem' }}>
                  Run Limited Session
                </button>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>Local/mock only. No external API calls.</div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SummaryRow label="Candidates" value={results.totalCandidates} />
                <SummaryRow label="Detected" value={results.detectedCount} color="var(--safe)" />
                <SummaryRow label="Missed" value={results.missedCount} color={results.missedCount > 0 ? 'var(--block)' : undefined} />
                <SummaryRow label="Curated Vault" value={results.curatedEntries.length} color="var(--accent)" />
              </div>
            </SectionCard>
          )}
        </div>

        {/* Results Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SectionCard title="Cycle Records" subtitle="Step-by-step agent research traces">
            {!results && !isRunning ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Configure settings and start a research cycle to see results.
              </div>
            ) : isRunning && allRecords.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>
                Synthesizing research data...
              </div>
            ) : (
              <div className="results-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate ID</th>
                      <th>Attack Type</th>
                      <th>Detection</th>
                      <th>Risk</th>
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
                        <td><code style={{ fontSize: '0.7rem' }}>{record.redTeamCandidate.id}</code></td>
                        <td style={{ fontSize: '0.78rem', fontWeight: 600 }}>{record.redTeamCandidate.attackType}</td>
                        <td>
                          <span className={`badge badge-${record.wasDetected ? 'SAFE' : 'BLOCK'}`}>
                            {record.wasDetected ? 'DETECTED' : 'MISSED'}
                          </span>
                        </td>
                        <td><strong style={{ color: record.riskScore > 70 ? 'var(--block)' : 'var(--text)' }}>{record.riskScore}</strong></td>
                        <td><span className={`badge badge-${record.blueTeamProposal ? 'SAFE' : 'BLOCK'}`}>{record.blueTeamProposal ? 'PROPOSED' : 'MISSING'}</span></td>
                        <td><span className="badge badge-ESCALATE">{record.judgeRecommendation ? 'ADVISORY' : 'MISSING'}</span></td>
                        <td><span className="badge badge-SAFE">{record.curatedRuleVaultEntry ? 'VAULT ENTRY' : 'MISSING'}</span></td>
                        <td style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>{record.recommendedNextStep.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Pipeline Timeline + Details */}
          {r && (
            <>
              {/* Timeline */}
              <SectionCard title="Agent Pipeline Timeline" subtitle="Lifecycle of this research record">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  {[
                    { label: 'Red Team', sub: 'Candidate Created', status: 'DONE' as const },
                    { label: 'V1 Analyzer', sub: r.wasDetected ? 'Detected' : 'Missed', status: 'DONE' as const },
                    { label: 'Blue Team', sub: 'Defense Proposed', status: 'DONE' as const },
                    { label: 'Judge', sub: 'Advisory Evaluated', status: 'DONE' as const },
                    { label: 'Curator', sub: 'Vault Entry Created', status: 'DONE' as const },
                    { label: 'Human Review', sub: 'Pending', status: 'NEEDS_REVIEW' as const },
                  ].map((step, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{step.label}</div>
                      <div style={{ margin: '0.4rem 0' }}>
                        <StatusBadge status={step.status} type={step.status === 'DONE' ? 'success' : 'warning'} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)' }}>{step.sub}</div>
                      {i < 5 && <div style={{ position: 'absolute', top: '1.75rem', right: '-10%', width: '20%', borderTop: '2px dashed var(--border)' }}></div>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Detail Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* A. Red Team */}
                <SectionCard title="Red Team Output" subtitle="Adversarial Synthesis">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <DetailRow label="ID" value={r.redTeamCandidate.id} />
                    <DetailRow label="Attack Type" value={r.redTeamCandidate.attackType} />
                    <DetailRow label="Language">
                      <span className="badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.12)', fontSize: '0.6rem' }}>
                        {r.redTeamCandidate.language?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Safety Status" value={r.redTeamCandidate.safetyStatus} valueColor="var(--safe)" />
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Sanitized Prompt</div>
                      <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', borderRadius: 'var(--radius-xs)', color: '#10B981', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                        {r.redTeamCandidate.sanitizedPrompt}
                      </code>
                    </div>
                    <DetailRow label="Target Weakness" value={r.redTeamCandidate.targetWeakness} />
                  </div>
                </SectionCard>

                {/* B. V1 Detection */}
                <SectionCard title="V1 Detection Result" subtitle="Deterministic Analyzer">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StatusBadge status={r.policyDecision} type={r.wasDetected ? 'success' : 'error'} />
                      <span className={`badge badge-${r.wasDetected ? 'SAFE' : 'BLOCK'}`}>{r.wasDetected ? 'DETECTED' : 'MISSED'}</span>
                    </div>
                    <DetailRow label="Risk Score" value={r.riskScore} />
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Matched Categories</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {r.matchedCategories.map(cat => (
                          <span key={cat} style={{ fontSize: '0.6rem', background: 'var(--surface-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, color: 'var(--text-soft)' }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Explanation</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.5 }}>{r.analysisResult.explanation.summary}</p>
                    </div>
                  </div>
                </SectionCard>

                {/* C. Blue Team */}
                <SectionCard title="Blue Team Proposal" subtitle="Defensive Synthesis">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <DetailRow label="Proposed Category" value={r.blueTeamProposal.proposedCategory} />
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Suggested Pattern</div>
                      <code style={{ display: 'block', padding: '0.625rem', background: 'var(--accent-soft)', border: '1px solid rgba(37,99,235,0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem' }}>
                        {r.blueTeamProposal.proposedRulePattern}
                      </code>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <ScoreBox label="Severity" value={r.blueTeamProposal.severity} />
                      <ScoreBox label="Confidence" value={`${r.blueTeamProposal.confidence}%`} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>False Positive Risks</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {r.blueTeamProposal.falsePositiveRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Rationale</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.5 }}>{r.blueTeamProposal.rationale}</p>
                    </div>
                  </div>
                </SectionCard>

                {/* D. Judge Advisory */}
                <SectionCard title="Judge Advisory" subtitle="Advisory evaluation (not final approval)">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Recommendation:</span>
                      <StatusBadge status={r.judgeRecommendation.recommendation} type="info" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <ScoreBox label="Realism" value={r.judgeRecommendation.realismScore} />
                      <ScoreBox label="Coverage" value={r.judgeRecommendation.coverageScore} />
                      <ScoreBox label="FP Risk" value={r.judgeRecommendation.falsePositiveRiskScore} />
                      <ScoreBox label="Safety" value={r.judgeRecommendation.safetyScore} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Reasons</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {r.judgeRecommendation.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Limitations</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {r.judgeRecommendation.limitations.map((l, i) => <li key={i}>{l}</li>)}
                      </ul>
                    </div>
                    <div className="governance-banner warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700 }}>
                      ADVISORY — not a final approval
                    </div>
                  </div>
                </SectionCard>

                {/* E. Curator Output — spans full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <SectionCard title="Curator / Rule Vault Entry" subtitle="Candidate only — not an active production rule">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <DetailRow label="Vault Entry ID" value={r.curatedRuleVaultEntry.id} />
                        <DetailRow label="Status" value={r.curatedRuleVaultEntry.status} />
                        <DetailRow label="Proposed Category" value={r.curatedRuleVaultEntry.proposedCategory} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Suggested Pattern</div>
                          <code style={{ display: 'block', padding: '0.5rem', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem' }}>
                            {r.curatedRuleVaultEntry.suggestedPattern}
                          </code>
                        </div>
                        <DetailRow label="Confidence" value={`${r.curatedRuleVaultEntry.confidence}%`} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Provenance</div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>{r.curatedRuleVaultEntry.provenance}</p>
                        </div>
                        <div className="governance-banner info" style={{ padding: '0.5rem 0.75rem', fontSize: '0.65rem', marginTop: 'auto' }}>
                          <span>Human review is still required before benchmark or rule-pack promotion.</span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

/* ── Helper Components ── */

function SettingInput({ label, value, min, max, step, disabled, onChange }: {
  label: string; value: number; min: number; max?: number; step?: number; disabled: boolean; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(parseInt(e.target.value))} disabled={disabled} style={{ width: '100%' }} />
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{label}</span>
      <span style={{ fontWeight: 800, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, valueColor, children }: { label: string; value?: string | number; valueColor?: string; children?: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.75rem' }}>
      <strong style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}: </strong>
      {children || <span style={{ color: valueColor || 'var(--text)', fontWeight: 600 }}>{value}</span>}
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'var(--surface-muted)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
