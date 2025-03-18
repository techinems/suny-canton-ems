import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBaseUrl } from './lib/utils';
import { createPocketBaseServer } from './lib/server/pocketbase';

// Define paths that don't require authentication
const publicPaths = ['/login', '/public'];

export async function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

  // Create a new PocketBase instance for this request
  const pb = await createPocketBaseServer();
  
  // Check authentication using the request-scoped instance
  const isAuthenticated = pb.authStore.isValid;

  // If the user is authenticated and trying to access the login page, redirect to dashboard
  if (isAuthenticated && path === '/login') {
    const dashboardUrl = new URL('/dashboard', getBaseUrl(request));
    return NextResponse.redirect(dashboardUrl);
  }

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    // Create the URL to redirect to
    const loginUrl = new URL('/login', getBaseUrl(request));
    
    // Redirect to the login page
    return NextResponse.redirect(loginUrl);
  }

  // Continue with the request if authenticated or accessing public paths
  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};