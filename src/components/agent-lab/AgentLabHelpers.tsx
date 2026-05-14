"use client";

import React from 'react';

/* ── Setting Input ── */

interface SettingInputProps {
  label: string;
  value: number;
  min: number;
  max?: number;
  step?: number;
  disabled: boolean;
  onChange: (v: number) => void;
}

export function SettingInput({ label, value, min, max, step, disabled, onChange }: SettingInputProps) {
  return (
    <div>
      <label className="al-input-label">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="al-input-number"
      />
    </div>
  );
}

/* ── Status Row ── */

interface StatusRowProps {
  label: string;
  value: string;
  color?: string;
}

export function StatusRow({ label, value, color }: StatusRowProps) {
  return (
    <div className="al-status-row">
      <span>{label}:</span>
      <span className="al-status-value" style={{ color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

/* ── Summary Row ── */

interface SummaryRowProps {
  label: string;
  value: string | number;
  color?: string;
}

export function SummaryRow({ label, value, color }: SummaryRowProps) {
  return (
    <div className="al-summary-row">
      <span className="al-summary-label">{label}</span>
      <span className="al-summary-value" style={{ color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

/* ── Detail Row ── */

interface DetailRowProps {
  label: string;
  value?: string | number;
  valueColor?: string;
  children?: React.ReactNode;
}

export function DetailRow({ label, value, valueColor, children }: DetailRowProps) {
  return (
    <div className="al-detail-row">
      <strong className="al-detail-label">{label}: </strong>
      {children || <span className="al-detail-value" style={{ color: valueColor || 'var(--text)' }}>{value}</span>}
    </div>
  );
}

/* ── Score Box ── */

interface ScoreBoxProps {
  label: string;
  value: string | number;
}

export function ScoreBox({ label, value }: ScoreBoxProps) {
  return (
    <div className="al-score-box">
      <div className="al-score-label">{label}</div>
      <div className="al-score-value">{value}</div>
    </div>
  );
}

/* ── Pipeline Step ── */

interface PipelineStepProps {
  label: string;
  status: string;
  highlight?: boolean;
}

export function PipelineStep({ label, status, highlight }: PipelineStepProps) {
  const statusColor = status === 'MISSED' ? 'var(--block)' : status === 'DETECTED' ? 'var(--safe)' : 'var(--text)';
  return (
    <div className="al-pipeline-step" style={{ opacity: highlight ? 1 : 0.8 }}>
      <div className="al-pipeline-step-label" style={{ color: highlight ? 'var(--accent)' : 'var(--text-muted)' }}>{label}</div>
      <div className="al-pipeline-step-status" style={{ color: statusColor }}>{status}</div>
    </div>
  );
}

/* ── Pipeline Arrow ── */

export function PipelineArrow() {
  return <div className="al-pipeline-arrow">→</div>;
}

/* ── Mode Indicator ── */

interface ModeIndicatorProps {
  serverStatus: {
    providerMode: string;
    enableLLMAgents: boolean;
    hasPrimaryApiKey: boolean;
  } | null;
}

export function ModeIndicator({ serverStatus }: ModeIndicatorProps) {
  if (!serverStatus) {
    return (
      <div className="al-mode-indicator al-mode-loading">
        <div className="al-mode-dot" />
        <span>Checking server status...</span>
      </div>
    );
  }

  const isLLM = serverStatus.enableLLMAgents && serverStatus.hasPrimaryApiKey;
  const mode = isLLM ? 'API-BACKED' : 'MOCK';

  return (
    <div className={`al-mode-indicator ${isLLM ? 'al-mode-llm' : 'al-mode-mock'}`}>
      <div className="al-mode-dot" />
      <div className="al-mode-content">
        <span className="al-mode-label">{mode} MODE</span>
        <span className="al-mode-desc">
          {isLLM
            ? 'Single Cycle uses server-side LLM agents'
            : 'All agents use deterministic mock responses'}
        </span>
      </div>
    </div>
  );
}
