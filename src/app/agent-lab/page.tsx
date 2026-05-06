"use client";

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
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
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
          <strong>Governance Notice:</strong> No uncontrolled learning or production mutation occurs. All candidates are <strong>advisory only</strong> and require human review.
          <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
            <li>No auto-approval of signatures.</li>
            <li>API keys are strictly server-side only.</li>
            <li>Single Cycle may use server-side API-backed agents when enabled; Limited Session remains mock/local in this build.</li>
          </ul>
        </div>
      </div>

      <header style={{ marginBottom: '1.5rem' }}>
        <div className="subtitle">Adversarial Research & Synthesis (V4.1)</div>
        <h1>Agent Lab</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Orchestrate attack/defense cycles to generate robust security signatures.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        {/* Settings + Summary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SectionCard title="Runtime Settings" subtitle="Safety Limits">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SettingInput label="Cycles" value={cycles} min={1} max={10} disabled={isRunning} onChange={v => setCycles(v)} />
              <SettingInput label="Candidates" value={candidatesPerCycle} min={1} max={10} disabled={isRunning} onChange={v => setCandidatesPerCycle(v)} />
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <StatusRow label="LLM Agents" value={serverStatus ? (serverStatus.enableLLMAgents ? 'ENABLED' : 'DISABLED') : '...'} color={serverStatus?.enableLLMAgents ? 'var(--safe)' : 'var(--block)'} />
                <StatusRow label="Key" value={serverStatus?.hasPrimaryApiKey ? 'PRESENT' : 'MISSING'} color="var(--safe)" />
                <StatusRow label="Mode" value={serverStatus?.providerMode === 'API_BACKED' ? 'API-backed' : 'MOCK'} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={handleRunSingle} disabled={isRunning} className="btn-primary" style={{ width: '100%' }}>
                  Run Single Cycle
                </button>
                <button onClick={handleRunSession} disabled={isRunning} className="btn-secondary" style={{ width: '100%' }}>
                  Run Session
                </button>
              </div>

              {isRunning && (
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>
                  {statusMessage}
                </div>
              )}
            </div>
          </SectionCard>

          {results && (
            <SectionCard title="Session Summary" subtitle="Performance Metrics">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SummaryRow label="Candidates" value={results.totalCandidates} />
                <SummaryRow label="Detected" value={results.detectedCount} color="var(--safe)" />
                <SummaryRow label="Missed" value={results.missedCount} color={results.missedCount > 0 ? 'var(--block)' : undefined} />
                <SummaryRow label="Vault" value={results.curatedEntries.length} color="var(--accent)" />
              </div>
            </SectionCard>
          )}
        </div>

        {/* Results and Workflow Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Records Table */}
          <SectionCard title="Cycle Records" subtitle="Human review required for all candidates">
            {!results && !isRunning ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Start a research cycle to begin synthesis.
              </div>
            ) : (
              <div className="results-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Attack Type</th>
                      <th>V1</th>
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
                        <td><code>{record.redTeamCandidate.id.split('-').pop()}</code></td>
                        <td style={{ fontSize: '0.75rem', fontWeight: 700 }}>{record.redTeamCandidate.attackType}</td>
                        <td>
                          <span className={`badge badge-${record.wasDetected ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.6rem' }}>
                            {record.wasDetected ? 'DETECTED' : 'MISSED'}
                          </span>
                        </td>
                        <td><strong style={{ fontSize: '0.8rem', color: record.riskScore > 70 ? 'var(--block)' : 'inherit' }}>{record.riskScore}</strong></td>
                        <td><span className={`badge badge-${record.blueTeamProposal ? 'SAFE' : 'BLOCK'}`} style={{ fontSize: '0.6rem' }}>{record.blueTeamProposal ? 'PROPOSED' : 'MISSING'}</span></td>
                        <td><span className="badge badge-ESCALATE" style={{ fontSize: '0.6rem' }}>{record.judgeRecommendation ? 'ADVISORY' : 'MISSING'}</span></td>
                        <td><span className="badge badge-SAFE" style={{ fontSize: '0.6rem' }}>{record.curatedRuleVaultEntry ? 'VAULT' : 'MISSING'}</span></td>
                        <td style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)' }}>{record.recommendedNextStep.split('_').pop()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* 4-Panel Workflow */}
          {r && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Pipeline Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                 <PipelineStep label="Red Team" status="DONE" />
                 <PipelineArrow />
                 <PipelineStep label="V1 Analyzer" status={r.wasDetected ? "DETECTED" : "MISSED"} highlight={!r.wasDetected} />
                 <PipelineArrow />
                 <PipelineStep label="Blue Team" status="DONE" />
                 <PipelineArrow />
                 <PipelineStep label="Judge" status="ADVISORY" />
                 <PipelineArrow />
                 <PipelineStep label="Curator" status="NEEDS_REVIEW" />
                 <PipelineArrow />
                 <PipelineStep label="Human Review" status="PENDING" highlight />
              </div>

              {/* V1 Detection Summary Strip */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid', 
                borderColor: r.wasDetected ? 'var(--safe)' : 'var(--block)',
                background: r.wasDetected ? 'var(--safe-bg)' : 'var(--block-bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 800, color: r.wasDetected ? 'var(--safe)' : 'var(--block)' }}>
                     {r.wasDetected ? '✓ DETECTED BY V1' : '⚠ MISSED BY V1 — needs rule candidate'}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                     {r.analysisResult.explanation.summary}
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '1.25rem', fontWeight: 900, color: r.riskScore > 70 ? 'var(--block)' : 'var(--text)' }}>{r.riskScore}</div>
                   <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Score</div>
                </div>
              </div>

              {/* The 4 Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {/* 1. Red Team */}
                <SectionCard 
                  title="Panel 1 — Red Team" 
                  subtitle="Attack Candidate Synthesis" 
                  style={{ borderTop: '4px solid #F43F5E' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge" style={{ background: '#FFF1F2', color: '#F43F5E', border: '1px solid #FECDD3' }}>RED TEAM AGENT</span>
                      <code style={{ fontSize: '0.7rem' }}>{r.redTeamCandidate.id}</code>
                    </div>
                    <DetailRow label="Attack Type" value={r.redTeamCandidate.attackType} />
                    <DetailRow label="Language" value={r.redTeamCandidate.language || 'UNKNOWN'} />
                    <DetailRow label="Safety" value={r.redTeamCandidate.safetyStatus} valueColor="var(--safe)" />
                    <div>
                       <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sanitized Sample</div>
                       <code style={{ display: 'block', padding: '0.75rem', background: '#0F172A', color: '#10B981', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '120px', overflowY: 'auto' }}>
                         {r.redTeamCandidate.sanitizedPrompt}
                       </code>
                    </div>
                    <DetailRow label="Target Weakness" value={r.redTeamCandidate.targetWeakness} />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>Red Team generates a sanitized adversarial incident log. It never stores raw harmful content.</p>
                  </div>
                </SectionCard>

                {/* 2. Blue Team */}
                <SectionCard 
                  title="Panel 2 — Blue Team" 
                  subtitle="Defense Proposal Synthesis" 
                  style={{ borderTop: '4px solid #3B82F6' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge" style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #DBEAFE' }}>BLUE TEAM AGENT</span>
                      <span className="badge badge-SAFE" style={{ fontSize: '0.6rem' }}>DEFENSE READY</span>
                    </div>
                    <DetailRow label="Proposed Category" value={r.blueTeamProposal.proposedCategory} />
                    <div>
                       <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Suggested Pattern</div>
                       <code style={{ display: 'block', padding: '0.5rem', background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                         {r.blueTeamProposal.proposedRulePattern}
                       </code>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                       <ScoreBox label="Severity" value={r.blueTeamProposal.severity} />
                       <ScoreBox label="Confidence" value={`${r.blueTeamProposal.confidence}%`} />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rationale</div>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{r.blueTeamProposal.rationale}</p>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>Blue Team proposes a defensive detection idea. It is not an active production rule.</p>
                  </div>
                </SectionCard>

                {/* 3. Judge */}
                <SectionCard 
                  title="Panel 3 — Judge" 
                  subtitle="Quality Advisory Pass" 
                  style={{ borderTop: '4px solid #10B981' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: '#ECFDF5', color: '#10B981', border: '1px solid #D1FAE5' }}>JUDGE AGENT</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--escalate)' }}>ADVISORY — not final approval</span>
                    </div>
                    <DetailRow label="Recommendation" value={r.judgeRecommendation.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')} valueColor="var(--accent)" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <ScoreBox label="Realism" value={r.judgeRecommendation.realismScore} />
                          <ScoreBox label="Coverage" value={r.judgeRecommendation.coverageScore} />
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <ScoreBox label="FP Risk" value={r.judgeRecommendation.falsePositiveRiskScore} />
                          <ScoreBox label="Safety" value={r.judgeRecommendation.safetyScore} />
                       </div>
                    </div>
                    <div>
                       <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reasons</div>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', margin: 0, lineHeight: 1.4 }}>{r.judgeRecommendation.reasons.join('. ')}</p>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>Judge provides quality scoring only. It cannot approve or deploy rules.</p>
                  </div>
                </SectionCard>

                {/* 4. Curator */}
                <SectionCard 
                  title="Panel 4 — Curator" 
                  subtitle="Rule Vault Formatting" 
                  style={{ borderTop: '4px solid #8B5CF6' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #EDE9FE' }}>CURATOR AGENT</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--block)' }}>CANDIDATE ONLY</span>
                    </div>
                    <DetailRow label="Vault ID" value={r.curatedRuleVaultEntry.id.split('-').pop()} />
                    <DetailRow label="Status" value={r.curatedRuleVaultEntry.status} />
                    <DetailRow label="Next Step" value={r.recommendedNextStep.replace(/_/g, ' ')} valueColor="var(--human)" />
                    <div>
                       <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Vault Pattern</div>
                       <code style={{ display: 'block', padding: '0.5rem', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem' }}>
                         {r.curatedRuleVaultEntry.suggestedPattern}
                       </code>
                    </div>
                    <DetailRow label="Provenance" value="Deterministic trace + Agent synthesis" />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>Curator converts Red + Blue + Judge outputs into a review-ready Rule Vault candidate.</p>
                  </div>
                </SectionCard>
              </div>
            </div>
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
      <input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(parseInt(e.target.value))} disabled={disabled} style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}:</span>
      <span style={{ fontWeight: 800, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{label}</span>
      <span style={{ fontWeight: 900, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, valueColor, children }: { label: string; value?: string | number; valueColor?: string; children?: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.75rem' }}>
      <strong style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}: </strong>
      {children || <span style={{ color: valueColor || 'var(--text)', fontWeight: 700 }}>{value}</span>}
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'var(--surface-muted)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function PipelineStep({ label, status, highlight }: { label: string; status: string; highlight?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', opacity: highlight ? 1 : 0.8 }}>
      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: highlight ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.5rem', fontWeight: 900, color: status === 'MISSED' ? 'var(--block)' : status === 'DETECTED' ? 'var(--safe)' : 'var(--text)' }}>{status}</div>
    </div>
  );
}

function PipelineArrow() {
  return <div style={{ fontSize: '0.8rem', color: 'var(--border)', fontWeight: 300 }}>→</div>;
}
