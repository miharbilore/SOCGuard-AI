import { 
  RedTeamAgent, 
  BlueTeamAgent, 
  JudgeAgent, 
  CuratorAgent,
  RedTeamCandidate,
  BlueTeamProposal,
  JudgeRecommendation,
  CuratedRuleVaultEntry,
  AgentRuntimeConfig
} from '../agent-types';
import { callOpenAICompatibleChat } from './server-llm-client';
import { 
  safeParseLLMJSON, 
  validateRedTeamOutput, 
  validateBlueTeamOutput, 
  validateJudgeOutput, 
  validateCuratorOutput 
} from './llm-output-schemas';
import { sanitizeAdversarialPrompt } from '../../adversarial-lab/safety-sanitizer';

/**
 * Red Team Agent using OpenAI-compatible API.
 */
export class OpenAICompatibleRedTeamAgent implements RedTeamAgent {
  constructor(private config: AgentRuntimeConfig) {}

  async generate(input: { sourceId: string; maxCandidates?: number }): Promise<RedTeamCandidate[]> {
    if (!this.config.openai?.enabled || !this.config.openai.apiKey) {
      throw new Error('LLM Agents are not enabled or API key is missing.');
    }

    const systemPrompt = `You are a SOCGuard AI Red Team Agent. 
Generate only sanitized, non-operational prompt-injection test logs for security research.
Do not provide exploit steps, real malware, phishing, credential theft, weapon instructions, or real exfiltration targets.
Use placeholders: [REDACTED_HARMFUL_REQUEST], [REDACTED_SECRET], [REDACTED_EXFIL_TARGET], [REDACTED_MALWARE_ACTION].
Output JSON only with a "candidates" array.`;

    const userPrompt = `Generate ${input.maxCandidates || 3} indirect prompt injection candidate logs.
Include attackType, sanitizedPrompt, targetWeakness, expectedDetectionCategory, and difficulty (EASY, MEDIUM, HARD, EXPERT).`;

    const response = await callOpenAICompatibleChat({
      baseUrl: this.config.openai.baseUrl,
      apiKey: this.config.openai.apiKey,
      model: this.config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.openai.temperature
    });

    if (response.error) throw new Error(response.error);

    const data = safeParseLLMJSON(response.content);
    if (!validateRedTeamOutput(data)) {
      throw new Error('Invalid Red Team output schema from LLM.');
    }

    return data.candidates.map((c: any, index: number) => {
      const safetyResult = sanitizeAdversarialPrompt(c.sanitizedPrompt);
      return {
        id: `RT-LLM-${input.sourceId}-${Date.now().toString(36)}-${index}`,
        sourceId: input.sourceId,
        attackType: c.attackType,
        // Mandatory double-sanitization for defense in depth
        sanitizedPrompt: safetyResult.sanitizedPrompt,
        redactedTerms: safetyResult.redactedTerms,
        targetWeakness: c.targetWeakness,
        expectedDetectionCategory: c.expectedDetectionCategory,
        difficulty: c.difficulty,
        safetyStatus: safetyResult.safetyStatus,
        createdAt: new Date().toISOString(),
        metadata: {
          model: this.config.openai?.model,
          generatedAt: new Date().toISOString()
        }
      };
    });
  }
}

/**
 * Blue Team Agent using OpenAI-compatible API.
 */
export class OpenAICompatibleBlueTeamAgent implements BlueTeamAgent {
  constructor(private config: AgentRuntimeConfig) {}

  async propose(input: { candidate: RedTeamCandidate }): Promise<BlueTeamProposal> {
    if (!this.config.openai?.enabled || !this.config.openai.apiKey) {
      throw new Error('LLM Agents are not enabled.');
    }

    const systemPrompt = `You are a SOCGuard AI Blue Team Agent. 
Propose defensive detection logic (regex/keyword) for the provided log.
Avoid overly broad regex. Include false positive risks.
Output JSON only.`;

    const userPrompt = `Propose a defense for this candidate:
Log: ${input.candidate.sanitizedPrompt}
Attack Type: ${input.candidate.attackType}`;

    const response = await callOpenAICompatibleChat({
      baseUrl: this.config.openai.baseUrl,
      apiKey: this.config.openai.apiKey,
      model: this.config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.openai.temperature
    });

    if (response.error) throw new Error(response.error);

    const data = safeParseLLMJSON(response.content);
    if (!validateBlueTeamOutput(data)) {
      throw new Error('Invalid Blue Team output schema from LLM.');
    }

    return {
      id: `BP-LLM-${input.candidate.id}-${Date.now().toString(36)}`,
      redTeamCandidateId: input.candidate.id,
      proposedCategory: data.proposedCategory,
      proposedRulePattern: data.proposedRulePattern,
      severity: data.severity,
      confidence: data.confidence,
      falsePositiveRisks: data.falsePositiveRisks,
      hardNegativeSuggestions: data.hardNegativeSuggestions,
      rationale: data.rationale,
      status: 'NEEDS_REVIEW'
    };
  }
}

