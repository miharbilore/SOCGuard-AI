import { DetectionCategory } from '../types';

export type ThreatIntelSourceType = 
  | 'OWASP' 
  | 'MITRE_ATLAS' 
  | 'RESEARCH_PAPER' 
  | 'TOOL_OUTPUT' 
  | 'INTERNAL_TEST' 
  | 'MANUAL_NOTE';

export interface ThreatIntelRecord {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: ThreatIntelSourceType;
  summary: string;
  attackCategories: DetectionCategory[];
  examplePhrases: string[];
  affectedComponents: string[];
  recommendedDefenses: string[];
  confidence: number;
  createdAt: string;
}

export interface ThreatIntelInput {
  title: string;
  sourceName: string;
  sourceUrl?: string;
  rawNotes: string;
  sourceType: ThreatIntelSourceType;
}
