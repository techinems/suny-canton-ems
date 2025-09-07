import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/members/[id] - Get a specific member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.user.findUnique({
      where: { id: id },
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

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - Update a specific member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Update the member
    const member = await prisma.user.update({
      where: { id: id },
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
        major: body.major,
        membershipStanding: body.membershipStanding,
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

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Delete a specific member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id: id },
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