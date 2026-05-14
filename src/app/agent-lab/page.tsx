"use client";

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SectionCard from '@/components/dashboard/SectionCard';
import AgentLabWorkflow from '@/components/agent-lab/AgentLabWorkflow';
import {
  SettingInput,
  StatusRow,
  SummaryRow,
  ModeIndicator,
} from '@/components/agent-lab/AgentLabHelpers';
import {
  runLimitedAgentLabSession,
  AgentLabCycleResult,
  AgentLabSessionResult,
  AgentLabCycleRecord,
  DEFAULT_AGENT_CONFIG,
} from '@/modules/socguard/agent-adapters';
import { createDemoSourceIntelligenceNotes } from '@/modules/socguard/source-intelligence/corpus-builder';

export default function AgentLabRunnerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [useIntelligenceContext, setUseIntelligenceContext] = useState(false);
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

    const sourceContextNotes = useIntelligenceContext
      ? createDemoSourceIntelligenceNotes().filter(n => n.status === 'APPROVED')
      : undefined;

    try {
      const response = await fetch('/api/agent-lab/run-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxCandidates: candidatesPerCycle, sourceContextNotes })
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

    const sourceContextNotes = useIntelligenceContext
      ? createDemoSourceIntelligenceNotes().filter(n => n.status === 'APPROVED')
      : undefined;

    try {
      const sessionResult = await runLimitedAgentLabSession(cycles, intervalMs, candidatesPerCycle, DEFAULT_AGENT_CONFIG, sourceContextNotes);
      setResults(sessionResult);
      setStatusMessage('Session completed.');
    } catch {
      setStatusMessage('Error running session.');
    } finally {
      setIsRunning(false);
    }
  };

  const allRecords = results?.cycleResults.flatMap(c => c.records) || [];

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
        <div className="subtitle">Adversarial Research &amp; Synthesis (V4.1)</div>
        <h1>Agent Lab</h1>
        <p className="description" style={{ margin: '0.25rem 0 0 0' }}>
          Orchestrate attack/defense cycles to generate robust security signatures.
        </p>
      </header>

      <div className="al-page-grid">
        {/* Settings + Summary Column */}
        <div className="al-sidebar">
          <SectionCard title="Runtime Settings" subtitle="Safety Limits">
            <div className="al-settings-col">
              <SettingInput label="Cycles" value={cycles} min={1} max={10} disabled={isRunning} onChange={v => setCycles(v)} />
              <SettingInput label="Candidates" value={candidatesPerCycle} min={1} max={10} disabled={isRunning} onChange={v => setCandidatesPerCycle(v)} />

              <div className="al-checkbox-row">
                <input type="checkbox" id="use-context" checked={useIntelligenceContext} onChange={(e) => setUseIntelligenceContext(e.target.checked)} disabled={isRunning} />
                <label htmlFor="use-context" className="al-checkbox-label">Use Approved Source Intel</label>
              </div>

              {/* Mode Indicator — clear MOCK/LLM distinction */}
              <ModeIndicator serverStatus={serverStatus} />

              <div className="al-status-divider">
                <StatusRow label="LLM Agents" value={serverStatus ? (serverStatus.enableLLMAgents ? 'ENABLED' : 'DISABLED') : '...'} color={serverStatus?.enableLLMAgents ? 'var(--safe)' : 'var(--block)'} />
                <StatusRow label="Key" value={serverStatus?.hasPrimaryApiKey ? 'PRESENT' : 'MISSING'} color="var(--safe)" />
              </div>

              <div className="al-btn-group">
                <button onClick={handleRunSingle} disabled={isRunning} className="btn-primary">Run Single Cycle</button>
                <button onClick={handleRunSession} disabled={isRunning} className="btn-secondary">Run Session (Mock)</button>
              </div>

              {isRunning && <div className="al-running-indicator">{statusMessage}</div>}
            </div>
          </SectionCard>

          {results && (
            <SectionCard title="Session Summary" subtitle="Performance Metrics">
              <div className="al-summary-col">
                <SummaryRow label="Candidates" value={results.totalCandidates} />
                <SummaryRow label="Detected" value={results.detectedCount} color="var(--safe)" />
                <SummaryRow label="Missed" value={results.missedCount} color={results.missedCount > 0 ? 'var(--block)' : undefined} />
                <SummaryRow label="Vault" value={results.curatedEntries.length} color="var(--accent)" />
              </div>
            </SectionCard>
          )}
        </div>

        {/* Results and Workflow Column */}
        <div className="al-main-col">
          {/* Records Table */}
          <SectionCard title="Cycle Records" subtitle="Human review required for all candidates">
            {!results && !isRunning ? (
              <div className="al-empty-state">Start a research cycle to begin synthesis.</div>
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

          {/* 4-Panel Workflow — extracted component */}
          {selectedRecord && <AgentLabWorkflow record={selectedRecord} />}
        </div>
      </div>
    </DashboardShell>
  );
}
