import { NormalizedLogInput } from '../types';

/**
 * Normalizes a log input string by applying various transformations
 * to reveal obfuscated content and standardize the text.
 */
export function normalizeLogInput(raw: string): NormalizedLogInput {
  const suspiciousTransforms: string[] = [];
  const decodedVariants: string[] = [];
  
  // 1. Unicode normalization (NFKC)
  // This helps catch characters that look like standard ASCII but are different Unicode points
  let current = raw.normalize('NFKC');
  if (current !== raw) {
    suspiciousTransforms.push('UNICODE_NORMALIZATION');
  }

  // 2. Detect and remove zero-width characters
  // Often used to break up keywords like "system" -> "s\u200By\u200Bt\u200Be\u200Bm"
  const zeroWidthRegex = /[\u200B-\u200D\uFEFF]/g;
  if (zeroWidthRegex.test(current)) {
    suspiciousTransforms.push('ZERO_WIDTH_CHARS');
    current = current.replace(zeroWidthRegex, '');
  }

  // 3. Multi-pass URL and HTML Decoding (Max 2 passes)
  let multiPass = current;
  let urlPasses = 0;
  let htmlPasses = 0;
  const MAX_PASSES = 2;

  while (urlPasses < MAX_PASSES || htmlPasses < MAX_PASSES) {
    let changed = false;
    
    // URL Decoding pass
    if (urlPasses < MAX_PASSES && multiPass.includes('%')) {
      try {
        const decoded = decodeURIComponent(multiPass.replace(/\+/g, ' '));
        if (decoded !== multiPass) {
          multiPass = decoded;
          changed = true;
          urlPasses++;
          suspiciousTransforms.push(`URL_DECODE_P${urlPasses}`);
          if (!decodedVariants.includes(decoded)) decodedVariants.push(decoded);
        }
      } catch (e) { /* skip */ }
    }

    // HTML Entity Decoding pass
    if (htmlPasses < MAX_PASSES) {
      const decoded = decodeHtmlEntities(multiPass);
      if (decoded !== multiPass) {
        multiPass = decoded;
        changed = true;
        htmlPasses++;
        suspiciousTransforms.push(`HTML_DECODE_P${htmlPasses}`);
        if (!decodedVariants.includes(decoded)) decodedVariants.push(decoded);
      }
    }

    if (!changed) break;
  }

  // 4. Cautious Base64 and Hex Decoding
  // We only decode if the result contains suspicious keywords to avoid noise/FPs
  const potentialEncodedTokens = multiPass.match(/[A-Za-z0-9+/=]{20,500}|[0-9a-fA-F]{40,500}/g) || [];
  const keywordRegex = /instruction|talimat|ignore|yok say|system|admin|prompt|leak|override/i;

  for (const token of potentialEncodedTokens) {
    // Try Base64
    try {
      if (token.length % 4 === 0) {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        if (keywordRegex.test(decoded) && decoded.length > 10) {
          suspiciousTransforms.push('BASE64_OBFUSCATION');
          if (!decodedVariants.includes(decoded)) decodedVariants.push(decoded);
        }
      }
    } catch (e) { /* skip */ }

    // Try Hex
    try {
      if (token.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(token)) {
        const decoded = Buffer.from(token, 'hex').toString('utf-8');
        if (keywordRegex.test(decoded) && decoded.length > 10) {
          suspiciousTransforms.push('HEX_OBFUSCATION');
          if (!decodedVariants.includes(decoded)) decodedVariants.push(decoded);
        }
      }
    } catch (e) { /* skip */ }
  }

  // The final "normalized" version includes all the above
  const finalNormalized = multiPass;

  return {
    original: raw,
    normalized: finalNormalized,
    lowercase: finalNormalized.toLowerCase(),
    lines: finalNormalized.split(/\r?\n/),
    decodedVariants: Array.from(new Set(decodedVariants)),
    suspiciousTransforms: Array.from(new Set(suspiciousTransforms))
  };
}

/**
 * Decodes basic HTML entities without external dependencies.
 */
function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'"
  };
  
  // Handle numeric entities: &#123; and &#x7b;
  let decoded = str.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return `&#${dec};`;
    }
  });
  
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return `&#x${hex};`;
    }
  });
  
  // Handle common named entities
  return decoded.replace(/&[a-z]+;/g, (match) => entities[match] || match);
}
