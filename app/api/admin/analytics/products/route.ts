import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ensure-admin'

interface ProductPerformance {
  productId: string
  name: string
  sku: string
  totalSales: number
  revenue: number
  avgRating: number
  returnRate: number
  profitMargin: number
  roi: number
  turnoverRate: number
  performanceScore: number
  trend: 'up' | 'down' | 'stable'
  status: 'active' | 'slow-moving' | 'declining'
}

/**
 * GET /api/admin/analytics/product-performance
 *
 * Product performance endpoints:
 * ?action=top-performers - Top performing products by revenue
 * ?action=low-performers - Low performing/declining products
 * ?action=product-id - Get specific product metrics
 * ?action=by-category - Performance grouped by category
 */
export async function GET(request: NextRequest) {
  try {
    const adminError = await requireAdmin(request)
    if (adminError) return adminError

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const productId = searchParams.get('productId')

    if (action === 'top-performers') {
      return handleTopPerformers()
    } else if (action === 'low-performers') {
      return handleLowPerformers()
    } else if (action === 'by-category') {
      return handleByCategory()
    } else if (action === 'product-id' && productId) {
      return handleProductDetail(productId)
    } else if (action === 'all') {
      return handleAllProducts()
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Product performance error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product performance' },
      { status: 500 }
    )
  }
}

/**
 * Get top performing products by revenue and score
 */
async function handleTopPerformers() {
  try {
    const topProducts: ProductPerformance[] = [
      {
        productId: 'p001',
        name: 'Premium Wooden Bookshelf',
        sku: 'WB-001',
        totalSales: 345,
        revenue: 1725000,
        avgRating: 4.8,
        returnRate: 2.1,
        profitMargin: 42.5,
        roi: 185,
        turnoverRate: 5.2,
        performanceScore: 92.3,
        trend: 'up',
        status: 'active',
      },
      {
        productId: 'p002',
        name: 'Handwoven Jute Rug',
        sku: 'JR-002',
        totalSales: 289,
        revenue: 1445000,
        avgRating: 4.6,
        returnRate: 3.2,
        profitMargin: 48.0,
        roi: 210,
        turnoverRate: 4.8,
        performanceScore: 88.7,
        trend: 'up',
        status: 'active',
      },
      {
        productId: 'p003',
        name: 'Ceramic Dinnerware Set',
        sku: 'CD-003',
        totalSales: 256,
        revenue: 1280000,
        avgRating: 4.7,
        returnRate: 2.8,
        profitMargin: 45.0,
        roi: 195,
        turnoverRate: 4.5,
        performanceScore: 86.2,
        trend: 'stable',
        status: 'active',
      },
      {
        productId: 'p004',
        name: 'Fabric Accent Chair',
        sku: 'AC-004',
        totalSales: 198,
        revenue: 1188000,
        avgRating: 4.5,
        returnRate: 4.5,
        profitMargin: 38.0,
        roi: 165,
        turnoverRate: 3.8,
        performanceScore: 79.1,
        trend: 'down',
        status: 'active',
      },
      {
        productId: 'p005',
        name: 'Handcrafted Wall Art',
        sku: 'WA-005',
        totalSales: 167,
        revenue: 1003000,
        avgRating: 4.9,
        returnRate: 1.5,
        profitMargin: 55.0,
        roi: 240,
        turnoverRate: 3.2,
        performanceScore: 84.5,
        trend: 'up',
        status: 'active',
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        products: topProducts,
        avgPerformanceScore: 86.16,
        totalRevenue: topProducts.reduce((sum, p) => sum + p.revenue, 0),
        totalSales: topProducts.reduce((sum, p) => sum + p.totalSales, 0),
        insight: `Top 5 products generate ₹${topProducts.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()} in revenue`,
      },
    })
  } catch (error) {
    throw error
  }
}

/**
 * Get low performing / declining products
 */
async function handleLowPerformers() {
  try {
    const lowProducts: ProductPerformance[] = [
      {
        productId: 'p101',
        name: 'Vintage Clock Collection',
        sku: 'VC-101',
        totalSales: 12,
        revenue: 48000,
        avgRating: 3.2,
        returnRate: 12.5,
        profitMargin: 25.0,
        roi: 45,
        turnoverRate: 0.4,
        performanceScore: 28.3,
        trend: 'down',
        status: 'declining',
      },
      {
        productId: 'p102',
        name: 'Decorative Mirror Set',
        sku: 'MS-102',
        totalSales: 18,
        revenue: 54000,
        avgRating: 3.5,
        returnRate: 8.3,
        profitMargin: 30.0,
        roi: 60,
        turnoverRate: 0.6,
        performanceScore: 34.2,
        trend: 'down',
        status: 'slow-moving',
      },
      {
        productId: 'p103',
        name: 'Bed Linens Premium',
        sku: 'BL-103',
        totalSales: 22,
        revenue: 66000,
        avgRating: 3.8,
        returnRate: 6.7,
        profitMargin: 32.0,
        roi: 75,
        turnoverRate: 0.7,
        performanceScore: 42.1,
        trend: 'stable',
        status: 'slow-moving',
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        products: lowProducts,
        avgPerformanceScore: 34.87,
        recommendations: [
          'Consider discontinuing products with score < 30',
          'Launch promotional campaigns for declining products',
          'Review pricing strategy for low-performing items',
          'Analyze customer reviews to identify quality issues',
        ],
      },
    })
  } catch (error) {
    throw error
  }
}

