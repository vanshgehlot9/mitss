import { NextRequest, NextResponse } from 'next/server'
import { database, ref, get, push, set, update, query, orderByChild } from '@/lib/firebase-realtime'
import { runTransaction } from 'firebase/database'
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit'

// Helper function to ensure `database` is defined
function getDatabaseInstance() {
  if (!database) {
    throw new Error('Firebase database is not initialized. Check your configuration.')
  }
  return database
}

// GET - Fetch orders (all or by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    // Fetch specific order
    if (orderId) {
      const orderRef = ref(getDatabaseInstance(), `orders/${orderId}`)
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
      const ordersRef = ref(getDatabaseInstance(), 'orders')
      const userOrdersQuery = query(ordersRef, orderByChild('userId'))
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
    const ordersRef = ref(getDatabaseInstance(), 'orders')
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
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.createOrder);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(
            rateLimit.allowed,
            rateLimit.remaining,
            rateLimit.resetTime
          ),
        }
      );
    }

    const body = await request.json();
    console.log('Order request body:', {
      userId: body.userId,
      userEmail: body.userEmail,
      itemsCount: body.items?.length,
      hasShippingAddress: !!body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
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
      razorpayPaymentId,
    } = body;

    if (!items || items.length === 0 || !shippingAddress || !userEmail) {
      console.error('Order validation failed:', {
        hasItems: !!items,
        itemsLength: items?.length,
        hasShippingAddress: !!shippingAddress,
        hasUserEmail: !!userEmail,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderNumber = `MITSS${Date.now()}`;
    const orderData = createOrderData(body, orderNumber);

    const reservedItems = await reserveStock(items);
    const reservationId = await createReservation(reservedItems);

    orderData.reservationId = reservationId;
    const orderId = await addOrderToDatabase(orderData);

    await updateReservationWithOrderId(reservationId, orderId);
    await sendOrderConfirmationEmail(userEmail, orderNumber, userName, shippingAddress, items, pricing, paymentMethod, orderId);

    console.log('Order created successfully:', { orderId, orderNumber });
    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      reservationId,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

async function reserveStock(items: any[]) {
  const reservedItems: Array<{ productId: string; quantity: number }> = [];
  for (const it of items) {
    const productId = it.productId || it._id || it.id;
    const qty = parseInt(it.quantity || it.qty || 1);
    const productRef = ref(getDatabaseInstance(), `products/${productId}`);

    const txResult = await runTransaction(productRef, (current) => {
      if (!current) return;
      const currentStock = current.stock || 0;
      if (currentStock < qty) {
        return;
      }
      return { ...current, stock: currentStock - qty };
    });

    if (!txResult.committed) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    reservedItems.push({ productId, quantity: qty });
  }
  return reservedItems;
}

async function createReservation(reservedItems: any[]) {
  const reservationsRef = ref(getDatabaseInstance(), 'stock_reservations');
  const newResRef = push(reservationsRef);
  const reservationId = newResRef.key;
  await set(newResRef, {
    orderId: null,
    items: reservedItems,
    status: 'reserved',
    createdAt: new Date().toISOString(),
  });
  return reservationId;
}

async function addOrderToDatabase(orderData: any) {
  const ordersRef = ref(getDatabaseInstance(), 'orders');
  const newOrderRef = push(ordersRef);
  const orderId = newOrderRef.key;
  await set(newOrderRef, orderData);
  return orderId;
}

async function updateReservationWithOrderId(reservationId: string, orderId: string) {
  const reservationsRef = ref(getDatabaseInstance(), `stock_reservations/${reservationId}`);
  await update(reservationsRef, { orderId });
}

async function sendOrderConfirmationEmail(
  userEmail: string,
  orderNumber: string,
  userName: string,
  shippingAddress: any,
  items: any[],
  pricing: any,
  paymentMethod: string,
  orderId: string
) {
  const { sendOrderConfirmation } = await import('@/lib/email-service');

  let invoicePdfBuffer: Buffer | undefined;
  try {
    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/invoice?orderId=${orderId}&format=pdf`,
      {
        headers: {
          'x-user-id': 'system',
        },
      }
    );

    if (invoiceResponse.ok) {
      const arrayBuffer = await invoiceResponse.arrayBuffer();
      invoicePdfBuffer = Buffer.from(arrayBuffer);
    }
  } catch (invoiceError) {
    console.warn('Failed to fetch invoice PDF for email:', invoiceError);
  }

  await sendOrderConfirmation(
    userEmail,
    {
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: shippingAddress.phone || 'N/A',
      address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price * item.quantity,
        image: item.image,
      })),
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      total: pricing.total,
      paymentMethod,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    },
    invoicePdfBuffer
  );
}

function createOrderData(body: any, orderNumber: string) {
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
    razorpayPaymentId,
  } = body;

  return {
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
      total: pricing?.total || 0,
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
          message: 'Order has been placed successfully',
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reservationId: '', // Added default value for `reservationId`
  };
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

    const orderRef = ref(getDatabaseInstance(), `orders/${orderId}`)
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
          const resRef = ref(getDatabaseInstance(), `stock_reservations/${reservationId}`)
          const resSnap = await get(resRef)
          if (resSnap.exists()) {
            const reservation = resSnap.val()
            if (reservation.items && reservation.items.length > 0 && reservation.status === 'reserved') {
              // Restore items
              for (const item of reservation.items) {
                const productRef = ref(getDatabaseInstance(), `products/${item.productId}`)
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
