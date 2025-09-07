import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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
    // Get the current user from the session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const certification = await prisma.certification.create({
      data: {
        certName: body.certName,
        memberId: session.user.id, // Use the authenticated user's ID
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