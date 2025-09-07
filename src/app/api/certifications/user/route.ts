import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const certifications = await prisma.certification.findMany({
      where: {
        memberId: session.user.id,
      },
      orderBy: {
        certExpiration: 'desc',
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user certifications' },
      { status: 500 }
    );
  }
}