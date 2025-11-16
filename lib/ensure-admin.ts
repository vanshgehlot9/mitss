import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import admin from 'firebase-admin'

// Initialize firebase-admin if not already initialized
function initFirebaseAdminIfNeeded() {
  try {
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

      if (privateKey && clientEmail && projectId) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            // Replace escaped newlines if present
            privateKey: privateKey.replace(/\\n/g, '\n'),
          } as any),
        })
      } else {
        // If not configured, app will not be initialized and token verification will be skipped
        console.warn('firebase-admin not fully configured; skipping ID token verification')
      }
    }
  } catch (err) {
    console.error('Error initializing firebase-admin:', err)
  }
}

/**
 * Server-side helper to require admin access for API routes.
 * Tries to verify Firebase ID token (Authorization header or cookies).
 * Falls back to `x-user-id` header if token verification isn't available.
 * Returns `null` when authorized, or a `NextResponse` to return from the route.
 */
export async function requireAdmin(request: NextRequest): Promise<null | NextResponse> {
  try {
    // Attempt to verify Firebase ID token first (Authorization: Bearer <token>)
    initFirebaseAdminIfNeeded()

    let uid: string | null = null

    const authHeader = request.headers.get('authorization') || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1].trim() : null

    const cookieToken = request.cookies.get('__session')?.value || request.cookies.get('firebaseToken')?.value || request.cookies.get('token')?.value

    const tokenToVerify = bearer || cookieToken || null

    if (tokenToVerify && admin.apps.length) {
      try {
        const decoded = await admin.auth().verifyIdToken(tokenToVerify)
        uid = decoded.uid
      } catch (err) {
        console.warn('Failed to verify ID token:', err)
        // Continue to fallback to x-user-id header
      }
    }

    // Fallback to x-user-id header if token not provided or verification failed
    if (!uid) {
      const headerUid = request.headers.get('x-user-id')
      if (headerUid) uid = headerUid
    }

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized - missing user id or valid token' }, { status: 401 })
    }

    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')

    const roleDoc = await db.collection('userRoles').findOne({ uid })

    if (!roleDoc) {
      return NextResponse.json({ error: 'Forbidden - role not found' }, { status: 403 })
    }

    const role = roleDoc.role || ''
    if (!(role === 'admin' || role === 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    // Authorized
    return null
  } catch (error) {
    console.error('Error in requireAdmin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export default requireAdmin
