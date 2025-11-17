import { NextRequest, NextResponse } from 'next/server'
import { database, ref, push, update, get } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'

// POST - Create return/exchange request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, reason, description, returnType } = body

    if (!orderId || !reason || !returnType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['return', 'exchange'].includes(returnType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid return type' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch the order to verify it exists
    const orderSnapshot = await get(ref(database, `orders/${orderId}`))
    if (!orderSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderSnapshot.val()

    // Check if order can be returned (must be delivered)
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order must be delivered before requesting return/exchange' 
        },
        { status: 400 }
      )
    }

    // Create return/exchange request
    const requestsRef = ref(database, 'returns_and_exchanges')
    const newRequestRef = await push(requestsRef, {
      orderId,
      userId: order.userId || order.userEmail,
      userEmail: order.userEmail,
      userName: order.userName,
      returnType,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: order.items,
      orderAmount: order.pricing.total,
      shippingAddress: order.shippingAddress
    })

    // Update order with return request ID
    await update(ref(database, `orders/${orderId}`), {
      returnRequestId: newRequestRef.key,
      lastUpdated: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `${returnType === 'return' ? 'Return' : 'Exchange'} request submitted successfully`,
      requestId: newRequestRef.key
    })
  } catch (error: any) {
    console.error('Error creating return/exchange request:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch return/exchange requests for order or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const userId = searchParams.get('userId')
    const requestId = searchParams.get('requestId')

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch specific return request
    if (requestId) {
      const snapshot = await get(ref(database, `returns_and_exchanges/${requestId}`))
      if (!snapshot.exists()) {
        return NextResponse.json(
          { success: false, error: 'Return request not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        request: { id: requestId, ...snapshot.val() }
      })
    }

    // Fetch requests for specific order
    if (orderId) {
      const snapshot = await get(ref(database, 'returns_and_exchanges'))
      const requests: any[] = []
      if (snapshot.exists()) {
        const data = snapshot.val()
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value.orderId === orderId) {
            requests.push({ id: key, ...value })
          }
        })
      }
      return NextResponse.json({
        success: true,
        requests
      })
    }

    // Fetch requests for user
    if (userId) {
      const snapshot = await get(ref(database, 'returns_and_exchanges'))
      const requests: any[] = []
      if (snapshot.exists()) {
        const data = snapshot.val()
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value.userId === userId || value.userEmail === userId) {
            requests.push({ id: key, ...value })
          }
        })
      }
      return NextResponse.json({
        success: true,
        requests
      })
    }

    return NextResponse.json(
      { success: false, error: 'Provide orderId, userId, or requestId' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error fetching return requests:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
