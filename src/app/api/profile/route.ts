import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      preferredName,
      cantonEmail,
      position,
      major,
      cantonCardId,
      gpa,
      phoneNumber,
      medicalLevel,
      housingType,
      building,
      roomNumber,
      homeAddress,
      localAddress,
      shirtSize,
      dob,
    } = body;

    // Validate required fields
    if (!dob) {
      return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    }

    // Update the user with additional profile information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        preferredName: preferredName || null,
        dob: new Date(dob),
        cantonEmail: cantonEmail || null,
        position: position || 'MEMBER',
        major: major || null,
        cantonCardId: cantonCardId || null,
        gpa: gpa || null,
        phoneNumber: phoneNumber || null,
        medicalLevel: medicalLevel || null,
        housingType: housingType || null,
        building: building || null,
        roomNumber: roomNumber || null,
        homeAddress: homeAddress || null,
        localAddress: localAddress || null,
        shirtSize: shirtSize || null,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user with all profile information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}