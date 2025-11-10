import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/lib/server/fileService';

const MAX_CERT_FILE_SIZE = 25 * 1024 * 1024; // 25MB cap for certificate uploads

const isAllowedMimeType = (mime: string) =>
  mime === 'application/pdf' || mime.startsWith('image/');

const parseDateField = (value: FormDataEntryValue | null | undefined) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const strValue = value.toString().trim();
  if (!strValue) {
    return null;
  }
  const parsed = new Date(strValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('invalid-date');
  }
  return parsed;
};

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

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 415 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Certificate scan file is required' },
        { status: 400 }
      );
    }

    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: 'File must be a PDF or an image' },
        { status: 400 }
      );
    }

    if (file.size > MAX_CERT_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    const certNameEntry = formData.get('certName');
    const certName = typeof certNameEntry === 'string' ? certNameEntry.trim() : '';

    if (!certName) {
      return NextResponse.json(
        { error: 'Certification name is required' },
        { status: 400 }
      );
    }

    let memberId = session.user.id;
    const memberIdEntry = formData.get('memberId');
    if (
      session.user.isAdmin &&
      typeof memberIdEntry === 'string' &&
      memberIdEntry.trim()
    ) {
      memberId = memberIdEntry.trim();
    }

    let certExpiration: Date | null | undefined;
    let certIssueDate: Date | null | undefined;
    try {
      certExpiration = parseDateField(formData.get('certExpiration'));
      certIssueDate = parseDateField(formData.get('certIssueDate'));
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-date') {
        return NextResponse.json(
          { error: 'Invalid date format provided' },
          { status: 400 }
        );
      }
      throw error;
    }

    const certNumberEntry = formData.get('certNumber');
    const issuingAuthorityEntry = formData.get('issuingAuthority');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await uploadFile(session.user.id, {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
    });

    const certification = await prisma.certification.create({
      data: {
        certName,
        memberId,
        certScan: uploadedFile.id,
        certExpiration: certExpiration ?? null,
        certIssueDate: certIssueDate ?? null,
        certNumber:
          typeof certNumberEntry === 'string' && certNumberEntry.trim()
            ? certNumberEntry.trim()
            : null,
        issuingAuthority:
          typeof issuingAuthorityEntry === 'string' && issuingAuthorityEntry.trim()
            ? issuingAuthorityEntry.trim()
            : null,
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