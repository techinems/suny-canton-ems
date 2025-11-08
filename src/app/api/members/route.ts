import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSelect } from '@/app/api/members/memberSelect';

// GET /api/members - Get all members
export async function GET() {
  try {
    const members = await prisma.user.findMany({
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      select: memberSelect,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