/**
 * Get performance metrics by product category
 */
async function handleByCategory() {
  try {
    const categoryPerformance = [
      {
        category: 'Furniture',
        totalRevenue: 3200000,
        totalSales: 285,
        productCount: 12,
        avgRating: 4.5,
        avgReturnRate: 3.8,
        avgMargin: 38,
        performanceScore: 82.4,
      },
      {
        category: 'Decor',
        totalRevenue: 2850000,
        totalSales: 412,
        productCount: 28,
        avgRating: 4.6,
        avgReturnRate: 2.9,
        avgMargin: 48,
        performanceScore: 84.6,
      },
      {
        category: 'Textiles',
        totalRevenue: 1950000,
        totalSales: 156,
        productCount: 18,
        avgRating: 4.4,
        avgReturnRate: 4.2,
        avgMargin: 42,
        performanceScore: 78.2,
      },
      {
        category: 'Tableware',
        totalRevenue: 1280000,
        totalSales: 256,
        productCount: 15,
        avgRating: 4.7,
        avgReturnRate: 2.8,
        avgMargin: 45,
        performanceScore: 86.2,
      },
      {
        category: 'Lighting',
        totalRevenue: 980000,
        totalSales: 89,
        productCount: 10,
        avgRating: 4.3,
        avgReturnRate: 5.1,
        avgMargin: 35,
        performanceScore: 74.5,
      },
    ]

    const totalRevenue = categoryPerformance.reduce((sum, c) => sum + c.totalRevenue, 0)

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryPerformance.map((c) => ({
          ...c,
          revenuePercentage: ((c.totalRevenue / totalRevenue) * 100).toFixed(1),
        })),
        totalRevenue,
        avgCategoryScore: (categoryPerformance.reduce((sum, c) => sum + c.performanceScore, 0) / categoryPerformance.length).toFixed(1),
        bestCategory: categoryPerformance.reduce((prev, current) =>
          current.performanceScore > prev.performanceScore ? current : prev
        ).category,
      },
    })
  } catch (error) {
    throw error
  }
}

/**
 * Get specific product performance details
 */
async function handleProductDetail(productId: string) {
  try {
    // Mock product detail
    const detail: ProductPerformance & { history: any[] } = {
      productId,
      name: 'Premium Wooden Bookshelf',
      sku: 'WB-001',
      totalSales: 345,
      revenue: 1725000,
      avgRating: 4.8,
      returnRate: 2.1,
      profitMargin: 42.5,
      roi: 185,
      turnoverRate: 5.2,
      performanceScore: 92.3,
      trend: 'up',
      status: 'active',
      history: [
        { month: 'Jan', sales: 28, revenue: 140000 },
        { month: 'Feb', sales: 31, revenue: 155000 },
        { month: 'Mar', sales: 35, revenue: 175000 },
        { month: 'Apr', sales: 32, revenue: 160000 },
        { month: 'May', sales: 38, revenue: 190000 },
        { month: 'Jun', sales: 42, revenue: 210000 },
      ],
    }

    return NextResponse.json({
      success: true,
      data: detail,
    })
  } catch (error) {
    throw error
  }
}

/**
 * Get all products performance metrics
 */
async function handleAllProducts() {
  try {
    // Combine top and low performers for complete view
    const topProducts = [
      {
        productId: 'p001',
        name: 'Premium Wooden Bookshelf',
        sku: 'WB-001',
        totalSales: 345,
        revenue: 1725000,
        performanceScore: 92.3,
        status: 'active',
      },
      {
        productId: 'p002',
        name: 'Handwoven Jute Rug',
        sku: 'JR-002',
        totalSales: 289,
        revenue: 1445000,
        performanceScore: 88.7,
        status: 'active',
      },
      // ... more products
    ]

    return NextResponse.json({
      success: true,
      data: {
        products: topProducts,
        totalProducts: topProducts.length,
        avgScore: 82.15,
      },
    })
  } catch (error) {
    throw error
  }
}

/**
 * POST /api/admin/analytics/product-performance
 *
 * Actions:
 * - store-metrics: Store product performance metrics
 * - update-product: Update specific product performance
 */
export async function POST(request: NextRequest) {
  try {
    const adminError = await requireAdmin(request)
    if (adminError) return adminError

    const body = await request.json()
    const { action } = body

    if (action === 'store-metrics') {
      return handleStoreMetrics(body)
    } else if (action === 'update-product') {
      return handleUpdateProduct(body)
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Product performance POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process product performance data' },
      { status: 500 }
    )
  }
}

async function handleStoreMetrics(body: any) {
  try {
    const { products } = body

    // In production, store to MongoDB/Firebase
    return NextResponse.json({
      success: true,
      message: `Stored performance metrics for ${products.length} products`,
      data: {
        storedAt: new Date().toISOString(),
        productCount: products.length,
      },
    })
  } catch (error) {
    throw error
  }
}

async function handleUpdateProduct(body: any) {
  try {
    const { productId, metrics } = body

    // In production, update in database
    return NextResponse.json({
      success: true,
      message: 'Product metrics updated',
      data: {
        productId,
        metrics,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    throw error
  }
}
