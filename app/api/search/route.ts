import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit'
import { 
  buildSearchQuery, 
  buildSortQuery, 
  trackSearchAnalytics,
  SearchFilters 
} from '@/lib/search-utils'
import { collection, getDocs, query, where, orderBy, limit as limitQuery } from 'firebase/firestore'

// GET - Search products with advanced filters
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.search)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many search requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.allowed, rateLimit.remaining, rateLimit.resetTime)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      categories: searchParams.get('categories')?.split(',') || undefined,
      priceRange: searchParams.get('minPrice') && searchParams.get('maxPrice') ? {
        min: parseInt(searchParams.get('minPrice')!),
        max: parseInt(searchParams.get('maxPrice')!)
      } : undefined,
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      availability: (searchParams.get('availability') as any) || 'all',
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    // Build Firestore query
    let productsQuery = collection(db, 'products')
    const conditions: any[] = []

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      conditions.push(where('category', 'in', filters.categories))
    }

    // Rating filter
    if (filters.rating) {
      conditions.push(where('averageRating', '>=', filters.rating))
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      switch (filters.availability) {
        case 'in_stock':
          conditions.push(where('stock', '>', 0))
          break
        case 'out_of_stock':
          conditions.push(where('stock', '==', 0))
          break
        case 'pre_order':
          conditions.push(where('allowPreOrder', '==', true))
          break
      }
    }

    // Apply conditions
    let q = query(productsQuery, ...conditions)

    // Fetch all matching products
    const snapshot = await getDocs(q)
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Client-side filtering for complex queries
    
    // Text search (simple implementation - enhance with Algolia/ElasticSearch for production)
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase()
      products = products.filter((product: any) => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
      )
    }

    // Price range filter
    if (filters.priceRange) {
      products = products.filter((product: any) =>
        product.price >= filters.priceRange!.min &&
        product.price <= filters.priceRange!.max
      )
    }

    // Sort products
    products.sort((a: any, b: any) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price
        case 'price_high':
          return b.price - a.price
        case 'popularity':
          return (b.soldCount || 0) - (a.soldCount || 0)
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      }
    })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const totalProducts = products.length
    const paginatedProducts = products.slice(startIndex, endIndex)

    // Track search analytics
    trackSearchAnalytics({
      query: filters.query || '',
      filters,
      resultsCount: totalProducts,
      timestamp: new Date()
    })

    // Generate facets for filtering
    const facets = generateFacets(products)

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        hasMore: endIndex < totalProducts
      },
      facets,
      appliedFilters: filters
    })

  } catch (error: any) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products', details: error.message },
      { status: 500 }
    )
  }
}

// Generate facets for filtering UI
function generateFacets(products: any[]) {
  const categories = new Map<string, number>()
  const priceRanges = [
    { label: 'Under ₹10,000', min: 0, max: 10000, count: 0 },
    { label: '₹10,000 - ₹25,000', min: 10000, max: 25000, count: 0 },
    { label: '₹25,000 - ₹50,000', min: 25000, max: 50000, count: 0 },
    { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000, count: 0 },
    { label: 'Over ₹1,00,000', min: 100000, max: Infinity, count: 0 },
  ]
  const ratings = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: 0 }))
  
  let minPrice = Infinity
  let maxPrice = 0

  products.forEach((product: any) => {
    // Categories
    const cat = product.category || 'Other'
    categories.set(cat, (categories.get(cat) || 0) + 1)
    
    // Price ranges
    priceRanges.forEach(range => {
      if (product.price >= range.min && product.price < range.max) {
        range.count++
      }
    })
    
    // Price min/max
    if (product.price < minPrice) minPrice = product.price
    if (product.price > maxPrice) maxPrice = product.price
    
    // Ratings
    const productRating = Math.floor(product.averageRating || 0)
    const ratingFacet = ratings.find(r => r.rating === productRating)
    if (ratingFacet) ratingFacet.count++
  })

  return {
    categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
    priceRanges: priceRanges.filter(r => r.count > 0),
    priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
    ratings: ratings.filter(r => r.count > 0)
  }
}
