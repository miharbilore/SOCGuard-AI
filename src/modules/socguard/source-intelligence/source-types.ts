export type SourceType = 'FRAMEWORK' | 'TOOL' | 'PAPER' | 'DATASET' | 'BLOG' | 'INTERNAL_NOTE' | 'MANUAL';

export type TrustLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type AllowedUse = 'TAXONOMY_ONLY' | 'SANITIZED_EXAMPLES' | 'BENCHMARK_SEED';

export interface AllowedSource {
  id: string;
  name: string;
  type: SourceType;
  url?: string;
  licenseNotes: string;
  trustLevel: TrustLevel;
  allowedUse: AllowedUse[];
  enabled: boolean;
  notes: string;
}

export type SourceIntelligenceStatus = 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';

export interface SourceIntelligenceNote {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  attackTypes: string[];
  languages: string[];
  sanitizedPatterns: string[];
  defensiveInsights: string[];
  limitations: string[];
  provenance: string;
  status: SourceIntelligenceStatus;
  createdAt: string;
}

export interface BenchmarkCorpusCandidate {
  id: string;
  sourceNoteId: string;
  sanitizedLog: string;
  label: 'INJECTED' | 'BENIGN';
  attackType: string;
  expectedCategory: string;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  language: string;
  provenance: string;
  status: SourceIntelligenceStatus;
  createdAt: string;
}

export interface SourceIntelligenceSummary {
  totalSources: number;
  totalNotes: number;
  approvedNotes: number;
  totalCandidates: number;
  pendingReviewCount: number;
}
