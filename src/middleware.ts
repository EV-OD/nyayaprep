
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Note: Firebase Admin SDK cannot be used directly in Edge Middleware.
// Authentication checks need to happen client-side or via backend API routes.
// This middleware primarily checks for the presence of a session cookie (if applicable)
// or relies on client-side checks within layouts.

// Basic middleware structure (can be expanded)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Example: Redirect root to login if no authentication detected (adjust logic as needed)
  // This is a placeholder and needs proper auth token checking if using server-side sessions
  // const sessionToken = request.cookies.get('sessionToken')?.value;
  // if (pathname === '/' && !sessionToken) {
  //    return NextResponse.redirect(new URL('/login', request.url));
  // }

  // Protecting specific routes can be complex in middleware without backend checks.
  // Relying on client-side checks in layouts (like AdminLayout) is often more practical
  // for Firebase Auth which is primarily client-side.

  // If you WERE using a backend session / API route for role checks:
  // if (pathname.startsWith('/admin')) {
  //   // Check authentication and role via an API route or token validation
  //   const isAdmin = await checkAdminRole(sessionToken); // Hypothetical function
  //   if (!isAdmin) {
  //     return NextResponse.redirect(new URL('/login', request.url)); // Or an unauthorized page
  //   }
  // }

  return NextResponse.next(); // Allow the request to proceed
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - register
     */
     // Apply middleware carefully. For now, let's keep it minimal
     // to avoid interfering with client-side auth checks in layouts.
     // '/admin/:path*', // Example: Protect admin routes (requires robust check)
     // '/', // Example: Redirect root if not logged in (requires robust check)

     // No matcher for now, rely on layout checks
  ],
};
