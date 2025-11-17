import { NextRequest, NextResponse } from 'next/server'
import { database, ref, push, get, update, set } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'

// POST - Create new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxUses, 
      expiryDate,
      description,
      isActive 
    } = body

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, discountType, discountValue' },
        { status: 400 }
      )
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        { success: false, error: 'discountType must be percentage or fixed' },
        { status: 400 }
      )
    }

    if (discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Discount value must be greater than 0' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Check if coupon already exists
    const snapshot = await get(ref(database, `coupons/${code.toUpperCase()}`))
    if (snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 }
      )
    }

    // Create coupon
    await set(ref(database, `coupons/${code.toUpperCase()}`), {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxUses: maxUses || null,
      currentUses: 0,
      expiryDate: expiryDate || null,
      description: description || '',
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: {
        code: code.toUpperCase(),
        discountType,
        discountValue
      }
    })
  } catch (error: any) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch and validate coupon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const cartValue = searchParams.get('cartValue')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch coupon
    const snapshot = await get(ref(database, `coupons/${code.toUpperCase()}`))
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Coupon code not found' },
        { status: 404 }
      )
    }

    const coupon = snapshot.val()

    // Validate coupon
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is not active' },
        { status: 400 }
      )
    }

    // Check expiry
    if (coupon.expiryDate) {
      const expiryDate = new Date(coupon.expiryDate)
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Coupon code has expired' },
          { status: 400 }
        )
      }
    }

    // Check max uses
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Coupon code usage limit reached' },
        { status: 400 }
      )
    }

    // Check minimum order value
    if (cartValue) {
      const cartTotal = parseFloat(cartValue)
      if (cartTotal < coupon.minOrderValue) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Minimum order value of ₹${coupon.minOrderValue} required` 
          },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (cartValue) {
      const cartTotal = parseFloat(cartValue)
      if (coupon.discountType === 'percentage') {
        discountAmount = (cartTotal * coupon.discountValue) / 100
      } else {
        discountAmount = coupon.discountValue
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description
      }
    })
  } catch (error: any) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Apply coupon to order
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderId } = body

    if (!code || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Code and orderId are required' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch coupon
    const couponSnapshot = await get(ref(database, `coupons/${code.toUpperCase()}`))
    if (!couponSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Coupon code not found' },
        { status: 404 }
      )
    }

    const coupon = couponSnapshot.val()

    // Fetch order
    const orderSnapshot = await get(ref(database, `orders/${orderId}`))
    if (!orderSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderSnapshot.val()

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (order.pricing.subtotal * coupon.discountValue) / 100
    } else {
      discountAmount = coupon.discountValue
    }

    // Update order with coupon details
    await update(ref(database, `orders/${orderId}`), {
      appliedCoupon: code.toUpperCase(),
      couponDiscount: discountAmount,
      pricing: {
        ...order.pricing,
        subtotal: order.pricing.subtotal - discountAmount,
        total: (order.pricing.subtotal - discountAmount) + order.pricing.shipping + order.pricing.gst
      }
    })

    // Increment coupon usage
    await update(ref(database, `coupons/${code.toUpperCase()}`), {
      currentUses: (coupon.currentUses || 0) + 1
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount
    })
  } catch (error: any) {
    console.error('Error applying coupon:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
