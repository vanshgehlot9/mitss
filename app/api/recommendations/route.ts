import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  tags?: string[]
  rating?: number
  reviews?: number
  inStock?: boolean
  sales?: number
}

/**
 * Recommendation Algorithm
 * Types:
 * - similar: Products in the same category with similar price range
 * - also-bought: Products frequently purchased together (based on order history)
 * - trending: Best-selling products
 * - related: Products with overlapping tags/categories
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'similar'
    const productId = searchParams.get('productId')
    const category = searchParams.get('category')
    const limitCount = parseInt(searchParams.get('limit') || '8')

    let recommendations: Product[] = []

    if (type === 'similar' && (productId || category)) {
      recommendations = await getSimilarProducts(productId, category, limitCount)
    } else if (type === 'also-bought' && productId) {
      recommendations = await getAlsoBoughtProducts(productId, limitCount)
    } else if (type === 'trending') {
      recommendations = await getTrendingProducts(limitCount)
    } else if (type === 'related' && (productId || category)) {
      recommendations = await getRelatedProducts(productId, category, limitCount)
    } else {
      // Default: return trending products
      recommendations = await getTrendingProducts(limitCount)
    }

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

/**
 * Get similar products based on category and price range
 */
async function getSimilarProducts(
  productId: string | null,
  category: string | null,
  limitCount: number
): Promise<Product[]> {
  try {
    let targetCategory = category
    let targetPrice = 0

    // If productId provided, get product details first
    if (productId && !category) {
      const productsRef = collection(db, 'products')
      const snapshot = await getDocs(query(productsRef, where('__name__', '==', productId)))
      
      if (!snapshot.empty) {
        const product = snapshot.docs[0].data() as Product
        targetCategory = product.category
        targetPrice = product.price
      }
    }

    if (!targetCategory) {
      return []
    }

    // Get products in the same category
    const productsRef = collection(db, 'products')
    const q = query(
      productsRef,
      where('category', '==', targetCategory),
      limit(limitCount + 5) // Get extra in case we need to filter
    )

    const snapshot = await getDocs(q)
    const products = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      .filter(p => p.id !== productId) // Exclude current product
      .filter(p => p.inStock !== false) // Only in-stock items
      .slice(0, limitCount)

    // Sort by price similarity if we have a target price
    if (targetPrice > 0) {
      products.sort((a, b) => {
        const aDiff = Math.abs(a.price - targetPrice)
        const bDiff = Math.abs(b.price - targetPrice)
        return aDiff - bDiff
      })
    }

    return products
  } catch (error) {
    console.error('Error getting similar products:', error)
    return []
  }
}

/**
 * Get products frequently bought together
 * This analyzes order history to find products purchased with the current product
 */
async function getAlsoBoughtProducts(
  productId: string,
  limitCount: number
): Promise<Product[]> {
  try {
    // Get orders containing this product
    const ordersRef = collection(db, 'orders')
    const snapshot = await getDocs(ordersRef)

    // Track product co-occurrences
    const productScores = new Map<string, number>()

    snapshot.docs.forEach(doc => {
      const order = doc.data()
      const items = order.items || []
      
      // Check if this order contains our target product
      const hasTargetProduct = items.some((item: any) => item.id === productId)
      
      if (hasTargetProduct) {
        // Count other products in this order
        items.forEach((item: any) => {
          if (item.id !== productId) {
            const currentScore = productScores.get(item.id) || 0
            productScores.set(item.id, currentScore + 1)
          }
        })
      }
    })

    // Get top co-occurring products
    const topProductIds = Array.from(productScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limitCount)
      .map(([id]) => id)

    if (topProductIds.length === 0) {
      // Fallback to similar products if no co-occurrence data
      return getSimilarProducts(productId, null, limitCount)
    }

    // Fetch product details
    const productsRef = collection(db, 'products')
    const productsSnapshot = await getDocs(productsRef)
    
    const products = productsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      .filter(p => topProductIds.includes(p.id))
      .filter(p => p.inStock !== false)

    // Sort by co-occurrence score
    products.sort((a, b) => {
      const aScore = productScores.get(a.id) || 0
      const bScore = productScores.get(b.id) || 0
      return bScore - aScore
    })

    return products.slice(0, limitCount)
  } catch (error) {
    console.error('Error getting also-bought products:', error)
    return []
  }
}

/**
 * Get trending/best-selling products
 */
async function getTrendingProducts(limitCount: number): Promise<Product[]> {
  try {
    // Get all orders
    const ordersRef = collection(db, 'orders')
    const ordersSnapshot = await getDocs(ordersRef)

    // Count product sales
    const productSales = new Map<string, number>()

    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data()
      const items = order.items || []
      
      items.forEach((item: any) => {
        const currentSales = productSales.get(item.id) || 0
        productSales.set(item.id, currentSales + (item.quantity || 1))
      })
    })

    // Get top-selling product IDs
    const topProductIds = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limitCount)
      .map(([id]) => id)

    // Fetch product details
    const productsRef = collection(db, 'products')
    const productsSnapshot = await getDocs(productsRef)
    
    const products = productsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        sales: productSales.get(doc.id) || 0
      } as Product))
      .filter(p => topProductIds.includes(p.id))
      .filter(p => p.inStock !== false)

    // Sort by sales
    products.sort((a, b) => (b.sales || 0) - (a.sales || 0))

    return products.slice(0, limitCount)
  } catch (error) {
    console.error('Error getting trending products:', error)
    return []
  }
}

/**
 * Get related products based on tags and category
 */
async function getRelatedProducts(
  productId: string | null,
  category: string | null,
  limitCount: number
): Promise<Product[]> {
  try {
    let targetTags: string[] = []
    let targetCategory = category

    // If productId provided, get product details
    if (productId) {
      const productsRef = collection(db, 'products')
      const snapshot = await getDocs(query(productsRef, where('__name__', '==', productId)))
      
      if (!snapshot.empty) {
        const product = snapshot.docs[0].data()
        targetTags = product.tags || []
        targetCategory = product.category
      }
    }

    // Get all products
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(query(productsRef, limit(100)))

    const products = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      .filter(p => p.id !== productId)
      .filter(p => p.inStock !== false)

    // Calculate relevance scores
    const scoredProducts = products.map(product => {
      let score = 0

      // Category match (high weight)
      if (product.category === targetCategory) {
        score += 10
      }

      // Tag overlaps (medium weight)
      const productTags = product.tags || []
      const commonTags = productTags.filter(tag => targetTags.includes(tag))
      score += commonTags.length * 5

      // Rating bonus
      if (product.rating && product.rating >= 4) {
        score += 2
      }

      return { ...product, score }
    })

    // Sort by score and return top results
    scoredProducts.sort((a, b) => b.score - a.score)

    return scoredProducts.slice(0, limitCount)
  } catch (error) {
    console.error('Error getting related products:', error)
    return []
  }
}
