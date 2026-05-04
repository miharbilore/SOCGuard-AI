import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  AdversarialAttackType 
} from './adversarial-types';
import { DetectionCategory, DetectionSeverity } from '../types';
import { deterministicHash } from '../utils/crypto';

/**
 * Mock Blue Team Defender.
 * Proposes deterministic detection rules for synthesized Red Team candidates.
 * These are research-level proposals and are NOT active production rules.
 */

interface DefenseStrategy {
  category: DetectionCategory;
  pattern: string;
  severity: DetectionSeverity;
  confidence: number;
  rationale: string;
  fpRisks: string[];
  hardNegatives: string[];
}

const STRATEGY_MAP: Record<AdversarialAttackType, DefenseStrategy> = {
  DIRECT_INSTRUCTION_OVERRIDE: {
    category: 'PROMPT_INJECTION',
    pattern: '(ignore|forget|override|atla|unut|geçersiz kıl).* (all|previous|önceki|tüm).* (instructions|talimat|direktif)',
    severity: 'HIGH',
    confidence: 0.9,
    rationale: 'Detects clear semantic intent to discard system-level instructions in English and Turkish.',
    fpRisks: ['Educational content explaining prompt injection', 'User reporting a bug about instructions being ignored'],
    hardNegatives: ['I like your instructions', 'Please follow the previous steps carefully']
  },
  JAILBREAK_ROLEPLAY: {
    category: 'PROMPT_INJECTION',
    pattern: '(you are now|artık sen|simulated|dan mode|developer mode|without filters|no limits)',
    severity: 'HIGH',
    confidence: 0.85,
    rationale: 'Identifies common roleplay-based jailbreak attempt patterns used to bypass safety guardrails.',
    fpRisks: ['Creative writing tasks', 'Normal chatbot roleplay scenarios'],
    hardNegatives: ['You are a helpful assistant', 'Imagine you are a doctor']
  },
  FRAGMENTED_PAYLOAD: {
    category: 'PROMPT_INJECTION',
    pattern: '(let|var|const|set|define) [A-Z0-9_]{1,10}.* (ignore|forget|concatenate|birleştir)',
    severity: 'MEDIUM',
    confidence: 0.75,
    rationale: 'Detects variable-based obfuscation where instructions are split and then reassembled.',
    fpRisks: ['Legitimate coding examples', 'Math equations'],
    hardNegatives: ['Let x = 5', 'Define a variable for user name']
  },
  PREFIX_INJECTION: {
    category: 'PROMPT_INJECTION',
    pattern: '(the user has changed|the analyst must now|you must now begin)',
    severity: 'MEDIUM',
    confidence: 0.8,
    rationale: 'Detects output-priming attempts where the user tries to overwrite the expected response prefix.',
    fpRisks: ['Customer service status updates', 'Narrative transitions'],
    hardNegatives: ['The user has changed their address', 'Now begin the analysis']
  },
  FEW_SHOT_MISLEADING: {
    category: 'PROMPT_INJECTION',
    pattern: '(User:|Assistant:|Q:|A:).*(Ignore|Forget)',
    severity: 'MEDIUM',
    confidence: 0.7,
    rationale: 'Detects fake conversation histories used to induce a state where the model ignores system rules.',
    fpRisks: ['Copy-pasting chat logs for context', 'Tutorials on how to use the assistant'],
    hardNegatives: ['User: hello, Assistant: hi']
  },
  TRANSLATION_BYPASS: {
    category: 'PROMPT_INJECTION',
    pattern: '(translate|çevir).*(ignore|forget|execute|çalıştır)',
    severity: 'HIGH',
    confidence: 0.8,
    rationale: 'Detects attempts to hide restricted instructions inside a translation request.',
    fpRisks: ['Language learning apps', 'Legitimate translation of technical terms'],
    hardNegatives: ['Translate this hello to French']
  },
  INDIRECT_RAG_INJECTION: {
    category: 'PROMPT_INJECTION',
    pattern: '(DOCUMENT START|BELGE BAŞI|RESEARCH NOTE).*(must now|reveal|söyle)',
    severity: 'HIGH',
    confidence: 0.85,
    rationale: 'Detects instructions embedded within external document markers that attempt to hijack the session.',
    fpRisks: ['Document summaries containing instruction-like phrases', 'Citing security policies in a report'],
    hardNegatives: ['The document says the user must login']
  },
  CONTEXT_OVERFLOW_ATTACK: {
    category: 'INSTRUCTION_OVERRIDE',
    pattern: '(A|B|C|Z| ){50,}.*(ignore|forget)',
    severity: 'MEDIUM',
    confidence: 0.6,
    rationale: 'Detects long repetitive patterns followed by a bypass attempt, a technique used for context window overflow.',
    fpRisks: ['ASCII art', 'Formatting tests'],
    hardNegatives: ['Repeating the word hello 5 times']
  },
  SYNTAX_ESCAPE: {
    category: 'PROMPT_INJECTION',
    pattern: '("}|}\]|-->|--\|).*(ignore|forget|system)',
    severity: 'HIGH',
    confidence: 0.9,
    rationale: 'Detects common escape sequences used to break out of data formats (JSON/Markdown) into command mode.',
    fpRisks: ['Code snippets showing closing brackets', 'Database query examples'],
    hardNegatives: ['{"name": "test"}', '--> end of comment']
  }
};

/**
 * Generates a Blue Team proposal for a specific Red Team candidate.
 */
export function generateBlueTeamProposal(candidate: RedTeamCandidate): BlueTeamProposal {
  const strategy = STRATEGY_MAP[candidate.attackType] || {
    category: 'PROMPT_INJECTION',
    pattern: '(ignore|forget|override)',
    severity: 'MEDIUM',
    confidence: 0.5,
    rationale: 'Default generic fallback for unknown attack types.',
    fpRisks: ['Generic keyword overlap'],
    hardNegatives: ['Standard usage']
  };

  const idHash = deterministicHash(`${candidate.id}:${strategy.pattern}:${candidate.attackType}`);
  const id = `BTP-${idHash.toUpperCase().substring(0, 8)}`;

  return {
    id,
    redTeamCandidateId: candidate.id,
    proposedCategory: strategy.category,
    proposedRulePattern: strategy.pattern,
    severity: strategy.severity,
    confidence: strategy.confidence,
    falsePositiveRisks: strategy.fpRisks,
    hardNegativeSuggestions: strategy.hardNegatives,
    rationale: strategy.rationale,
    status: 'NEEDS_REVIEW'
  };
}

/**
 * Generates Blue Team proposals for a list of Red Team candidates.
 */
export function generateBlueTeamProposals(candidates: RedTeamCandidate[]): BlueTeamProposal[] {
  return candidates.map(generateBlueTeamProposal);
}
