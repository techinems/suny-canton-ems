import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login'];

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));
  
  // Get the token from the cookies
  const token = request.cookies.get('directus_session_token')?.value;
  
  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // If the path is login and there's a token, redirect to home
  if (path === '/login' && token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (e.g., images, fonts, etc.)
    // - Favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};