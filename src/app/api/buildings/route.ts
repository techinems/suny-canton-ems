import { NextRequest, NextResponse } from 'next/server';
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

// POST - Create a new building
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    const building = await prisma.building.create({
      data: {
        name,
        address,
      },
    });

    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error('Error creating building:', error);
    return NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    );
  }
}
