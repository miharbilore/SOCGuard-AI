import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const entries = await prisma.ruleVaultEntry.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON strings back to arrays
    const parsedEntries = entries.map(entry => ({
      ...entry,
      falsePositiveRisks: JSON.parse(entry.falsePositiveRisks)
    }));

    return NextResponse.json(parsedEntries);
  } catch (error) {
    console.error('[API] Rule Vault GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Rule Vault entries' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewedBy, reviewerNotes } = body;

    const updated = await prisma.ruleVaultEntry.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        reviewerNotes,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Rule Vault PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update Rule Vault entry' }, { status: 500 });
  }
}
