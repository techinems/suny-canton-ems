import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CallStatus, CallType, LevelOfCare } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const callLog = await prisma.callLog.findUnique({
      where: {
        id: id,
      },
    });

    if (!callLog) {
      return NextResponse.json(
        { error: 'Call log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(callLog);
  } catch (error) {
    console.error('Error fetching call log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call log' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Partial<{
      callReceived: Date;
      callEnroute: Date;
      onScene: Date;
      backInService: Date;
      levelOfCare: LevelOfCare;
      dispatchInfo: string | null;
      location: string;
      jumpbagUsed: boolean | null;
      type: CallType | null;
      itemsUsed: string[];
      crew: string[];
      comments: string | null;
      status: CallStatus | null;
    }> = {};
    
    // Only update fields that are provided
    if (body.callReceived) updateData.callReceived = new Date(body.callReceived);
    if (body.callEnroute) updateData.callEnroute = new Date(body.callEnroute);
    if (body.onScene) updateData.onScene = new Date(body.onScene);
    if (body.backInService) updateData.backInService = new Date(body.backInService);
    if (body.levelOfCare) updateData.levelOfCare = body.levelOfCare as LevelOfCare;
    if (body.dispatchInfo !== undefined) updateData.dispatchInfo = body.dispatchInfo;
    if (body.location) updateData.location = body.location;
    if (body.jumpbagUsed !== undefined) updateData.jumpbagUsed = body.jumpbagUsed;
    if (body.type !== undefined) updateData.type = body.type as CallType;
    if (body.itemsUsed !== undefined) updateData.itemsUsed = body.itemsUsed;
    if (body.crew !== undefined) updateData.crew = body.crew;
    if (body.comments !== undefined) updateData.comments = body.comments;
    if (body.status !== undefined) updateData.status = body.status as CallStatus;

    const callLog = await prisma.callLog.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(callLog);
  } catch (error) {
    console.error('Error updating call log:', error);
    return NextResponse.json(
      { error: 'Failed to update call log' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.callLog.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting call log:', error);
    return NextResponse.json(
      { error: 'Failed to delete call log' },
      { status: 500 }
    );
  }
}