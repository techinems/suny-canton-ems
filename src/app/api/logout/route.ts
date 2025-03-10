import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  
  // Clear the auth cookie
  cookieStore.set('directus_session_token', '', { 
    expires: new Date(0),
    path: '/',
  });
  
  return NextResponse.redirect(new URL('/login', getBaseUrl(request)));
}