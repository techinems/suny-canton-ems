import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single building by ID
export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const building = await prisma.building.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            callLogs: true,
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building' },
      { status: 500 }
    );
  }
}
