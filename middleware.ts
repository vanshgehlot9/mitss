import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is simplified for Next.js 16+
// Most authentication is handled client-side with Firebase
export function middleware(request: NextRequest) {
  // Simply pass through - auth is handled client-side
  // You can add server-side auth checks here if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest, robots, sitemap
     * - images and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest|robots|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)).*)',
  ],
}
