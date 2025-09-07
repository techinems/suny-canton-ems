import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const certifications = await prisma.certification.findMany({
      where: {
        memberId: params.memberId,
      },
      orderBy: {
        certExpiration: 'desc',
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Error fetching member certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member certifications' },
      { status: 500 }
    );
  }
}