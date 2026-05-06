"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import SectionCard from '@/components/dashboard/SectionCard';
import { analyzeSampleDataset } from '@/modules/socguard/demo';
import { createDefaultAdversarialLabRecords } from '@/modules/socguard/adversarial-lab';
import { DatasetEvaluation } from '@/modules/socguard/types';
import { AdversarialLabRecord } from '@/modules/socguard/adversarial-lab/adversarial-types';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function CommandCenter() {
  const [evaluation, setEvaluation] = useState<DatasetEvaluation | null>(null);
  const [labRecords, setLabRecords] = useState<AdversarialLabRecord[]>([]);

  useEffect(() => {
    // Initialize data
    const evalResults = analyzeSampleDataset();
    setEvaluation(evalResults);
    
    const records = createDefaultAdversarialLabRecords();
    setLabRecords(records);
  }, []);

  const pendingReviews = labRecords.filter(r => !r.humanReviewDecision).length;
  const toPct = (val: number) => (val * 100).toFixed(1) + '%';

  return (
    <DashboardShell>
      {/* Info Banner */}
      <div className="governance-banner info" style={{ marginBottom: '1.5rem' }}>
        <span>ℹ</span>
        <span>Research PoC. Deterministic-first architecture. All decisions are transient and demo-only.</span>
      </div>

      {/* Page Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div className="subtitle">Security Operations & Research Hub</div>
        <h1>Command Center</h1>
        <p className="description" style={{ margin: '0.5rem 0 0 0' }}>
          Centralized view of detection performance, research candidates, and policy governance.
        </p>
      </header>

      {/* Metrics */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="metrics-grid">
          <MetricCard 
            label="Detection Engine" 
            value="v4.1 Online" 
            color="var(--safe)" 
            subValue="Deterministic pipeline active"
          />
          <MetricCard 
            label="Global Accuracy" 
            value={evaluation ? toPct(evaluation.metrics.accuracy) : '...'} 
            trend="up"
            subValue={`${evaluation?.metrics.totalLogs || 0} samples analyzed`}
          />
          <MetricCard 
            label="Precision" 
            value={evaluation ? toPct(evaluation.metrics.precision) : '...'} 
            color="var(--safe)"
          />
          <MetricCard 
            label="Recall" 
            value={evaluation ? toPct(evaluation.metrics.recall) : '...'} 
            color="var(--escalate)"
          />
          <MetricCard 
            label="F1 Score" 
            value={evaluation ? toPct(evaluation.metrics.f1Score) : '...'} 
            color="var(--accent)"
          />
          <MetricCard 
            label="Avg. Latency" 
            value={evaluation ? `${evaluation.metrics.averageLatencyMs.toFixed(2)}ms` : '...'} 
            subValue="Sub-millisecond target"
          />
          <MetricCard 
            label="Pending Reviews" 
            value={pendingReviews} 
            color={pendingReviews > 0 ? 'var(--escalate)' : 'var(--safe)'}
            subValue="Governance queue backlog"
          />
          <MetricCard 
            label="V3 Lab Records" 
            value={labRecords.length} 
            subValue="Research synthesis depth"
          />
        </div>
      </section>

      {/* Navigation Hub */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Navigation Hub</h2>
        <div className="actions-grid">
          <ActionCard title="Log Analyzer" description="Test raw log strings against detection rules." href="/analyzer" />
          <ActionCard title="Benchmark Evaluation" description="Academic performance metrics and logs." href="/evaluation" />
          <ActionCard title="Rule Intelligence" description="Candidate rules and intel intake." href="/v2" />
          <ActionCard title="Adversarial Lab" description="Red/Blue Team research sandbox." href="/adversarial-lab" />
          <ActionCard title="Review Queue" description="Promote research candidates." href="/review-queue" badge={pendingReviews > 0 ? pendingReviews.toString() : undefined} />
          <ActionCard title="Rule Packs" description="Inspect versioned detection bundles." href="/rule-packs" />
          <ActionCard title="Agent Lab Runner" description="Orchestrate automated agent research." href="/agent-lab" />
          <ActionCard title="Rule Vault" description="Candidate registry for human audit." href="/rule-vault" />
        </div>
      </section>

      {/* Dashboard Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem' }}>
        <SectionCard title="Recent Threat Detections" subtitle="Latest high-risk findings from evaluation pipeline">
          <div className="results-table-container">
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Decision</th>
                  <th>Risk Score</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {evaluation?.results.filter(r => r.policyDecision !== 'SAFE').slice(0, 6).map(res => (
                  <tr key={res.id}>
                    <td><code>{res.inputLog.id}</code></td>
                    <td>
                      <StatusBadge 
                        status={res.policyDecision} 
                        type={res.policyDecision === 'BLOCK' ? 'error' : 'warning'} 
                      />
                    </td>
                    <td><strong>{res.riskScore.score}</strong></td>
                    <td style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)' }}>{res.findings[0]?.category || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Link href="/evaluation" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Explore all evaluation metrics →</Link>
          </div>
        </SectionCard>

        <SectionCard title="Lab Governance Status" subtitle="Adversarial promotion readiness">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <div className="promo-item">
               <div className="promo-info">
                 <span className="promo-label">Benchmark Ready</span>
                 <span className="promo-sub">Approved for datasets</span>
               </div>
               <span className="promo-value" style={{ color: 'var(--safe)' }}>{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_BENCHMARK' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
             </div>
             <div className="promo-item">
               <div className="promo-info">
                 <span className="promo-label">Rule Ready</span>
                 <span className="promo-sub">Approved for packs</span>
               </div>
               <span className="promo-value" style={{ color: 'var(--accent)' }}>{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_RULE_CANDIDATE' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
             </div>
             <div className="promo-item">
               <div className="promo-info">
                 <span className="promo-label">Under Revision</span>
                 <span className="promo-sub">Needs human update</span>
               </div>
               <span className="promo-value" style={{ color: 'var(--escalate)' }}>{labRecords.filter(r => r.humanReviewDecision?.decision === 'NEEDS_REVISION').length}</span>
             </div>
           </div>
        </SectionCard>
      </div>

    </DashboardShell>
  );
}

function ActionCard({ title, description, href, badge }: { title: string, description: string, href: string, badge?: string }) {
  return (
    <Link href={href} className="action-card-link">
      <div className="action-content">
        <div className="action-title-row">
          <h4 className="action-title">{title}</h4>
          {badge && <span className="action-badge">{badge}</span>}
        </div>
        <p className="action-desc">{description}</p>
      </div>
      <span className="action-arrow">→</span>
    </Link>
  );
}
