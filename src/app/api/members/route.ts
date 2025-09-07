import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/members - Get all members
export async function GET() {
  try {
    const members = await prisma.user.findMany({
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredName: true,
        avatar: true,
        shirtSize: true,
        dob: true,
        cantonEmail: true,
        position: true,
        major: true,
        membershipStanding: true,
        cantonCardId: true,
        gpa: true,
        phoneNumber: true,
        medicalLevel: true,
        housingType: true,
        building: true,
        roomNumber: true,
        homeAddress: true,
        localAddress: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
        name: true,
      },
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

// POST /api/members - Create a new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a new member
    const member = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        preferredName: body.preferredName,
        avatar: body.avatar,
        shirtSize: body.shirtSize,
        dob: new Date(body.dob),
        cantonEmail: body.cantonEmail,
        position: body.position,
        major: body.major,
        membershipStanding: body.membershipStanding || 'GOOD',
        cantonCardId: body.cantonCardId,
        gpa: body.gpa,
        phoneNumber: body.phoneNumber,
        medicalLevel: body.medicalLevel,
        housingType: body.housingType,
        building: body.building,
        roomNumber: body.roomNumber,
        homeAddress: body.homeAddress,
        localAddress: body.localAddress,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}