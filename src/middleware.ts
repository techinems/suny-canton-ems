import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if X-Forwarded-Host header is present
  const forwardedHost = request.headers.get('x-forwarded-host');
  
  if (forwardedHost) {
    // Get the protocol from the X-Forwarded-Proto header or infer from the current URL
    const protocol = request.headers.get('x-forwarded-proto') || 
      (request.url.startsWith('https') ? 'https' : 'http');
    
    // Create a new URL with the forwarded host
    const newUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `${protocol}://${forwardedHost}`);
    
    // Rewrite the URL using NextResponse.rewrite()
    // This preserves the original URL in the browser but internally rewrites it
    return NextResponse.rewrite(newUrl);
  }
  
  // If no X-Forwarded-Host, continue without modification
  return NextResponse.next();
}

// Configure on which paths this middleware will run
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};