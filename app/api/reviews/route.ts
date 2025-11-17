import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore'

export interface Review {
  id?: string
  productId: number
  userId: string
  userName: string
  userEmail: string
  rating: number // 1-5
  title: string
  comment: string
  images?: string[]
  verifiedPurchase: boolean
  helpful: number
  notHelpful: number
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string
  moderatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json(
        { error: 'Reviews service is not available' },
        { status: 503 }
      )
    }

    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.review)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many review submissions. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.allowed, rateLimit.remaining, rateLimit.resetTime)
        }
      )
    }

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
    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has purchased the product
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', 'delivered')
    )
    const ordersSnapshot = await getDocs(ordersQuery)
    
    let verifiedPurchase = false
    ordersSnapshot.forEach(orderDoc => {
      const orderData = orderDoc.data()
      if (orderData.items.some((item: any) => item.id === productId)) {
        verifiedPurchase = true
      }
    })

    // Check for duplicate review
    const existingReviewQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('userId', '==', userId)
    )
    const existingReviews = await getDocs(existingReviewQuery)
    
    if (!existingReviews.empty) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review
    const reviewData: Omit<Review, 'id'> = {
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title: title || '',
      comment,
      images: images || [],
      verifiedPurchase,
      helpful: 0,
      notHelpful: 0,
      status: 'pending', // Requires moderation
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const reviewRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Update product rating stats
    await updateProductRatingStats(productId)

    return NextResponse.json({
      success: true,
      reviewId: reviewRef.id,
      message: 'Review submitted successfully. It will be published after moderation.'
    })

  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json(
        { error: 'Reviews service is not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status') || 'approved'
    const limitCount = parseInt(searchParams.get('limit') || '10')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Build query
    let q = query(
      collection(db, 'reviews'),
      where('productId', '==', parseInt(productId)),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get rating summary
    const summary = await getProductRatingSummary(parseInt(productId))

    return NextResponse.json({
      success: true,
      reviews,
      summary
    })

  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update review (moderate)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, status, moderatedBy } = body

    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const reviewRef = doc(db, 'reviews', reviewId)
    await updateDoc(reviewRef, {
      status,
      moderatedBy,
      moderatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Update product rating stats if approved
    if (status === 'approved') {
      const reviewDoc = await getDoc(reviewRef)
      if (reviewDoc.exists()) {
        const reviewData = reviewDoc.data()
        await updateProductRatingStats(reviewData.productId)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review', details: error.message },
      { status: 500 }
    )
  }
}

// Helper: Update product rating statistics
async function updateProductRatingStats(productId: number) {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    )
    
    const snapshot = await getDocs(reviewsQuery)
    const reviews = snapshot.docs.map(doc => doc.data())
    
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    // Store in products collection or separate ratings collection
    await updateDoc(doc(db, 'productRatings', productId.toString()), {
      productId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      updatedAt: serverTimestamp()
    })

  } catch (error) {
    console.error('Error updating product rating stats:', error)
  }
}

// Helper: Get rating summary
async function getProductRatingSummary(productId: number) {
  try {
    const ratingDoc = await getDoc(doc(db, 'productRatings', productId.toString()))
    
    if (ratingDoc.exists()) {
      return ratingDoc.data()
    }
    
    return {
      productId,
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  } catch (error) {
    console.error('Error fetching rating summary:', error)
    return null
  }
}
