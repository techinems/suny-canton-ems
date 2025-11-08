import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBaseUrl } from './lib/utils';
import { auth } from './lib/auth';

// Define paths that don't require authentication
const publicPaths = ['/login', '/register', '/public', '/api/auth', '/reset-password'];

export async function proxy(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;

  const isAdminApiRoute = path.startsWith('/api/admin');
  const isAdminPageRoute =
    path === '/dashboard/buildings' ||
    path.startsWith('/dashboard/buildings/') ||
    path === '/dashboard/members/new' ||
    (path.startsWith('/dashboard/members/') && path !== '/dashboard/members');

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  const isAuthenticated = !!session;
  const isAdmin = !!session?.user.isAdmin;

  // If the user is authenticated and trying to access the login or register page, redirect to dashboard
  if (isAuthenticated && (path === '/login' || path === '/register')) {
    const dashboardUrl = new URL('/dashboard', getBaseUrl(request));
    return NextResponse.redirect(dashboardUrl);
  }

  if (isAdminApiRoute) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    // Create the URL to redirect to
    const loginUrl = new URL('/login', getBaseUrl(request));
    
    // Redirect to the login page
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPageRoute && !isAdmin) {
    const dashboardUrl = new URL('/dashboard', getBaseUrl(request));
    return NextResponse.redirect(dashboardUrl);
  }

  // Continue with the request if authenticated or accessing public paths
  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - except auth routes which we need to handle
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};