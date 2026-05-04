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

  // 3. Basic URL decoding safely
  let afterUrl = current;
  try {
    // We check if it contains % before trying to decode to be more performant
    if (current.includes('%')) {
      const decoded = decodeURIComponent(current.replace(/\+/g, ' '));
      if (decoded !== current) {
        suspiciousTransforms.push('URL_ENCODING');
        afterUrl = decoded;
        decodedVariants.push(decoded);
      }
    }
  } catch (e) {
    // If decoding fails, we just keep the current version
  }

  // 4. Basic HTML entity decoding safely
  let afterHtml = afterUrl;
  const decodedHtml = decodeHtmlEntities(afterUrl);
  if (decodedHtml !== afterUrl) {
    suspiciousTransforms.push('HTML_ENTITY');
    afterHtml = decodedHtml;
    if (!decodedVariants.includes(decodedHtml)) {
      decodedVariants.push(decodedHtml);
    }
  }

  // The final "normalized" version includes all the above
  const finalNormalized = afterHtml;

  return {
    original: raw,
    normalized: finalNormalized,
    lowercase: finalNormalized.toLowerCase(),
    lines: finalNormalized.split(/\r?\n/),
    decodedVariants,
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
