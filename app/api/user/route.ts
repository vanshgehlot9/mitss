import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET - Fetch user data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const user = await db.collection('users').findOne({ uid: userId })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// POST - Create or update user
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await request.json()

    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('users').updateOne(
      { uid: userId },
      { 
        $set: { 
          ...userData,
          uid: userId,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('users').updateOne(
      { uid: userId },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
