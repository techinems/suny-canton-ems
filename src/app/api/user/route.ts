import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/user';

export async function GET() {
  try {
    const { user } = await getAuthenticatedUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}