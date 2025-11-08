import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSelect } from '@/app/api/members/memberSelect';

// PUT /api/admin/members/:id - Update a member (admin only via middleware)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const member = await prisma.user.update({
      where: { id },
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        preferredName: body.preferredName,
        avatar: body.avatar,
        shirtSize: body.shirtSize,
        dob: body.dob ? new Date(body.dob) : undefined,
        cantonEmail: body.cantonEmail,
        position: body.position,
        isAdmin: typeof body.isAdmin === 'boolean' ? body.isAdmin : undefined,
        major: body.major,
        membershipStanding: body.membershipStanding,
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

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/members/:id - Delete a member (admin only via middleware)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
