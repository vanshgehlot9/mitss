import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const password = body.password

    // Get password from env - fallback to simple default
    const adminPassword = process.env.ADMIN_PASSWORD

    // If not set, deny
    if (!adminPassword) {
      console.error('[ADMIN AUTH] ADMIN_PASSWORD not set in environment')
      return NextResponse.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      )
    }

    console.log('[ADMIN AUTH] Attempt - password length:', password?.length, 'env password length:', adminPassword.length)

    // Simple check
    if (password === adminPassword) {
      console.log('[ADMIN AUTH] Success')
      const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).slice(2)
      return NextResponse.json({ success: true, token }, { status: 200 })
    }

    console.log('[ADMIN AUTH] Failed - password mismatch')
    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('[ADMIN AUTH] Error:', error.message)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
