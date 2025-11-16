import { NextRequest, NextResponse } from 'next/server'
import { database, ref, push, set, get, update } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export interface Review {
  id?: string
  productId: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verifiedPurchase: boolean
  helpful: number
  notHelpful: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status') || 'approved'
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!database) {
      // Return empty reviews if database not available
      return NextResponse.json({
        success: true,
        reviews: [],
        ratingSummary: {
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      })
    }

    // Fetch all reviews for this product
    const reviewsRef = ref(database, 'reviews')
    const snapshot = await get(reviewsRef)
    
    const reviews: Review[] = []
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    
    if (snapshot.exists()) {
      const allReviews = snapshot.val()
      
      Object.entries(allReviews).forEach(([id, data]: [string, any]) => {
        if (data.productId === productId && data.status === status) {
          reviews.push({
            id,
            ...data
          })
          
          // Count rating distribution
          if (data.rating >= 1 && data.rating <= 5) {
            distribution[data.rating as keyof typeof distribution]++
          }
        }
      })
    }

    // Sort by date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate rating summary
    const total = reviews.length
    const average = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0

    return NextResponse.json({
      success: true,
      reviews,
      ratingSummary: {
        average: Math.round(average * 10) / 10,
        total,
        distribution
      }
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        details: error.message,
        success: true,
        reviews: [],
        ratingSummary: {
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      },
      { status: 200 } // Return 200 with empty data instead of error
    )
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      images
    } = body

    // Validation
    if (!productId || !rating || !comment || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, rating, comment, userName' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Check if user already reviewed this product
    const reviewsRef = ref(database, 'reviews')
    const snapshot = await get(reviewsRef)
    
    if (snapshot.exists()) {
      const allReviews = snapshot.val()
      const existingReview = Object.values(allReviews).find(
        (r: any) => r.productId === productId && r.userEmail === userEmail
      )
      
      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
    }

    // Check for verified purchase
    let verifiedPurchase = false
    if (userEmail) {
      const ordersRef = ref(database, 'orders')
      const ordersSnapshot = await get(ordersRef)
      
      if (ordersSnapshot.exists()) {
        const allOrders = ordersSnapshot.val()
        Object.values(allOrders).forEach((order: any) => {
          if (order.userEmail === userEmail && order.status !== 'cancelled') {
            const hasPurchased = order.items?.some((item: any) => 
              String(item.id) === String(productId) || 
              item.productId === productId
            )
            if (hasPurchased) {
              verifiedPurchase = true
            }
          }
        })
      }
    }

    const timestamp = new Date().toISOString()

    // Create review object
    const reviewData: Review = {
      productId: String(productId),
      userId: userId || 'guest',
      userName,
      userEmail: userEmail || '',
      rating,
      title: title || '',
      comment,
      images: images || [],
      verifiedPurchase,
      helpful: 0,
      notHelpful: 0,
      status: 'approved', // Auto-approve for now, can add moderation later
      createdAt: timestamp,
      updatedAt: timestamp
    }

    // Add review to database
    const newReviewRef = push(reviewsRef)
    await set(newReviewRef, reviewData)

    return NextResponse.json({
      success: true,
      reviewId: newReviewRef.key,
      message: 'Review submitted successfully'
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create review',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// PATCH - Update helpful/not helpful counts
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, action } = body

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Review ID and action are required' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const reviewRef = ref(database, `reviews/${reviewId}`)
    const snapshot = await get(reviewRef)

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const reviewData = snapshot.val()
    const updates: any = {
      updatedAt: new Date().toISOString()
    }

    if (action === 'helpful') {
      updates.helpful = (reviewData.helpful || 0) + 1
    } else if (action === 'notHelpful') {
      updates.notHelpful = (reviewData.notHelpful || 0) + 1
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "helpful" or "notHelpful"' },
        { status: 400 }
      )
    }

    await update(reviewRef, updates)

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update review',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
