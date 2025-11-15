import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

function isCodeValid(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  try {
    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const expectedCode = process.env.REGISTRATION_ACCESS_CODE;

  if (!expectedCode) {
    return NextResponse.json({
      message: 'Registration is currently unavailable. Please contact an administrator.',
    }, {
      status: 503,
    });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 });
  }

  const code = typeof payload === 'object' && payload !== null
    ? (payload as { code?: unknown }).code
    : undefined;

  if (typeof code !== 'string' || code.trim().length === 0) {
    return NextResponse.json({ message: 'Registration code is required.' }, { status: 400 });
  }

  if (!isCodeValid(code.trim(), expectedCode)) {
    return NextResponse.json({ message: 'Invalid registration code.' }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
