"use client";

import SectionCard from '@/components/dashboard/SectionCard';
import { AgentLabCycleRecord } from '@/modules/socguard/agent-adapters';
import { DetailRow, ScoreBox, PipelineStep, PipelineArrow } from './AgentLabHelpers';

interface AgentLabWorkflowProps {
  record: AgentLabCycleRecord;
}

/**
 * 4-Panel Workflow visualization for a selected Agent Lab cycle record.
 * Displays: Pipeline strip → V1 detection summary → Red/Blue/Judge/Curator panels.
 */
export default function AgentLabWorkflow({ record: r }: AgentLabWorkflowProps) {
  return (
    <div className="al-workflow">
      {/* Pipeline Strip */}
      <div className="al-pipeline-strip">
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
      <div
        className="al-detection-strip"
        style={{
          borderColor: r.wasDetected ? 'var(--safe)' : 'var(--block)',
          background: r.wasDetected ? 'var(--safe-bg)' : 'var(--block-bg)',
        }}
      >
        <div>
          <div className="al-detection-title" style={{ color: r.wasDetected ? 'var(--safe)' : 'var(--block)' }}>
            {r.wasDetected ? '✓ DETECTED BY V1' : '⚠ MISSED BY V1 — needs rule candidate'}
          </div>
          <div className="al-detection-summary">{r.analysisResult.explanation.summary}</div>
        </div>
        <div className="al-detection-score">
          <div className="al-detection-score-value" style={{ color: r.riskScore > 70 ? 'var(--block)' : 'var(--text)' }}>
            {r.riskScore}
          </div>
          <div className="al-detection-score-label">Risk Score</div>
        </div>
      </div>

      {/* The 4 Panels */}
      <div className="al-panels-grid">
        {/* 1. Red Team */}
        <SectionCard title="Panel 1 — Red Team" subtitle="Attack Candidate Synthesis" style={{ borderTop: '4px solid #F43F5E' }}>
          <div className="al-panel-content">
            <div className="al-panel-header">
              <span className="badge al-badge-red">RED TEAM AGENT</span>
              <code className="al-panel-id">{r.redTeamCandidate.id}</code>
            </div>
            <DetailRow label="Attack Type" value={r.redTeamCandidate.attackType} />
            <DetailRow label="Language" value={r.redTeamCandidate.language || 'UNKNOWN'} />
            <DetailRow label="Safety" value={r.redTeamCandidate.safetyStatus} valueColor="var(--safe)" />
            <div>
              <div className="al-field-label">Sanitized Sample</div>
              <code className="al-code-block al-code-dark">{r.redTeamCandidate.sanitizedPrompt}</code>
            </div>
            <DetailRow label="Target Weakness" value={r.redTeamCandidate.targetWeakness} />
            <p className="al-panel-footer-note">Red Team generates a sanitized adversarial incident log. It never stores raw harmful content.</p>
          </div>
        </SectionCard>

        {/* 2. Blue Team */}
        <SectionCard title="Panel 2 — Blue Team" subtitle="Defense Proposal Synthesis" style={{ borderTop: '4px solid #3B82F6' }}>
          <div className="al-panel-content">
            <div className="al-panel-header">
              <span className="badge al-badge-blue">BLUE TEAM AGENT</span>
              <span className="badge badge-SAFE al-badge-sm">DEFENSE READY</span>
            </div>
            <DetailRow label="Proposed Category" value={r.blueTeamProposal.proposedCategory} />
            <div>
              <div className="al-field-label">Suggested Pattern</div>
              <code className="al-code-block al-code-accent">{r.blueTeamProposal.proposedRulePattern}</code>
            </div>
            <div className="al-score-grid-2">
              <ScoreBox label="Severity" value={r.blueTeamProposal.severity} />
              <ScoreBox label="Confidence" value={`${(r.blueTeamProposal.confidence * 100).toFixed(0)}%`} />
            </div>
            <div>
              <div className="al-field-label">Rationale</div>
              <p className="al-rationale-text">{r.blueTeamProposal.rationale}</p>
            </div>
            <p className="al-panel-footer-note">Blue Team proposes a defensive detection idea. It is not an active production rule.</p>
          </div>
        </SectionCard>

        {/* 3. Judge */}
        <SectionCard title="Panel 3 — Judge" subtitle="Quality Advisory Pass" style={{ borderTop: '4px solid #10B981' }}>
          <div className="al-panel-content">
            <div className="al-panel-header">
              <span className="badge al-badge-green">JUDGE AGENT</span>
              <span className="al-advisory-label">ADVISORY — not final approval</span>
            </div>
            <DetailRow label="Recommendation" value={r.judgeRecommendation.recommendation.replace('RECOMMEND_', '').replace(/_/g, ' ')} valueColor="var(--accent)" />
            <div className="al-score-grid-2x2">
              <div className="al-score-grid-2">
                <ScoreBox label="Realism" value={r.judgeRecommendation.realismScore} />
                <ScoreBox label="Coverage" value={r.judgeRecommendation.coverageScore} />
              </div>
              <div className="al-score-grid-2">
                <ScoreBox label="FP Risk" value={r.judgeRecommendation.falsePositiveRiskScore} />
                <ScoreBox label="Safety" value={r.judgeRecommendation.safetyScore} />
              </div>
            </div>
            <div>
              <div className="al-field-label">Reasons</div>
              <p className="al-rationale-text">{r.judgeRecommendation.reasons.join('. ')}</p>
            </div>
            <p className="al-panel-footer-note">Judge provides quality scoring only. It cannot approve or deploy rules.</p>
          </div>
        </SectionCard>

        {/* 4. Curator */}
        <SectionCard title="Panel 4 — Curator" subtitle="Rule Vault Formatting" style={{ borderTop: '4px solid #8B5CF6' }}>
          <div className="al-panel-content">
            <div className="al-panel-header">
              <span className="badge al-badge-purple">CURATOR AGENT</span>
              <span className="al-candidate-label">CANDIDATE ONLY</span>
            </div>
            <DetailRow label="Vault ID" value={r.curatedRuleVaultEntry.id.split('-').pop()} />
            <DetailRow label="Status" value={r.curatedRuleVaultEntry.status} />
            <DetailRow label="Next Step" value={r.recommendedNextStep.replace(/_/g, ' ')} valueColor="var(--human)" />
            <div>
              <div className="al-field-label">Vault Pattern</div>
              <code className="al-code-block al-code-muted">{r.curatedRuleVaultEntry.suggestedPattern}</code>
            </div>
            <DetailRow label="Provenance" value="Deterministic trace + Agent synthesis" />
            <p className="al-panel-footer-note">Curator converts Red + Blue + Judge outputs into a review-ready Rule Vault candidate.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
