import * as crypto from 'crypto';
import { DetectionCategory } from '../types';
import { ThreatIntelInput, ThreatIntelRecord } from './threat-intel-types';

/**
 * Deterministic parser for converting raw research notes into structured Threat Intel Records.
 */
export function parseThreatIntelNote(input: ThreatIntelInput): ThreatIntelRecord {
  const { title, sourceName, rawNotes, sourceUrl, sourceType } = input;

  // 1. Generate Deterministic ID from hash of (title + sourceName + rawNotes)
  const hash = crypto.createHash('sha256')
    .update(`${title}|${sourceName}|${rawNotes}`)
    .digest('hex')
    .substring(0, 12);
  const id = `TI-${hash.toUpperCase()}`;

  // 2. Extract Quoted Phrases as examplePhrases
  const examplePhrases: string[] = [];
  const quoteRegex = /"([^"]+)"/g;
  let match;
  while ((match = quoteRegex.exec(rawNotes)) !== null) {
    examplePhrases.push(match[1]);
  }

  // 3. Detect Keywords and Map to SOCGuard Categories
  const attackCategories: DetectionCategory[] = [];
  const categoryKeywords: Record<string, DetectionCategory> = {
    'prompt injection': 'PROMPT_INJECTION',
    'data exfiltration': 'DATA_EXFILTRATION',
    'tool abuse': 'TOOL_ABUSE',
    'prompt leak': 'PROMPT_LEAK_ATTEMPT',
    'encoding': 'SUSPICIOUS_ENCODING',
  };

  const lowercaseNotes = rawNotes.toLowerCase();
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (lowercaseNotes.includes(keyword)) {
      if (!attackCategories.includes(category)) {
        attackCategories.push(category);
      }
    }
  }

  // 4. Extract Summary, Affected Components, and Recommended Defenses
  // Simple deterministic extraction based on line labels
  const lines = rawNotes.split('\n');
  let summary = '';
  const affectedComponents: string[] = [];
  const recommendedDefenses: string[] = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.toLowerCase().startsWith('summary:')) {
      summary = trimmedLine.substring(8).trim();
    } else if (trimmedLine.toLowerCase().startsWith('component:')) {
      affectedComponents.push(trimmedLine.substring(10).trim());
    } else if (trimmedLine.toLowerCase().startsWith('defense:')) {
      recommendedDefenses.push(trimmedLine.substring(8).trim());
    }
  });

  // Fallback for summary if label is missing
  if (!summary) {
    summary = rawNotes.substring(0, 100).split('\n')[0] + '...';
  }

  return {
    id,
    title,
    sourceName,
    sourceUrl,
    sourceType,
    summary,
    attackCategories: attackCategories.length > 0 ? attackCategories : ['BENIGN'],
    examplePhrases,
    affectedComponents: affectedComponents.length > 0 ? affectedComponents : ['Unknown LLM Agent'],
    recommendedDefenses: recommendedDefenses.length > 0 ? recommendedDefenses : ['Enhanced Regex Monitoring'],
    confidence: 0.8, // Default confidence for manual intake
    createdAt: new Date().toISOString()
  };
}
