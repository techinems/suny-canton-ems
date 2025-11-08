import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSelect } from '@/app/api/members/memberSelect';

// POST /api/admin/members - Create a new member (admin only via middleware)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
        isAdmin: body.isAdmin ?? false,
        major: body.major,
        membershipStanding: body.membershipStanding || 'GOOD',
        cantonCardId: body.cantonCardId,
        gpa: body.gpa,
        phoneNumber: body.phoneNumber,
        medicalLevel: body.medicalLevel,
        housingType: body.housingType,
        buildingId: body.buildingId,
        roomNumber: body.roomNumber,
        homeAddress: body.homeAddress,
        localAddress: body.localAddress,
      },
      select: memberSelect,
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
