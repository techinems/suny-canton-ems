import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/server/fileService';

const MAX_CERT_FILE_SIZE = 25 * 1024 * 1024;

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

const sanitizeStringField = (
  value: FormDataEntryValue | null | undefined
): string | null | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const trimmed = value.toString().trim();
  return trimmed || null;
};

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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existing = await prisma.certification.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.isAdmin === true;
    const isOwner = existing.memberId === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    const updateData: Record<string, unknown> = {};
    let shouldReplaceFile = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      if (formData.has('certName')) {
        const certNameEntry = formData.get('certName');
        const certName = typeof certNameEntry === 'string' ? certNameEntry.trim() : '';
        if (!certName) {
          return NextResponse.json(
            { error: 'Certification name cannot be empty' },
            { status: 400 }
          );
        }
        updateData.certName = certName;
      }

      if (formData.has('memberId') && isAdmin) {
        const memberIdEntry = formData.get('memberId');
        const candidate = typeof memberIdEntry === 'string' ? memberIdEntry.trim() : '';
        if (candidate) {
          updateData.memberId = candidate;
        }
      }

      try {
        if (formData.has('certExpiration')) {
          const parsed = parseDateField(formData.get('certExpiration'));
          updateData.certExpiration = parsed ?? null;
        }
        if (formData.has('certIssueDate')) {
          const parsed = parseDateField(formData.get('certIssueDate'));
          updateData.certIssueDate = parsed ?? null;
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'invalid-date') {
          return NextResponse.json(
            { error: 'Invalid date format provided' },
            { status: 400 }
          );
        }
        throw error;
      }

      if (formData.has('certNumber')) {
        updateData.certNumber = sanitizeStringField(formData.get('certNumber')) ?? null;
      }

      if (formData.has('issuingAuthority')) {
        updateData.issuingAuthority = sanitizeStringField(
          formData.get('issuingAuthority')
        ) ?? null;
      }

      const file = formData.get('file');
      if (file instanceof File && file.size > 0) {
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

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadedFile = await uploadFile(session.user.id, {
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          buffer,
        });

        shouldReplaceFile = true;
        updateData.certScan = uploadedFile.id;
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json();

      if (body.certName !== undefined) {
        const certName = typeof body.certName === 'string' ? body.certName.trim() : '';
        if (!certName) {
          return NextResponse.json(
            { error: 'Certification name cannot be empty' },
            { status: 400 }
          );
        }
        updateData.certName = certName;
      }

      if (body.memberId !== undefined && isAdmin) {
        const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
        if (memberId) {
          updateData.memberId = memberId;
        }
      }

      if (body.certExpiration !== undefined) {
        const parsed = body.certExpiration ? new Date(body.certExpiration) : null;
        if (parsed && Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: 'Invalid expiration date' },
            { status: 400 }
          );
        }
        updateData.certExpiration = parsed;
      }

      if (body.certIssueDate !== undefined) {
        const parsed = body.certIssueDate ? new Date(body.certIssueDate) : null;
        if (parsed && Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: 'Invalid issue date' },
            { status: 400 }
          );
        }
        updateData.certIssueDate = parsed;
      }

      if (body.certNumber !== undefined) {
        const certNumber = typeof body.certNumber === 'string' ? body.certNumber.trim() : '';
        updateData.certNumber = certNumber || null;
      }

      if (body.issuingAuthority !== undefined) {
        const issuingAuthority = typeof body.issuingAuthority === 'string'
          ? body.issuingAuthority.trim()
          : '';
        updateData.issuingAuthority = issuingAuthority || null;
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 415 }
      );
    }

    if (!Object.keys(updateData).length) {
      return NextResponse.json(existing);
    }

    const certification = await prisma.certification.update({
      where: { id },
      data: updateData,
    });

    if (shouldReplaceFile && existing.certScan) {
      try {
        await deleteFile(existing.certScan, session.user.id, isAdmin);
      } catch (error) {
        console.error('Failed to delete old certification scan:', error);
      }
    }

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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existing = await prisma.certification.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.isAdmin === true;
    const isOwner = existing.memberId === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.certification.delete({
      where: { id },
    });

    if (existing.certScan) {
      try {
        await deleteFile(existing.certScan, session.user.id, isAdmin);
      } catch (error) {
        console.error('Failed to delete certification file during removal:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}