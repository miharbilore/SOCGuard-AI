/**
 * Generates a simple deterministic hash for a string.
 * Uses a basic DJB2-like algorithm.
 * This ensures analysis results are reproducible and audit-friendly.
 */
export function deterministicHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + c
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  // Return as a positive hex string
  return (hash >>> 0).toString(16);
}

/**
 * Creates a deterministic Analysis ID for a log entry based on its content.
 */
export function createAnalysisId(logId: string, payload: string): string {
  const contentHash = deterministicHash(payload);
  return `analysis-${logId}-${contentHash}`;
}

/**
 * Creates a deterministic Finding ID based on the context of the discovery.
 */
export function createFindingId(logId: string, ruleId: string, line: number, text: string, variant: string): string {
  const context = `${logId}:${ruleId}:${line}:${text}:${variant}`;
  return `finding-${deterministicHash(context)}`;
}
