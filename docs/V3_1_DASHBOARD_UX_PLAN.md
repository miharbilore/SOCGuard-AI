# V3.1: Modern SOC/SIEM Dashboard UX Plan

## Overview
The goal of V3.1 is to evolve the SOCGuard AI interface from a research-centric prototype into a professional, cohesive SOC/SIEM-style dashboard. This update focuses on visual excellence, risk-based prioritization, and the clear separation of AI-generated advisory outputs from human-validated decisions.

## Design Philosophy: "The SIEM Aesthetic"
- **Dark Mode First**: Deep charcoal backgrounds (#0B0E14) with high-contrast text and vibrant accents.
- **Risk-Centric Colors**: 
  - Critical: `#EF4444` (Red)
  - High: `#F97316` (Orange)
  - Medium: `#FACC15` (Yellow)
  - Low: `#3B82F6` (Blue)
  - Safe/Valid: `#22C55E` (Green)
- **Glassmorphism & Depth**: Subtle borders and blurs to distinguish dashboard cards.
- **Typography**: Clean, monospace-leaning fonts for log data (Inter/Roboto Mono) to maintain professional utility.

## 1. Command Center (`/`)
*The "Glass Pane" for the entire security posture.*
- **Overview Metrics**: Active alerts, current risk score, 24h trend lines.
- **Risk Posture Cards**: High-level summary of policy coverage and detection efficacy.
- **Quick Links**: Direct actions to "Analyze Logs", "Review Lab Proposals", or "Update Rule Packs".
- **Recent Findings**: A feed of the latest detections from the Log Analyzer.
- **Review Queue Summary**: Counter of pending human-review tasks.

## 2. Log Analyzer (`/analyzer`)
*Refinement of V1 core functionality.*
- **Input Terminal**: Sleek code-editor style input for raw logs.
- **Analysis View**: Real-time streaming-style analysis (V1/V2/V3 logic).
- **Evidence Panel**: Highlighting specific log fragments that triggered rules.
- **Scoring Breakdown**: Detailed view of how the final risk score was calculated.
- **Policy Decision**: Clearly labeled outcome (Block/Monitor/Allow) with **Advisory** tags.

## 3. Evaluation Dashboard (`/evaluation`)
*Science and Metrics.*
- **Benchmark Metrics**: Precision, Recall, F1, and Macro-F1 scores.
- **Confusion Matrix**: Interactive visual grid showing classification performance.
- **Per-Category Coverage**: Breakdown of detection performance by threat type (e.g., Indirect Injection, Jailbreak).
- **Per-Difficulty Results**: Performance across Easy, Medium, and Hard datasets.

## 4. Rule Intelligence (`/v2`)
*The Research & Development hub for detection rules.*
- **Threat Intel Intake**: Feed of recent adversarial patterns (mocked/research-based).
- **Candidate Rules**: View of rules currently in the "Research" stage.
- **Regression Results**: Summary of how new rules affect current benchmarks.
- **Draft Rule Packs**: Bundling candidates for review.

## 5. Adversarial Lab (`/adversarial-lab`)
*The Red/Blue Team Agent interaction space.*
- **Red Team Candidates**: Displaying generated attack payloads.
- **Blue Team Proposals**: Proposed defenses for specific payloads.
- **Judge Advisory Scores**: Automated scoring of interactions (always labeled **AI Advisory**).
- **Human Review Actions**: Large, clear buttons for "Send to Review Queue".
- **Promotion Previews**: Visualizing what a record looks like if promoted to the benchmark.

## 6. Review Queue (`/review-queue`)
*The human-in-the-loop gatekeeper.*
- **Pending Records**: List of records from the Adversarial Lab waiting for approval.
- **Approve/Reject/Needs Revision**: Standardized workflow actions.
- **Reviewer Notes**: Internal audit notes for why a decision was made.
- **Promotion Eligibility**: Visual indicators showing if a record meets the quality bar for V3 datasets.

## 7. Rule Packs (`/rule-packs`)
*Production-ready detection assets.*
- **Draft Packs**: Collections of rules under final review.
- **Approved Packs**: Production-ready rules (Versioned).
- **Versioning**: Clear semantic versioning (v1.0.1, etc.).
- **Status Toggles**: Inactive vs. Active (simulated environment state).
- **Future Signed Packs**: UI placeholders for cryptographically signed rule bundles.

## 8. Audit Trail (`/audit`)
*Governance and Provenance.*
- **Action History**: Data-grid of every significant action (Rule update, Review approval).
- **Actor/Role**: Identify who (system or user) performed the action.
- **Timestamp**: ISO-standard logging.
- **Notes/Context**: Links to specific records or policy IDs.

---

## Navigation Model
- **Persistent Sidebar**: Icon-based navigation with labels on the left.
- **Top Utility Bar**: Search bar (global), System Status, User/Role indicator.
- **Breadcrumbs**: Clear path indicators (e.g., `Rule Packs > Pack Alpha > Rule ID-99`).

## Component Reuse Plan
- **DashboardCard**: A standard container with title, subheader, and slot for content.
- **RiskBadge**: Color-coded status labels (Critical, High, etc.).
- **DataTable**: Searchable, sortable table used in Audit, Review Queue, and Rule Packs.
- **AdvisoryLabel**: A standard `(ADVISORY)` tag that must accompany every non-human-finalized output.
- **HumanActionBlock**: A visually distinct (possibly light-bordered) section for human inputs.

## Governance & Safety Labeling
1. **Advisory Disclaimer**: The footer must state: "All AI-generated scores and suggestions are ADVISORY and must be reviewed by a human analyst before production use."
2. **Visual Emphasis**: Human-finalized records will have a "Verified" green checkmark.
3. **No Hidden Logic**: Hovering over any score must show the rule/logic that generated it.
