import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/buildings/:id - Retrieve building (admin only via middleware)
export async function GET(
  _request: NextRequest,
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
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
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

// PUT /api/admin/buildings/:id - Update a building (admin only via middleware)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    const building = await prisma.building.update({
      where: { id: params.id },
      data: {
        name,
        address,
      },
    });

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error updating building:', error);
    return NextResponse.json(
      { error: 'Failed to update building' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/buildings/:id - Delete a building (admin only via middleware)
export async function DELETE(
  _request: NextRequest,
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

    if (building._count.users > 0 || building._count.callLogs > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete building. It is being used by ${building._count.users} member(s) and ${building._count.callLogs} call log(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.building.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting building:', error);
    return NextResponse.json(
      { error: 'Failed to delete building' },
      { status: 500 }
    );
  }
}
