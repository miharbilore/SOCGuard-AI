# SOCGuard AI: Final Submission Checklist

## 1. Scope & Wording
- [x] Project is clearly defined as a **Deterministic Research PoC**.
- [x] Removed any implication that an LLM is used in the **core decision pipeline**.
- [x] Explicitly stated that SOCGuard is a safeguard **for** LLM-based assistants, not a replacement for SOC analysts or SIEM systems.
- [x] Removed terms like "production-ready" or "detects all prompt injections".

## 2. Determinism & Reproducibility
- [x] Implemented DJB2-based deterministic hashing for Analysis and Finding IDs.
- [x] Standardized thresholds across Risk Scoring and Policy Engines (BLOCK at 80+).
- [x] Multi-pass decoding is bounded (max 2 passes) to ensure deterministic behavior.

## 3. Evaluation Integrity
- [x] Evaluation metrics (Precision, Recall, F1) use ground-truth `label` from the dataset.
- [x] Removed ID prefix dependencies for classification logic.
- [x] Per-difficulty metrics accurately split Benign and Injected denominators.
- [x] Category coverage metrics track expected vs. detected threat categories.

## 4. UI & Explainability
- [x] "Line N/A" displayed correctly for preprocessing findings.
- [x] Suspicious evidence section shows matched text, rule IDs, and confidence.
- [x] Scoring breakdown provides transparent point-by-point calculation.
- [x] Limitations are prominent on the evaluation page and README.

## 5. Dataset Quality
- [x] 30 sample logs (15 Benign / 15 Injected).
- [x] Includes Turkish instruction overrides and multi-layer obfuscation.
- [x] Includes "Hard Negatives" (benign logs with suspicious keywords in safe contexts).

## 6. Code Quality
- [x] Strict TypeScript usage with **zero `any`** in core logic.
- [x] Project passes `npx tsc --noEmit`.
- [x] Project builds successfully with `npm run build`.
