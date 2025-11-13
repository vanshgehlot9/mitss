import { NextRequest, NextResponse } from 'next/server'
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  moveToCart,
  createSharedWishlist,
  getSharedWishlist,
  setPriceAlert,
  setStockAlert
} from '@/lib/wishlist-service'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// GET - Get user's wishlist or shared wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const shareCode = searchParams.get('shareCode')

    // Get shared wishlist
    if (shareCode) {
      const sharedWishlist = await getSharedWishlist(shareCode)

      if (!sharedWishlist) {
        return NextResponse.json(
          { success: false, message: 'Shared wishlist not found or expired' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        wishlist: sharedWishlist
      })
    }

    // Get user's wishlist
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const wishlist = await getUserWishlist(userId)

    return NextResponse.json({
      success: true,
      wishlist,
      count: wishlist.length
    })
  } catch (error) {
    console.error('Wishlist GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST - Add to wishlist, move to cart, share, or set alerts
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.api)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action, userId, productId, productData, quantity, productIds, userName, isPublic, expiresInDays, targetPrice, currentPrice, variantId } = body

    // Add to wishlist
    if (action === 'add') {
      if (!userId || !productId || !productData) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await addToWishlist(userId, productId, productData)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Move to cart
    if (action === 'moveToCart') {
      if (!userId || !productId) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await moveToCart(userId, productId, quantity || 1)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Share wishlist
    if (action === 'share') {
      if (!userId || !userName || !productIds || productIds.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await createSharedWishlist(
        userId,
        userName,
        productIds,
        isPublic !== false,
        expiresInDays
      )
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Set price alert
    if (action === 'setPriceAlert') {
      if (!userId || !productId || !targetPrice || !currentPrice) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await setPriceAlert(userId, productId, targetPrice, currentPrice)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Set stock alert
    if (action === 'setStockAlert') {
      if (!userId || !productId) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await setStockAlert(userId, productId, variantId)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Wishlist POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    const result = await removeFromWishlist(userId, parseInt(productId))
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error('Wishlist DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
