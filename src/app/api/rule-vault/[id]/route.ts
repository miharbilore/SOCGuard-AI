import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    
    if (!body.status) {
      return NextResponse.json({ error: "Missing status field" }, { status: 400 });
    }

    const updated = await prisma.ruleVaultEntry.update({
      where: { id: params.id },
      data: {
        status: body.status,
        reviewedBy: 'HumanReviewer',
        reviewedAt: new Date(),
        reviewerNotes: body.reviewerNotes || 'Approved via Governance UI'
      }
    });

    // Also create an audit trail entry
    await prisma.auditTrailEntry.create({
      data: {
        actor: 'HumanReviewer',
        action: 'APPROVE_RULE',
        notes: `Rule ${params.id} was marked as ${body.status}`
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[API] Error updating rule vault entry:', error);
    return NextResponse.json({ error: error.message || 'Failed to update entry' }, { status: 500 });
  }
}
