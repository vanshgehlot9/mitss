import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { requireAdmin } from '@/lib/ensure-admin'

// Mock database connection
// Replace with actual MongoDB connection

interface Customer {
  _id: string
  email: string
  totalSpent: number
  orderCount: number
  firstOrderDate: Date
  lastOrderDate: Date
  orders?: Array<{
    total: number
    date: Date
  }>
}

interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Calculate customer lifetime value and metrics
 */
async function calculateCustomerMetrics(customers: Customer[]) {
  const avgCLV =
    customers.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.length, 1)

  return customers.map((customer) => {
    const daysAsCustomer = Math.floor(
      (new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    const orderFrequency = customer.orderCount / Math.max((daysAsCustomer || 1) / 30, 1)
    const averageOrderValue = customer.totalSpent / Math.max(customer.orderCount, 1)

    // CLV calculation
    const customerLifespan = 36 // 3 years
    const grossMargin = 0.35
    const clv = averageOrderValue * orderFrequency * customerLifespan * grossMargin

    // Churn risk
    let churnRisk: 'low' | 'medium' | 'high' = 'low'
    if (daysAsCustomer > (30 / orderFrequency) * 3) churnRisk = 'high'
    else if (daysAsCustomer > (30 / orderFrequency) * 2) churnRisk = 'medium'

    // Segment
    let segment: 'vip' | 'loyal' | 'regular' | 'at-risk' | 'new'
    if (daysAsCustomer > 180) segment = 'at-risk'
    else if (clv > avgCLV * 2) segment = 'vip'
    else if (customer.totalSpent > avgCLV * 0.75) segment = 'loyal'
    else if (daysAsCustomer < 30) segment = 'new'
    else segment = 'regular'

    return {
      customerId: customer._id,
      email: customer.email,
      totalSpent: customer.totalSpent,
      orderCount: customer.orderCount,
      averageOrderValue: Math.round(averageOrderValue),
      lastOrderDate: customer.lastOrderDate,
      firstOrderDate: customer.firstOrderDate,
      daysAsCustomer,
      clv: Math.round(clv),
      churnRisk,
      segment,
    }
  })
}

/**
 * GET /api/admin/analytics/customers
 * Get customer metrics including CLV
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (action === 'top-customers') {
      // Get top customers by CLV
      // Replace with actual database query
      const mockCustomers: Customer[] = [
        {
          _id: '1',
          email: 'customer1@example.com',
          totalSpent: 50000,
          orderCount: 15,
          firstOrderDate: new Date('2022-01-01'),
          lastOrderDate: new Date('2025-11-10'),
        },
        {
          _id: '2',
          email: 'customer2@example.com',
          totalSpent: 35000,
          orderCount: 10,
          firstOrderDate: new Date('2023-01-01'),
          lastOrderDate: new Date('2025-11-12'),
        },
      ]

      const metrics = await calculateCustomerMetrics(mockCustomers)
      const topCustomers = metrics
        .sort((a, b) => b.clv - a.clv)
        .slice(0, limit)

      return NextResponse.json({
        success: true,
        data: {
          customers: topCustomers,
          count: topCustomers.length,
          avgCLV: Math.round(metrics.reduce((sum, c) => sum + c.clv, 0) / metrics.length),
        },
      })
    }

    if (action === 'at-risk') {
      // Get at-risk customers
      const mockCustomers: Customer[] = []
      const metrics = await calculateCustomerMetrics(mockCustomers)
      const atRisk = metrics.filter(
        (c) => c.churnRisk === 'high' || (c.churnRisk === 'medium' && c.clv > 500)
      )

      return NextResponse.json({
        success: true,
        data: {
          customers: atRisk,
          count: atRisk.length,
        },
      })
    }

    if (action === 'segments') {
      // Get customer segmentation
      const mockCustomers: Customer[] = []
      const metrics = await calculateCustomerMetrics(mockCustomers)

      const segments = {
        vip: metrics.filter((c) => c.segment === 'vip').length,
        loyal: metrics.filter((c) => c.segment === 'loyal').length,
        regular: metrics.filter((c) => c.segment === 'regular').length,
        atRisk: metrics.filter((c) => c.segment === 'at-risk').length,
        new: metrics.filter((c) => c.segment === 'new').length,
      }

      return NextResponse.json({
        success: true,
        data: segments,
      })
    }

    // Default: get all customers
    const mockCustomers: Customer[] = []
    const metrics = await calculateCustomerMetrics(mockCustomers)

    return NextResponse.json({
      success: true,
      data: {
        customers: metrics.slice(0, limit),
        total: metrics.length,
        avgCLV: Math.round(metrics.reduce((sum, c) => sum + c.clv, 0) / metrics.length),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/analytics/customers
 * Calculate and store customer metrics
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    await requireAdmin(request)

    const body = await request.json()
    const { customers, forceRecalculate } = body

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: customers array required',
        },
        { status: 400 }
      )
    }

    // Calculate metrics for provided customers
    const metrics = await calculateCustomerMetrics(customers)

    // Store in database (mock)
    // db.collection('customer_metrics').insertMany(metrics)

    return NextResponse.json({
      success: true,
      data: {
        metricsCalculated: metrics.length,
        avgCLV: Math.round(metrics.reduce((sum, c) => sum + c.clv, 0) / metrics.length),
        segments: {
          vip: metrics.filter((c) => c.segment === 'vip').length,
          loyal: metrics.filter((c) => c.segment === 'loyal').length,
          regular: metrics.filter((c) => c.segment === 'regular').length,
          atRisk: metrics.filter((c) => c.segment === 'at-risk').length,
          new: metrics.filter((c) => c.segment === 'new').length,
        },
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate analytics',
      },
      { status: 500 }
    )
  }
}
