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
        <header className="page-header">
          <div className="header-content">
            <div className="subtitle">Security Operations & Research Hub</div>
            <h1>SOCGuard AI Command Center</h1>
            <p className="description">
              Centralized view of detection performance, research candidates, and policy governance.
            </p>
          </div>
        </header>

        <section className="metrics-overview">
          <div className="metrics-grid">
            <MetricCard 
              label="Detection Engine" 
              value="Online" 
              color="var(--safe)" 
              subValue="Deterministic v3.1 active"
            />
            <MetricCard 
              label="Evaluation Accuracy" 
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
              subValue="Action required in Review Queue"
            />
            <MetricCard 
              label="V3 Lab Records" 
              value={labRecords.length} 
              subValue="Adversarial agent candidates"
            />
          </div>
        </section>

        <section className="quick-actions" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <ActionCard 
              title="Analyze a Log" 
              description="Test raw log strings against detection rules." 
              href="/analyzer" 
              icon="🔍" 
            />
            <ActionCard 
              title="View Evaluation" 
              description="Deep dive into academic performance metrics." 
              href="/evaluation" 
              icon="📈" 
            />
            <ActionCard 
              title="Rule Intelligence" 
              description="Manage candidate rules and intelligence intake." 
              href="/v2" 
              icon="🧠" 
            />
            <ActionCard 
              title="Adversarial Lab" 
              description="Agent-based attack/defense research sandbox." 
              href="/adversarial-lab" 
              icon="🧪" 
            />
            <ActionCard 
              title="Review Queue" 
              description="Validate and promote research candidates." 
              href="/review-queue" 
              icon="📥" 
              badge={pendingReviews > 0 ? pendingReviews.toString() : undefined}
            />
            <ActionCard 
              title="Rule Packs" 
              description="Inspect production-ready detection bundles." 
              href="/rule-packs" 
              icon="📦" 
            />
          </div>
        </section>

        <div className="dashboard-row" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <SectionCard title="Recent Findings Summary" subtitle="Latest high-risk detections from evaluation set">
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
                  {evaluation?.results.filter(r => r.policyDecision !== 'SAFE').slice(0, 5).map(res => (
                    <tr key={res.id}>
                      <td><code>{res.inputLog.id}</code></td>
                      <td>
                        <span className={`badge badge-${res.policyDecision}`}>
                          {res.policyDecision}
                        </span>
                      </td>
                      <td><strong>{res.riskScore.score}</strong></td>
                      <td><span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{res.findings[0]?.category || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/evaluation" className="view-all">View all evaluation results →</Link>
          </SectionCard>

          <SectionCard title="Lab Promotion Status" subtitle="Eligibility for benchmark integration">
             <div className="promotion-stats">
                <div className="promo-item">
                  <span className="promo-label">Benchmark Ready</span>
                  <span className="promo-value">{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_BENCHMARK' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
                </div>
                <div className="promo-item">
                  <span className="promo-label">Rule Ready</span>
                  <span className="promo-value">{labRecords.filter(r => r.humanReviewDecision?.decision === 'APPROVE_FOR_RULE_CANDIDATE' || r.humanReviewDecision?.decision === 'APPROVE_FOR_BOTH').length}</span>
                </div>
                <div className="promo-item">
                  <span className="promo-label">Under Revision</span>
                  <span className="promo-value">{labRecords.filter(r => r.humanReviewDecision?.decision === 'NEEDS_REVISION').length}</span>
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
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .view-all {
          display: block;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
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
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }
        .promo-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .promo-value {
          font-weight: 700;
          color: white;
        }
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
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .action-card:hover {
          background: rgba(59, 130, 246, 0.05);
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .action-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
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
          color: white;
          font-size: 1rem;
          font-weight: 700;
        }
        .action-badge {
          background: var(--block);
          color: white;
          font-size: 0.7rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-weight: 700;
        }
        .action-desc {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.4;
        }
      `}</style>
    </Link>
  );
}
