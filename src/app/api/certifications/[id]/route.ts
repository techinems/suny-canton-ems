import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certification = await prisma.certification.findUnique({
      where: {
        id: id,
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error('Error fetching certification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
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
      certName: string;
      memberId: string;
      certScan: string;
      certExpiration: Date | null;
      certIssueDate: Date | null;
      certNumber: string | null;
      issuingAuthority: string | null;
    }> = {};
    
    // Only update fields that are provided
    if (body.certName !== undefined) updateData.certName = body.certName;
    if (body.memberId !== undefined) updateData.memberId = body.memberId;
    if (body.certScan !== undefined) updateData.certScan = body.certScan;
    if (body.certExpiration !== undefined) updateData.certExpiration = body.certExpiration ? new Date(body.certExpiration) : null;
    if (body.certIssueDate !== undefined) updateData.certIssueDate = body.certIssueDate ? new Date(body.certIssueDate) : null;
    if (body.certNumber !== undefined) updateData.certNumber = body.certNumber;
    if (body.issuingAuthority !== undefined) updateData.issuingAuthority = body.issuingAuthority;

    const certification = await prisma.certification.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
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
    await prisma.certification.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}