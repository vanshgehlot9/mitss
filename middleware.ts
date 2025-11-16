import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is simplified for Next.js 16+
// Most authentication is handled client-side with Firebase
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin UI routes and admin API routes
  if (pathname.startsWith('/admin')) {
    // Basic check: require a session/auth cookie to be present.
    // NOTE: This is a lightweight guard. For full RBAC verification,
    // validate tokens on server APIs (see lib/admin-roles.ts and API-level checks).
    const cookieNamesToCheck = [
      'token',
      '__session',
      'session',
      'next-auth.session-token',
      'firebaseToken',
    ]

    const hasAuthCookie = cookieNamesToCheck.some((name) => !!request.cookies.get(name))

    if (!hasAuthCookie) {
      // Redirect unauthenticated users to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Allow everything else to proceed. API-level admin checks should be
  // enforced inside the API route handlers using server-side verification.
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Explicitly protect admin UI and API paths
    '/admin/:path*',
    '/api/admin/:path*',

    // Keep original broad matcher for other app routes
    '/((?!api|_next/static|_next/image|favicon.ico|manifest|robots|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)).*)',
  ],
}
