import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSelect } from '@/app/api/members/memberSelect';

// GET /api/members/[id] - Get a specific member
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.user.findUnique({
      where: { id: id },
      select: memberSelect,
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}
