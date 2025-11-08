import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all buildings
export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(buildings);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    );
  }
}
