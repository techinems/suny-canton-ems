import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  
  // Clear the auth cookie
  cookieStore.set('directus_session_token', '', { 
    expires: new Date(0),
    path: '/',
  });
  
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}