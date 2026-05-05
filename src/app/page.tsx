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
      <div className="command-center">
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', color: 'var(--accent)', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '2.5rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ</span>
          <span>Research PoC. Deterministic-first architecture. All decisions are transient and demo-only.</span>
        </div>

        <header className="page-header">
          <div className="header-content">
            <div className="subtitle">Security Operations & Research Hub</div>
            <h1>Command Center</h1>
            <p className="description" style={{ margin: '0' }}>
              Centralized view of detection performance, research candidates, and policy governance.
            </p>
          </div>
        </header>

        <section className="metrics-overview">
          <div className="metrics-grid">
            <MetricCard 
              label="Detection Engine" 
              value="v3.1 Online" 
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
              color="var(--block)"
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

        <section className="quick-actions" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Navigation Hub</h2>
          <div className="actions-grid">
            <ActionCard 
              title="Log Analyzer" 
              description="Test raw log strings against detection rules." 
              href="/analyzer" 
              icon="🔍" 
            />
            <ActionCard 
              title="Benchmark Evaluation" 
              description="Academic performance metrics and logs." 
              href="/evaluation" 
              icon="📈" 
            />
            <ActionCard 
              title="Rule Intelligence" 
              description="Candidate rules and intel intake." 
              href="/v2" 
              icon="🧠" 
            />
            <ActionCard 
              title="Adversarial Lab" 
              description="Red/Blue Team research sandbox." 
              href="/adversarial-lab" 
              icon="🧪" 
            />
            <ActionCard 
              title="Review Queue" 
              description="Promote research candidates." 
              href="/review-queue" 
              icon="📥" 
              badge={pendingReviews > 0 ? pendingReviews.toString() : undefined}
            />
            <ActionCard 
              title="Rule Packs" 
              description="Inspect versioned detection bundles." 
              href="/rule-packs" 
              icon="📦" 
            />
            <ActionCard 
              title="Agent Lab Runner" 
              description="Orchestrate automated agent research." 
              href="/agent-lab" 
              icon="🤖" 
            />
            <ActionCard 
              title="Rule Vault" 
              description="Candidate registry for human audit." 
              href="/rule-vault" 
              icon="🏦" 
            />
          </div>
        </section>

        <div className="dashboard-row" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem' }}>
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
                      <td><strong style={{ fontSize: '1rem' }}>{res.riskScore.score}</strong></td>
                      <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)' }}>{res.findings[0]?.category || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <Link href="/evaluation" className="view-all">Explore all evaluation metrics →</Link>
            </div>
          </SectionCard>

          <SectionCard title="Lab Governance Status" subtitle="Adversarial promotion readiness">
             <div className="promotion-stats">
                <div className="promo-item">
                  <div className="promo-info">
                    <span className="promo-label">Benchmark Ready</span>
                    <span className="promo-sub">Approved for datasets</span>
                  </div>
                  <span className="promo-value safe">{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_BENCHMARK' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
                </div>
                <div className="promo-item">
                  <div className="promo-info">
                    <span className="promo-label">Rule Ready</span>
                    <span className="promo-sub">Approved for packs</span>
                  </div>
                  <span className="promo-value accent">{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_RULE_CANDIDATE' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
                </div>
                <div className="promo-item">
                  <div className="promo-info">
                    <span className="promo-label">Under Revision</span>
                    <span className="promo-sub">Needs human update</span>
                  </div>
                  <span className="promo-value warning">{labRecords.filter(r => r.humanReviewDecision?.decision === 'NEEDS_REVISION').length}</span>
                </div>
             </div>
          </SectionCard>
        </div>
      </div>

      <style jsx>{`
        .command-center {
          display: flex;
          flex-direction: column;
        }
        .page-header {
          margin-bottom: 3rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .view-all {
          font-size: 0.8rem;
          color: var(--accent);
          text-decoration: none;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .view-all:hover {
          text-decoration: underline;
        }
        .promotion-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .promo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .promo-info { display: flex; flex-direction: column; }
        .promo-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text);
        }
        .promo-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .promo-value {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .promo-value.safe { color: var(--safe); }
        .promo-value.accent { color: var(--accent); }
        .promo-value.warning { color: var(--escalate); }
      `}</style>
    </DashboardShell>
  );
}

function ActionCard({ title, description, href, icon, badge }: { title: string, description: string, href: string, icon: string, badge?: string }) {
  return (
    <Link href={href} className="action-card">
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <div className="action-title-row">
          <h4 className="action-title">{title}</h4>
          {badge && <span className="action-badge">{badge}</span>}
        </div>
        <p className="action-desc">{description}</p>
      </div>
      <style jsx>{`
        .action-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .action-card:hover {
          background: rgba(59, 130, 246, 0.04);
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .action-icon {
          font-size: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .action-card:hover .action-icon {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
          transform: scale(1.05);
        }
        .action-content {
          flex: 1;
        }
        .action-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .action-title {
          margin: 0;
          color: var(--text);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .action-badge {
          background: var(--block);
          color: white;
          font-size: 0.65rem;
          padding: 0.125rem 0.4rem;
          border-radius: 4px;
          font-weight: 800;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }
        .action-desc {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.8rem;
          line-height: 1.4;
          font-weight: 500;
        }
      `}</style>
    </Link>
  );
}
