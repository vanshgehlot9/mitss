import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

interface RecentlyViewed {
  productId: number
  viewedAt: Date
}

// POST - Add product to recently viewed
export async function POST(request: NextRequest) {
  try {
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json(
        { error: 'Recently viewed service is not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const recentlyViewedRef = doc(db, 'recentlyViewed', userId)
    const recentlyViewedDoc = await getDoc(recentlyViewedRef)

    const viewRecord: RecentlyViewed = {
      productId,
      viewedAt: new Date()
    }

    if (recentlyViewedDoc.exists()) {
      const data = recentlyViewedDoc.data()
      let products: RecentlyViewed[] = data.products || []
      
      // Remove existing entry if present
      products = products.filter(p => p.productId !== productId)
      
      // Add to beginning
      products.unshift(viewRecord)
      
      // Keep only last 20 products
      products = products.slice(0, 20)
      
      await updateDoc(recentlyViewedRef, {
        products,
        updatedAt: new Date()
      })
    } else {
      await setDoc(recentlyViewedRef, {
        userId,
        products: [viewRecord],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to recently viewed'
    })

  } catch (error: any) {
    console.error('Error adding to recently viewed:', error)
    return NextResponse.json(
      { error: 'Failed to add to recently viewed', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch recently viewed products
export async function GET(request: NextRequest) {
  try {
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json(
        { error: 'Recently viewed service is not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const recentlyViewedRef = doc(db, 'recentlyViewed', userId)
    const recentlyViewedDoc = await getDoc(recentlyViewedRef)

    if (!recentlyViewedDoc.exists()) {
      return NextResponse.json({
        success: true,
        products: []
      })
    }

    const data = recentlyViewedDoc.data()
    const products = (data.products || []).slice(0, limit)

    // Fetch full product details
    const productIds = products.map((p: RecentlyViewed) => p.productId)
    const productDetails = await Promise.all(
      productIds.map(async (id: number) => {
        const productDoc = await getDoc(doc(db, 'products', id.toString()))
        if (productDoc.exists()) {
          return {
            id: productDoc.id,
            ...productDoc.data(),
            viewedAt: products.find((p: RecentlyViewed) => p.productId === id)?.viewedAt
          }
        }
        return null
      })
    )

    const validProducts = productDetails.filter(p => p !== null)

    return NextResponse.json({
      success: true,
      products: validProducts
    })

  } catch (error: any) {
    console.error('Error fetching recently viewed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recently viewed', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Clear recently viewed
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const recentlyViewedRef = doc(db, 'recentlyViewed', userId)
    await updateDoc(recentlyViewedRef, {
      products: [],
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Recently viewed cleared'
    })

  } catch (error: any) {
    console.error('Error clearing recently viewed:', error)
    return NextResponse.json(
      { error: 'Failed to clear recently viewed', details: error.message },
      { status: 500 }
    )
  }
}
