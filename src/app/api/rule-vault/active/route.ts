import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    
    // Fetch all approved rules
    const approvedRules = await prisma.ruleVaultEntry.findMany({
      where: { 
        status: { in: ['APPROVED', 'APPROVED_FOR_RULE_CANDIDATE', 'APPROVED_FOR_BOTH'] }
      }
    });
    // Sanitize patterns for JavaScript RegExp compatibility
    const cleanedRules = approvedRules.map(rule => {
      let pattern = rule.suggestedPattern;
      // 1. Remove leading/trailing regex slashes (e.g. /pattern/gi -> pattern)
      pattern = pattern.replace(/^\/|\/[gimsuy]*$/g, '');
      // 2. Remove inline (?i) flags - JS doesn't support them, we pass 'i' as a RegExp flag
      pattern = pattern.replace(/\(\?i\)/g, '');
      // 3. Fix double-escaped backslashes from DB storage (\\\\s -> \\s)
      pattern = pattern.replace(/\\\\\\\\/g, '\\\\');
      return { ...rule, suggestedPattern: pattern };
    });

    return NextResponse.json(cleanedRules);
  } catch (error: any) {
    console.error('[API] Error fetching active rules:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch active rules' }, { status: 500 });
  }
}
