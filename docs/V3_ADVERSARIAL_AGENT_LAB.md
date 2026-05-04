# SOCGuard AI V3: Adversarial Agent Lab

## 1. Vision
SOCGuard AI V3 evolves the platform into a continuous **Adversarial Evaluation Framework**. While V1 focused on static detection and V2 on controlled update pipelines, V3 introduces an automated but human-governed "Red vs. Blue" simulation environment.

The goal of V3 is to stay ahead of evolving Prompt Injection techniques by simulating the adversarial lifecycle in a sanitized, safe, and auditable sandbox.

## 2. Purpose
*   **Adversarial Resilience**: Stress-test SOCGuard detection rules against novel, synthesized attack variants.
*   **Controlled Benchmarking**: Expand the academic benchmark with high-quality, human-vetted adversarial cases.
*   **Defense Prototyping**: Accelerate the creation of candidate rules through collaborative agent interaction.
*   **Safety Validation**: Ensure that even synthesized attacks are non-operational and redacted for safety.

## 3. High-Level Architecture
V3 operates as an **offline research lab** composed of three specialized AI roles and one mandatory human authority:

1.  **Red Team Agent**: Responsible for discovering and synthesizing new attack patterns based on research notes or missed detections.
2.  **Blue Team Agent**: Responsible for analyzing the Red Team's output and proposing precise, deterministic detection signatures.
3.  **Judge Agent**: Responsible for evaluating the effectiveness of the proposed defenses and the realism of the attacks.
4.  **Human Reviewer (FINAL AUTHORITY)**: Validates all agent outputs. No rule or benchmark case enters the system without explicit human approval.

## 4. No Uncontrolled Learning
V3 does NOT implement an "auto-learning" loop. Instead, it provides a structured environment for **Human-Approved Rule Evolution**.
*   The system does not learn directly from production logs.
*   Agents only propose; humans decide.
*   The output is a versioned Rule Pack or an expanded Benchmark dataset.

## 5. Security & Safety First
The Adversarial Agent Lab is a **defensive security tool**. It implements a strict "Sanitization Layer" that ensures all adversarial outputs are non-operational. We use placeholders (e.g., `[REDACTED_SECRET]`) to prevent the generation of harmful or exploitable payloads.

See [RED_BLUE_JUDGE_WORKFLOW.md](./RED_BLUE_JUDGE_WORKFLOW.md) for role details and [HUMAN_REVIEW_GOVERNANCE.md](./HUMAN_REVIEW_GOVERNANCE.md) for safety policies.
