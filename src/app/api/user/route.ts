import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/user';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error('User not found');
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}