import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET - Get user role
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    let userRole = await db.collection('userRoles').findOne({ uid: userId })

    // If no role exists, create one based on super admin list
    if (!userRole) {
      // Get user email from users collection
      const user = await db.collection('users').findOne({ uid: userId })
      const userEmail = user?.email || ''
      
      // Check if user is super admin
      const superAdminEmails = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)
      
      const role = superAdminEmails.includes(userEmail) ? 'super_admin' : 'customer'
      
      // Create default role
      const defaultRole = {
        uid: userId,
        email: userEmail,
        role: role,
        permissions: role === 'super_admin' 
          ? ['view:products', 'create:order', 'view:all_orders', 'update:order_status', 
             'view:analytics', 'manage:products', 'manage:inventory', 'view:customers', 
             'moderate:reviews', 'manage:admins', 'manage:settings', 'view:logs']
          : ['view:products', 'create:order', 'view:own_orders', 'create:review'],
        assignedBy: 'system',
        assignedAt: new Date()
      }
      
      await db.collection('userRoles').insertOne(defaultRole)
      userRole = defaultRole as any
    }

    return NextResponse.json(userRole)
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 })
  }
}

// POST - Assign user role
export async function POST(request: NextRequest) {
  try {
    const adminUserId = request.headers.get('x-user-id')
    
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin has permission to assign roles
    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const adminRole = await db.collection('userRoles').findOne({ uid: adminUserId })

    if (!adminRole || adminRole.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const roleData = await request.json()

    await db.collection('userRoles').updateOne(
      { uid: roleData.uid },
      { 
        $set: { 
          ...roleData,
          assignedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning user role:', error)
    return NextResponse.json({ error: 'Failed to assign user role' }, { status: 500 })
  }
}
