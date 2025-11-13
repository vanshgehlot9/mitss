import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { sendOrderConfirmationEmail } from '@/lib/email-service'
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit'
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

// GET - Fetch orders (all or by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    // Fetch specific order
    if (orderId) {
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      
      if (!orderDoc.exists()) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        order: { id: orderDoc.id, ...orderDoc.data() }
      })
    }

    // Fetch orders by user
    if (userId) {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return NextResponse.json({
        success: true,
        orders
      })
    }

    // Fetch all orders (admin only)
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      orders
    })

  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.createOrder)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit.allowed, rateLimit.remaining, rateLimit.resetTime)
        }
      )
    }
    
    const body = await request.json()
    const {
      userId,
      userEmail,
      userName,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      pricing,
      customerInfo
    } = body

    // Validate required fields
    if (!userId || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `MITSS${Date.now()}`

    // Create order object
    const orderData = {
      orderNumber,
      userId,
      userEmail,
      userName,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        gst: pricing.gst,
        total: pricing.total
      },
      customerInfo,
      status: 'pending',
      paymentStatus: 'pending',
      trackingInfo: {
        status: 'order_placed',
        statusHistory: [
          {
            status: 'order_placed',
            timestamp: new Date(),
            message: 'Order has been placed successfully'
          }
        ]
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Add order to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData)

    // Update product inventory
    for (const item of items) {
      try {
        const productRef = doc(db, 'products', item.id.toString())
        const productDoc = await getDoc(productRef)
        
        if (productDoc.exists()) {
          const currentStock = productDoc.data().stock || 0
          await updateDoc(productRef, {
            stock: Math.max(0, currentStock - item.quantity),
            soldCount: (productDoc.data().soldCount || 0) + item.quantity
          })
        }
      } catch (err) {
        console.error(`Failed to update inventory for product ${item.id}:`, err)
      }
    }

    // Update user's order history
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const orderHistory = userDoc.data().orderHistory || []
        await updateDoc(userRef, {
          orderHistory: [...orderHistory, orderRef.id]
        })
      }
    } catch (err) {
      console.error('Failed to update user order history:', err)
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderNumber,
        customerName: userName,
        customerEmail: userEmail,
        items,
        pricing,
        shippingAddress
      })
    } catch (err) {
      console.error('Failed to send confirmation email:', err)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderNumber,
      message: 'Order created successfully'
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, paymentStatus, trackingInfo } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: serverTimestamp()
    }

    if (status) {
      updateData.status = status
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    if (trackingInfo) {
      const currentTracking = orderDoc.data().trackingInfo || { statusHistory: [] }
      updateData.trackingInfo = {
        ...currentTracking,
        status: trackingInfo.status,
        statusHistory: [
          ...currentTracking.statusHistory,
          {
            status: trackingInfo.status,
            timestamp: new Date(),
            message: trackingInfo.message
          }
        ]
      }
    }

    await updateDoc(orderRef, updateData)

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    )
  }
}
