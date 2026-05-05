/**
 * Server-side LLM client for OpenAI-compatible APIs (e.g., Groq, OpenAI).
 * This module must NEVER be imported by client-side components.
 */

export interface LLMChatInput {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMChatResponse {
  content: string;
  error?: string;
  status: number;
}

/**
 * Performs a chat completion request to an OpenAI-compatible endpoint.
 */
export async function callOpenAICompatibleChat(input: LLMChatInput): Promise<LLMChatResponse> {
  const { baseUrl, apiKey, model, messages, temperature = 0.2, maxTokens = 1200, timeoutMs = 30000 } = input;

  if (!apiKey || apiKey === '<server-side-api-key-placeholder>') {
    return { content: '', error: 'API key is missing or invalid.', status: 401 };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }, // Enforce JSON for compatible providers
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        return { content: '', error: 'Rate limit reached. Please try again later.', status: 429 };
      }
      return { 
        content: '', 
        error: `LLM Provider Error: ${data.error?.message || response.statusText}`, 
        status: response.status 
      };
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { content: '', error: 'Empty response from LLM provider.', status: 500 };
    }

    return { content, status: 200 };

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { content: '', error: 'LLM request timed out.', status: 408 };
    }
    return { 
      content: '', 
      error: `Connection Error: ${error.message || 'Unknown network error'}`, 
      status: 500 
    };
  }
}
