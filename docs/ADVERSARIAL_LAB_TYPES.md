# SOCGuard AI: Adversarial Lab Types

## 1. Overview
The **Adversarial Agent Lab** (V3) uses a set of strictly defined data models to manage the lifecycle of synthesized attack patterns and defense proposals. These types ensure that the interaction between the Red Team, Blue Team, Judge, and Human Reviewer is type-safe, auditable, and secure.

## 2. Core Models

### 2.1 Red Team Candidate (`RedTeamCandidate`)
Represents a synthesized adversarial prompt. 
*   **Safety Restriction**: Must only store **sanitized** content. No real malware, phishing, or exploitable payloads are permitted.
*   **Purpose**: To provide a research-oriented test case for evaluating detection resilience.

### 2.2 Blue Team Proposal (`BlueTeamProposal`)
Represents a suggested defense strategy.
*   **Isolation**: These proposals are **offline**. They do not modify the active production `DETERMINISTIC_RULES`.
*   **Context**: Includes hard-negative suggestions to prevent false positive regressions.

### 2.3 Judge Recommendation (`JudgeRecommendation`)
An automated advisory score and recommendation.
*   **Advisory Only**: The Judge has no authority to approve or activate rules. It serves as a quality gate for the human analyst.

### 2.4 Human Review Decision (`HumanReviewDecision`)
The final authority in the pipeline.
*   **Mandatory Audit**: `reviewerId` and `reviewerNotes` are required fields. Decisions made without these fields will trigger an audit failure.
*   **Governance**: Humans can promote research cases to the **Academic Benchmark** or suggest them for the **Rule Candidate Pipeline** (V2).

## 3. Agent Boundaries
*   **Red Team** is bounded by a **Sanitization Layer**.
*   **Blue Team** is bounded by **Regression Testing**.
*   **Judge** is bounded by **Advisory Status** (no write access to rules).
*   **Human Reviewer** is the only role capable of promoting content from research into the versioned rule pack workflow.

## 4. Why Production Rules are not Mutated
SOCGuard AI maintains a strict separation between **Research (V3)**, **Governance (V2)**, and **Production (V1)**.
*   V3 (Adversarial Lab) generates **Lab Records**.
*   V2 (Rule Pack Pipeline) consumes **Approved Candidates** from V3 (after human review).
*   V1 (Detection Engine) only loads **Signed and Versioned Rule Packs** (V2 output).

This multi-layer isolation prevents AI-driven rule poisoning and ensures that the system's security logic remains deterministic and auditable.
