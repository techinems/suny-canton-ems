import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CallStatus, CallType, LevelOfCare } from '@prisma/client';

export async function GET() {
  try {
    const callLogs = await prisma.callLog.findMany({
      orderBy: {
        callReceived: 'desc',
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const callLog = await prisma.callLog.create({
      data: {
        callReceived: new Date(body.callReceived),
        callEnroute: new Date(body.callEnroute),
        onScene: new Date(body.onScene),
        backInService: new Date(body.backInService),
        levelOfCare: body.levelOfCare as LevelOfCare,
        dispatchInfo: body.dispatchInfo,
        buildingId: body.buildingId,
        location: body.location,
        jumpbagUsed: body.jumpbagUsed ?? false,
        type: body.type as CallType | undefined,
        itemsUsed: body.itemsUsed ?? [],
        crew: body.crew ?? [],
        comments: body.comments,
        status: body.status as CallStatus | undefined,
      },
    });

    return NextResponse.json(callLog, { status: 201 });
  } catch (error) {
    console.error('Error creating call log:', error);
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    );
  }
}