import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// POST - Add address
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const address = await request.json()
    const addressWithId = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const client = await clientPromise
    const db = client.db('mitss-ecommerce')
    
    await db.collection('users').updateOne(
      { uid: userId },
      { 
        $push: { addresses: addressWithId },
        $set: { updatedAt: new Date() }
      }
    )

    return NextResponse.json({ success: true, address: addressWithId })
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
  }
}

// PATCH - Update address
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { addressId, ...updates } = await request.json()

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('users').updateOne(
      { uid: userId, 'addresses.id': addressId },
      { 
        $set: { 
          'addresses.$': { id: addressId, ...updates },
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

// DELETE - Remove address
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const addressId = request.nextUrl.searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    await db.collection('users').updateOne(
      { uid: userId },
      { 
        $pull: { addresses: { id: addressId } } as any,
        $set: { updatedAt: new Date() }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
