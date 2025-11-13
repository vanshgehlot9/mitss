import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

// POST - Add product to comparison
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const comparisonRef = doc(db, 'comparisons', userId)
    const comparisonDoc = await getDoc(comparisonRef)

    if (comparisonDoc.exists()) {
      const data = comparisonDoc.data()
      const products = data.products || []
      
      // Check if already in comparison
      if (products.includes(productId)) {
        return NextResponse.json({
          success: false,
          message: 'Product already in comparison'
        })
      }
      
      // Limit to 4 products
      if (products.length >= 4) {
        return NextResponse.json({
          success: false,
          message: 'Maximum 4 products can be compared'
        }, { status: 400 })
      }
      
      await updateDoc(comparisonRef, {
        products: [...products, productId],
        updatedAt: new Date()
      })
    } else {
      await setDoc(comparisonRef, {
        userId,
        products: [productId],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to comparison'
    })

  } catch (error: any) {
    console.error('Error adding to comparison:', error)
    return NextResponse.json(
      { error: 'Failed to add to comparison', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch comparison products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const comparisonRef = doc(db, 'comparisons', userId)
    const comparisonDoc = await getDoc(comparisonRef)

    if (!comparisonDoc.exists()) {
      return NextResponse.json({
        success: true,
        products: []
      })
    }

    const data = comparisonDoc.data()
    const productIds = data.products || []

    // Fetch full product details
    const productDetails = await Promise.all(
      productIds.map(async (id: number) => {
        const productDoc = await getDoc(doc(db, 'products', id.toString()))
        if (productDoc.exists()) {
          return {
            id: productDoc.id,
            ...productDoc.data()
          }
        }
        return null
      })
    )

    const validProducts = productDetails.filter(p => p !== null)

    // Generate comparison attributes
    const comparisonData = generateComparisonData(validProducts)

    return NextResponse.json({
      success: true,
      products: validProducts,
      comparison: comparisonData
    })

  } catch (error: any) {
    console.error('Error fetching comparison:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparison', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove product from comparison
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const comparisonRef = doc(db, 'comparisons', userId)
    const comparisonDoc = await getDoc(comparisonRef)

    if (comparisonDoc.exists()) {
      const data = comparisonDoc.data()
      let products = data.products || []
      
      if (productId) {
        // Remove specific product
        products = products.filter((id: number) => id !== parseInt(productId))
      } else {
        // Clear all
        products = []
      }
      
      await updateDoc(comparisonRef, {
        products,
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: productId ? 'Product removed from comparison' : 'Comparison cleared'
    })

  } catch (error: any) {
    console.error('Error removing from comparison:', error)
    return NextResponse.json(
      { error: 'Failed to remove from comparison', details: error.message },
      { status: 500 }
    )
  }
}

// Helper: Generate comparison data
function generateComparisonData(products: any[]) {
  if (products.length === 0) return {}
  
  const attributes = [
    'price',
    'category',
    'material',
    'dimensions',
    'color',
    'weight',
    'warranty',
    'averageRating',
    'totalReviews',
    'stock'
  ]
  
  const comparison: any = {}
  
  attributes.forEach(attr => {
    comparison[attr] = products.map(p => p[attr] || 'N/A')
  })
  
  return comparison
}
