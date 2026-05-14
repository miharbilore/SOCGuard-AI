import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const entries = await prisma.auditTrailEntry.findMany({
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('[API] Audit Trail GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Audit Trail' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, action, notes } = body;

    const entry = await prisma.auditTrailEntry.create({
      data: {
        actor,
        action,
        notes
      }
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('[API] Audit Trail POST Error:', error);
    return NextResponse.json({ error: 'Failed to create Audit entry' }, { status: 500 });
  }
}
