import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const cart = await db.collection('carts').findOne({ userId })

    return NextResponse.json({ items: cart?.items || [] })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST - Save cart
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('carts').updateOne(
      { userId },
      { 
        $set: { 
          items, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 })
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('carts').deleteOne({ userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
