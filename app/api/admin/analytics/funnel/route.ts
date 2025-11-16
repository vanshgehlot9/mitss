import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ensure-admin'

interface ConversionFunnelStage {
  stage: string
  users: number
  conversionRate: number
  dropoffRate: number
  avgTimeSpent: number
}

interface ProductMetrics {
  productId: string
  name: string
  revenue: number
  unitsSold: number
  rating: number
  returnRate: number
  profitMargin: number
  turnoverRate: number
  roi: number
  trend: 'up' | 'stable' | 'down'
}

/**
 * GET /api/admin/analytics/funnel
 * Get conversion funnel analysis
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stages') {
      // Get conversion funnel stages
      const funnel: ConversionFunnelStage[] = [
        {
          stage: 'Site Visitors',
          users: 10000,
          conversionRate: 100,
          dropoffRate: 0,
          avgTimeSpent: 120,
        },
        {
          stage: 'Product Views',
          users: 6500,
          conversionRate: 65,
          dropoffRate: 35,
          avgTimeSpent: 240,
        },
        {
          stage: 'Add to Cart',
          users: 2100,
          conversionRate: 21,
          dropoffRate: 67.7,
          avgTimeSpent: 180,
        },
        {
          stage: 'Checkout Start',
          users: 1680,
          conversionRate: 16.8,
          dropoffRate: 20,
          avgTimeSpent: 300,
        },
        {
          stage: 'Purchase',
          users: 504,
          conversionRate: 5.04,
          dropoffRate: 70,
          avgTimeSpent: 60,
        },
      ]

      // Calculate metrics
      const topDropoffStage = funnel.reduce((max, stage) =>
        stage.dropoffRate > max.dropoffRate ? stage : max
      )
      const overallConversionRate = ((funnel[funnel.length - 1].users / funnel[0].users) * 100)

      return NextResponse.json({
        success: true,
        data: {
          funnel,
          topDropoffStage: topDropoffStage.stage,
          topDropoffRate: Math.round(topDropoffStage.dropoffRate * 10) / 10,
          overallConversionRate: Math.round(overallConversionRate * 100) / 100,
        },
      })
    }

    if (action === 'trends') {
      // Get conversion trends over time
      const trends = [
        { date: '2025-11-09', conversionRate: 4.8 },
        { date: '2025-11-10', conversionRate: 5.1 },
        { date: '2025-11-11', conversionRate: 4.9 },
        { date: '2025-11-12', conversionRate: 5.3 },
        { date: '2025-11-13', conversionRate: 5.5 },
        { date: '2025-11-14', conversionRate: 5.2 },
        { date: '2025-11-15', conversionRate: 5.4 },
      ]

      const avgConversionRate =
        trends.reduce((sum, t) => sum + t.conversionRate, 0) / trends.length
      const maxConversionRate = Math.max(...trends.map((t) => t.conversionRate))
      const minConversionRate = Math.min(...trends.map((t) => t.conversionRate))

      return NextResponse.json({
        success: true,
        data: {
          trends,
          avgConversionRate: Math.round(avgConversionRate * 100) / 100,
          maxConversionRate,
          minConversionRate,
          trend: trends[trends.length - 1].conversionRate > avgConversionRate ? 'up' : 'down',
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    })
  } catch (error) {
    console.error('Funnel error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch funnel data',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/analytics/products
 * Get product performance metrics
 */
export async function getProductAnalytics(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (action === 'top-performers') {
      // Get top performing products
      const products: ProductMetrics[] = [
        {
          productId: '1',
          name: 'Premium Sofa Set',
          revenue: 450000,
          unitsSold: 85,
          rating: 4.8,
          returnRate: 2.1,
          profitMargin: 35,
          turnoverRate: 8.5,
          roi: 150,
          trend: 'up',
        },
        {
          productId: '2',
          name: 'Wooden Dining Table',
          revenue: 280000,
          unitsSold: 120,
          rating: 4.6,
          returnRate: 3.2,
          profitMargin: 32,
          turnoverRate: 12,
          roi: 120,
          trend: 'up',
        },
      ]

      return {
        success: true,
        data: {
          products: products.slice(0, limit),
          count: products.length,
        },
      }
    }

    if (action === 'low-performers') {
      // Get low performing products
      const products: ProductMetrics[] = []

      return {
        success: true,
        data: {
          products: products.slice(0, limit),
          count: products.length,
        },
      }
    }

    return {
      success: false,
      error: 'Invalid action',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product data',
    }
  }
}
