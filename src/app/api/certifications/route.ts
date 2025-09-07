import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: {
        certExpiration: 'desc',
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const certification = await prisma.certification.create({
      data: {
        certName: body.certName,
        memberId: body.memberId,
        certScan: body.certScan,
        certExpiration: body.certExpiration ? new Date(body.certExpiration) : null,
        certIssueDate: body.certIssueDate ? new Date(body.certIssueDate) : null,
        certNumber: body.certNumber,
        issuingAuthority: body.issuingAuthority,
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}