# SOCGuard AI

**A deterministic research platform protecting LLM-based SOC workflows against indirect prompt injection attacks embedded in SIEM logs.**

SOCGuard AI normalizes raw logs, generates risk findings using deterministic rules, makes decisions via a scoring and policy engine, and presents findings in an explainable manner. It acts as an advanced research platform featuring an **Adversarial Lab**, **Rule Vault**, and **Audit Trail** to simulate comprehensive red/blue/judge/curator workflows.

---

## 🎯 Purpose and Scope

- **Purpose:** To robustly protect LLM-assisted SOC agents from sophisticated, indirect prompt injection attempts hidden within log payloads.
- **Scope:** Deterministic detection, risk scoring, policy decision formulation, explainability, and rule governance.
- **Out of Scope:** Acting as a general-purpose chatbot, a full-fledged SIEM/EDR platform, or an ultimate decision-making LLM engine.

## ⚙️ Architecture Flow (Deterministic Pipeline)

The core pipeline processes logs through a rigorous deterministic sequence:

1. **Raw Log Input** → 2. **Preprocessing** (Decoding/Normalization) → 3. **Detection** (Regex/Heuristics) →  
4. **Scoring** (0-100 Risk Index) → 5. **Policy** (BLOCK / HUMAN_REVIEW / ESCALATE / SAFE) →  
6. **Explainability** (Evidence Generation) → 7. **UI/API Output**

## 🧩 Key Modules

- **dataset**: Realistic SIEM-like sample dataset for evaluation.
- **preprocessing**: Multi-layered decoding and log normalization.
- **detection**: Robust deterministic signature and pattern sets.
- **scoring**: Weights analytical findings and converts them into an actionable risk score.
- **policy**: Maps the calculated risk score to a decisive action.
- **explainability**: Generates transparent reasoning and evidence outputs.
- **agent-adapters**: Mock and LLM-based agent adapters for scenario testing.
- **rule-vault**: Human-approved governance layer for managing candidate signatures.
- **audit**: Comprehensive traceability and audit logging.

## 🖥️ UI Pages (Next.js)

Our intuitive interface is divided into functional domains:

- **Command Center**: High-level system metrics and navigation hub.
- **Log Analyzer**: Granular, single-log detection and analysis.
- **Evaluation**: Benchmark metrics and performance tracking.
- **Adversarial Lab**: End-to-end red/blue/judge simulated workflows.
- **Agent Lab**: Controlled agent execution environments (Mock or API-driven).
- **Rule Vault**: Candidate signature records, curation, and review.
- **Audit Trail**: Immutable audit log of all system and user actions.

---

## 🚀 Installation

### 1) Dependencies
```bash
npm install
```

### 2) Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your **database** and optional **LLM** settings within `.env.local`:

```env
# SQLite (Example configuration)
DATABASE_URL="file:./prisma/dev.db"

# LLM (Optional, required for API-backed mode)
ENABLE_LLM_AGENTS=true
LLM_PROVIDER=GROQ
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
LLM_API_KEY=<your-server-side-api-key>
```

### 3) Prisma Database Migration
Initialize your database schema:
```bash
npx prisma migrate dev --name init
```

### 4) Development Server
Start the Next.js development server:
```bash
npm run dev
```

---

## 🧠 LLM Modes (Mock vs API)

SOCGuard AI can operate in different modes depending on your research needs:

- **Default Mode:** `MOCK` (Zero API calls, entirely local).
- **API-backed Mode:** Requires `ENABLE_LLM_AGENTS=true` and a valid `LLM_API_KEY`.
- **Agent Lab Dynamics:** The "Run Single Cycle" feature makes real LLM API calls when API-backed is enabled, whereas "Run Session (Mock)" enforces deterministic local processing.

## 💾 Persistence (Database)

We utilize **Prisma + SQLite** to ensure persistence across sessions.
**Agent Lab sessions**, the **Rule Vault**, and the **Audit Trail** are fully persistent.
*Note: If `DATABASE_URL` is undefined or improperly configured, these API endpoints will fail.*

## 🛠️ Common Commands

```bash
# Run code linter
npm run lint

# Build for production
npm run build

# Execute test suite
npm test
```

## 📚 Documentation

For an in-depth look at our design philosophy and research notes, please explore the `docs/` folder:

- **Core Concepts:** `ARCHITECTURE.md`, `DETECTION_ENGINE.md`, `POLICY_ENGINE.md`
- **Workflows:** `V4_AGENT_PIPELINE.md`, `RULE_VAULT.md`, `HUMAN_REVIEW_WORKFLOW.md`

## 🛡️ Security and Governance Principles

- **No Auto-Approval**: All production-grade rules require explicit human verification.
- **Zero Trust for LLMs**: All LLM outputs are treated as untrusted and potentially unsafe data.
- **Secret Management**: API keys and sensitive credentials are kept strictly server-side.
