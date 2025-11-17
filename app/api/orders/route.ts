import { NextRequest, NextResponse } from 'next/server'
import { database, ref, get, push, set, update, query, orderByChild } from '@/lib/firebase-realtime'
import { equalTo } from 'firebase/database'
import { runTransaction } from 'firebase/database'
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit'

// GET - Fetch orders (all or by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    // Fetch specific order
    if (orderId) {
      const orderRef = ref(database!, `orders/${orderId}`)
      const snapshot = await get(orderRef)
      
      if (!snapshot.exists()) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        order: { id: orderId, ...snapshot.val() }
      })
    }

    // Fetch orders by user
    if (userId) {
      const ordersRef = ref(database!, 'orders')
      const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(userId))
      const snapshot = await get(userOrdersQuery)
      
      if (!snapshot.exists()) {
        return NextResponse.json({
          success: true,
          orders: []
        })
      }

      const orders: any[] = []
      snapshot.forEach((childSnapshot) => {
        orders.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })

      // Sort by createdAt descending
      orders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })

      return NextResponse.json({
        success: true,
        orders
      })
    }

    // Fetch all orders (admin only)
    const ordersRef = ref(database!, 'orders')
    const snapshot = await get(ordersRef)
    
    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        orders: []
      })
    }

    const orders: any[] = []
    snapshot.forEach((childSnapshot) => {
      orders.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })

    // Sort by createdAt descending
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

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
    console.log('=== Orders API: Creating new order ===');
    
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
    console.log('Order request body:', {
      userId: body.userId,
      userEmail: body.userEmail,
      itemsCount: body.items?.length,
      hasShippingAddress: !!body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus
    });
    
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

    // Validate required fields (userId can be null for guest orders)
    if (!items || items.length === 0 || !shippingAddress || !userEmail) {
      console.error('Order validation failed:', {
        hasItems: !!items,
        itemsLength: items?.length,
        hasShippingAddress: !!shippingAddress,
        hasUserEmail: !!userEmail
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `MITSS${Date.now()}`

    // Create order object with safe defaults (Firestore doesn't accept undefined)
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
      total: pricing?.total || 0, // Add total at root level for easy access
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
            timestamp: new Date(),
            message: 'Order has been placed successfully'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Reserve stock for all items (to prevent oversell)
    const reservedItems: Array<{ productId: string; quantity: number }> = []
    try {
      for (const it of items) {
        const productId = it.productId || it._id || it.id
        const qty = parseInt(it.quantity || it.qty || 1)
        const productRef = ref(database!, `products/${productId}`)

        const txResult = await runTransaction(productRef, (current) => {
          if (!current) return // abort if product missing
          const currentStock = current.stock || 0
          if (currentStock < qty) {
            return // abort transaction
          }
          // decrement stock
          return { ...current, stock: currentStock - qty }
        })

        if (!txResult.committed) {
          throw new Error(`Insufficient stock for product ${productId}`)
        }

        reservedItems.push({ productId, quantity: qty })
      }

      // Create reservation record
      const reservationsRef = ref(database!, 'stock_reservations')
      const newResRef = push(reservationsRef)
      const reservationId = newResRef.key
      await set(newResRef, {
        orderId: null,
        items: reservedItems,
        status: 'reserved',
        createdAt: new Date().toISOString()
      })

      // Attach reservation id to order data
      ;(orderData as any).reservationId = reservationId

      // Add order to Realtime Database
      console.log('Adding order to Realtime Database...');
      const ordersRef = ref(database!, 'orders')
      const newOrderRef = push(ordersRef)
      const orderId = newOrderRef.key
      try {
        await set(newOrderRef, orderData)
        console.log('Order added successfully with ID:', orderId);
      } catch (dbError: any) {
        console.error('Database write error:', dbError);
        throw dbError;
      }

      // Update reservation to include orderId
      await update(newResRef, { orderId })

      // Note: User order history updates removed for now
      // Can be re-implemented with Realtime Database if needed

      // Send order confirmation email
      try {
        const { sendOrderConfirmation } = await import('@/lib/email-service')
        await sendOrderConfirmation(userEmail, {
          orderNumber,
          customerName: userName,
          email: userEmail,
          phone: shippingAddress.phone || 'N/A',
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
          items: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price * item.quantity,
            image: item.image
          })),
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          total: pricing.total,
          paymentMethod: 'Razorpay',
          orderDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        })
      } catch (err) {
        console.error('Failed to send confirmation email:', err)
        // Don't fail the order if email fails
      }

      console.log('Order created successfully:', { orderId, orderNumber });
      return NextResponse.json({
        success: true,
        orderId,
        orderNumber,
        reservationId,
        message: 'Order created successfully'
      })
    } catch (reserveErr: any) {
      console.error('Reservation error:', reserveErr)
      // Rollback any reserved items
      try {
        for (const r of reservedItems) {
          const productRef = ref(database!, `products/${r.productId}`)
          await runTransaction(productRef, (current) => {
            if (!current) return
            const currentStock = current.stock || 0
            return { ...current, stock: currentStock + r.quantity }
          })
        }
      } catch (rbErr) {
        console.error('Rollback failed:', rbErr)
      }

      return NextResponse.json({ error: reserveErr.message || 'Failed to reserve stock' }, { status: 409 })
    }

  } catch (error: any) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
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

    const orderRef = ref(database!, `orders/${orderId}`)
    const snapshot = await get(orderRef)

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    if (trackingInfo) {
      const currentTracking = snapshot.val().trackingInfo || { statusHistory: [] }
      updateData.trackingInfo = {
        ...currentTracking,
        status: trackingInfo.status,
        statusHistory: [
          ...currentTracking.statusHistory,
          {
            status: trackingInfo.status,
            timestamp: new Date().toISOString(),
            message: trackingInfo.message
          }
        ]
      }
    }

    await update(orderRef, updateData)

    // If payment failed or order cancelled, restore reserved stock
    if ((paymentStatus && paymentStatus === 'failed') || (status && status === 'cancelled')) {
      try {
        const snapshot = await get(orderRef)
        const order = snapshot.val()
        const reservationId = order?.reservationId
        if (reservationId) {
          // Fetch reservation
          const resRef = ref(database!, `stock_reservations/${reservationId}`)
          const resSnap = await get(resRef)
          if (resSnap.exists()) {
            const reservation = resSnap.val()
            if (reservation.items && reservation.items.length > 0 && reservation.status === 'reserved') {
              // Restore items
              for (const item of reservation.items) {
                const productRef = ref(database!, `products/${item.productId}`)
                await runTransaction(productRef, (current) => {
                  if (!current) return
                  const currentStock = current.stock || 0
                  return { ...current, stock: currentStock + (item.quantity || 0) }
                })
              }
              // Mark reservation restored
              await update(resRef, { status: 'restored', restoredAt: new Date().toISOString() })
            }
          }
        }
      } catch (restoreErr) {
        console.error('Failed to restore reservation stock:', restoreErr)
      }
    }

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
