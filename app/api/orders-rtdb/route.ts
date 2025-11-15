import { NextRequest, NextResponse } from 'next/server'
import { database, ref, push, set } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    console.log('=== Orders API (Realtime DB): Creating new order ===')
    
    const body = await request.json()
    console.log('Order request body:', {
      userId: body.userId,
      userEmail: body.userEmail,
      itemsCount: body.items?.length,
      hasShippingAddress: !!body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus
    })
    
    if (!database) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const {
      userId,
      userEmail,
      userName,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      pricing,
      customerInfo,
      isGuestOrder,
      razorpayOrderId,
      razorpayPaymentId
    } = body

    if (!items || items.length === 0 || !shippingAddress || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `MITSS${Date.now()}`
    const timestamp = new Date().toISOString()

    // Create order object
    const orderData = {
      orderNumber,
      userId: userId || null,
      userEmail,
      userName,
      isGuestOrder: isGuestOrder || false,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      total: pricing?.total || 0,
      subtotal: pricing?.subtotal || 0,
      shipping: pricing?.shipping || 0,
      gst: pricing?.gst || 0,
      pricing: {
        subtotal: pricing?.subtotal || 0,
        shipping: pricing?.shipping || 0,
        gst: pricing?.gst || 0,
        total: pricing?.total || 0
      },
      customerInfo: customerInfo || {},
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      status: 'pending',
      paymentStatus: body.paymentStatus || 'pending',
      trackingInfo: {
        status: 'order_placed',
        statusHistory: [
          {
            status: 'order_placed',
            timestamp,
            message: 'Order has been placed successfully'
          }
        ]
      },
      createdAt: timestamp,
      updatedAt: timestamp
    }

    // Add order to Realtime Database
    console.log('Adding order to Realtime Database...')
    const ordersRef = ref(database, 'orders')
    const newOrderRef = push(ordersRef)
    await set(newOrderRef, orderData)
    
    const orderId = newOrderRef.key
    console.log('Order added successfully with ID:', orderId)

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Order created successfully'
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}
