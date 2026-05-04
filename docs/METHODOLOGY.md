# SOCGuard AI: Analysis Methodology

## Deterministic-First Pipeline
SOCGuard AI operates on a "Deterministic-First" philosophy. The core analysis pipeline is composed of four strictly deterministic stages:

1.  **Preprocessing**: Normalizing and decoding input to reveal obfuscation.
2.  **Detection**: Pattern-matching against a curated library of adversarial signatures.
3.  **Risk Scoring**: Aggregating findings into a numeric score with confidence weighting and caps.
4.  **Policy Enforcement**: Applying final security decisions based on static thresholds and override rules.

## Why LLMs are Excluded from the Core Pipeline
We intentionally exclude LLMs from the primary decision-making path for several reasons:

-   **Integrity**: LLMs can be manipulated by the very prompt injections they are meant to detect. A deterministic engine is immune to semantic persuasion.
-   **Performance**: Deterministic rules execute in sub-millisecond timeframes, whereas LLM inference can take seconds.
-   **Reliability**: Security requires 100% reproducibility. LLMs are probabilistic and may return different results for the same input.
-   **Auditability**: Deterministic rules provide a clear "if-then" logic that can be easily audited by compliance teams.

## Reproducibility & Deterministic IDs
To ensure that SOCGuard AI is reliable for forensic analysis and automated workflows:
- **Analysis IDs**: Every analysis result has an ID derived from the log content using a deterministic hash. The same log analyzed twice will yield the same ID.
- **Finding IDs**: Findings are identified based on the log, the rule, the line number, and the specific text matched.
- **Consistent Thresholds**: Risk levels (LOW to CRITICAL) are perfectly aligned with Policy Decisions (SAFE to BLOCK), ensuring no "dead zones" in the logic.

## Evaluation Metrics
We measure the effectiveness of the orchestrator using standard binary classification metrics:

-   **Total Logs**: Number of samples analyzed.
-   **Detection Rate**: Percentage of `INJECTED` logs correctly identified as `ESCALATE`, `HUMAN_REVIEW`, or `BLOCK`.
-   **False Positive Rate**: Percentage of `BENIGN` logs incorrectly flagged as suspicious.
-   **False Negative Rate**: Percentage of `INJECTED` logs that bypassed all deterministic rules.
-   **Average Latency**: The end-to-end processing time for a single log entry.

## Limitations

-   **Signature Dependency**: The pipeline is only as good as its rule library. It will not detect novel semantic attacks that do not match existing patterns.
-   **Context Blindness**: The current orchestrator is stateless and analyzes logs in isolation, potentially missing multi-stage attacks.
-   **Semantic Complexity**: Deterministic rules struggle with highly nuanced or conversational prompt injections that do not use "malicious" keywords.

## Implementation Details
The pipeline is orchestrated in `src/modules/socguard/demo/analyze-log.ts` and provides a unified `AnalysisResult` that includes all intermediate states for full transparency.