/**
 * Judge Agent using OpenAI-compatible API.
 */
export class OpenAICompatibleJudgeAgent implements JudgeAgent {
  constructor(private config: AgentRuntimeConfig) {}

  async evaluate(input: { candidate: RedTeamCandidate; proposal: BlueTeamProposal }): Promise<JudgeRecommendation> {
    if (!this.config.openai?.enabled || !this.config.openai.apiKey) {
      throw new Error('LLM Agents are not enabled.');
    }

    const systemPrompt = `You are a SOCGuard AI Judge Agent. 
Evaluate the Red/Blue pair. Advisory only. Never approve production rules.
Output JSON only.`;

    const userPrompt = `Evaluate this pair:
Log: ${input.candidate.sanitizedPrompt}
Proposed Rule: ${input.proposal.proposedRulePattern}
Rationale: ${input.proposal.rationale}`;

    const response = await callOpenAICompatibleChat({
      baseUrl: this.config.openai.baseUrl,
      apiKey: this.config.openai.apiKey,
      model: this.config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.openai.temperature
    });

    if (response.error) throw new Error(response.error);

    const data = safeParseLLMJSON(response.content);
    if (!validateJudgeOutput(data)) {
      throw new Error('Invalid Judge output schema from LLM.');
    }

    // Map recommendation to internal type
    let recommendation: any = 'RECOMMEND_REVISE';
    if (data.recommendation === 'APPROVE') recommendation = 'RECOMMEND_APPROVE_FOR_REVIEW';
    if (data.recommendation === 'REJECT') recommendation = 'RECOMMEND_REJECT';

    return {
      id: `JR-LLM-${input.proposal.id}-${Date.now().toString(36)}`,
      redTeamCandidateId: input.candidate.id,
      blueTeamProposalId: input.proposal.id,
      recommendation,
      realismScore: data.realismScore,
      coverageScore: data.coverageScore,
      falsePositiveRiskScore: data.falsePositiveRiskScore,
      safetyScore: data.safetyScore,
      reasons: data.reasons,
      limitations: data.limitations || [],
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * Curator Agent using OpenAI-compatible API.
 */
export class OpenAICompatibleCuratorAgent implements CuratorAgent {
  constructor(private config: AgentRuntimeConfig) {}

  async curate(input: { 
    candidate: RedTeamCandidate; 
    proposal: BlueTeamProposal; 
    judge: JudgeRecommendation 
  }): Promise<CuratedRuleVaultEntry> {
    if (!this.config.openai?.enabled || !this.config.openai.apiKey) {
      throw new Error('LLM Agents are not enabled.');
    }

    const systemPrompt = `You are a SOCGuard AI Curator Agent. 
Format the findings into a rule vault candidate. Status must remain NEEDS_REVIEW.
Output JSON only.`;

    const userPrompt = `Curate this session:
Attack: ${input.candidate.attackType}
Rule: ${input.proposal.proposedRulePattern}
Judge Recommendation: ${input.judge.recommendation}`;

    const response = await callOpenAICompatibleChat({
      baseUrl: this.config.openai.baseUrl,
      apiKey: this.config.openai.apiKey,
      model: this.config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.openai.temperature
    });

    if (response.error) throw new Error(response.error);

    const data = safeParseLLMJSON(response.content);
    if (!validateCuratorOutput(data)) {
      throw new Error('Invalid Curator output schema from LLM.');
    }

    return {
      id: `RV-CUR-${Date.now().toString(36).toUpperCase()}`,
      sourceType: 'AGENT_LAB',
      attackType: data.attackType,
      sanitizedLog: data.sanitizedLog,
      proposedCategory: data.proposedCategory,
      suggestedPattern: data.suggestedPattern,
      severity: data.severity,
      confidence: data.confidence,
      falsePositiveRisks: data.falsePositiveRisks,
      status: 'NEEDS_REVIEW',
      provenance: `Curated by LLM (${this.config.openai.model}) from Red Team ${input.candidate.id}`,
      createdAt: new Date().toISOString()
    };
  }
}
