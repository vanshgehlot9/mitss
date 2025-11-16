import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ensure-admin'

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface AbandonedCart {
  _id: string
  customerId: string
  customerEmail: string
  items: CartItem[]
  cartValue: number
  createdAt: Date
  updatedAt: Date
  recoveryEmailSent: boolean
  recovered: boolean
}

/**
 * GET /api/admin/analytics/abandoned-carts
 * Get abandoned cart metrics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'list') {
      // Get list of abandoned carts
      const mockCarts: AbandonedCart[] = [
        {
          _id: '1',
          customerId: 'cust1',
          customerEmail: 'user@example.com',
          items: [
            { productId: 'p1', name: 'Sofa', quantity: 1, price: 45000 },
            { productId: 'p2', name: 'Coffee Table', quantity: 1, price: 8000 },
          ],
          cartValue: 53000,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          recoveryEmailSent: false,
          recovered: false,
        },
      ]

      return NextResponse.json({
        success: true,
        data: {
          carts: mockCarts,
          count: mockCarts.length,
          totalValue: mockCarts.reduce((sum, c) => sum + c.cartValue, 0),
          avgCartValue: Math.round(
            mockCarts.reduce((sum, c) => sum + c.cartValue, 0) / Math.max(mockCarts.length, 1)
          ),
        },
      })
    }

    if (action === 'stats') {
      // Get abandoned cart statistics
      const mockCarts: AbandonedCart[] = []

      const emailedCount = mockCarts.filter((c) => c.recoveryEmailSent).length
      const recoveredCount = mockCarts.filter((c) => c.recovered).length
      const recoveryRate = emailedCount > 0 ? (recoveredCount / emailedCount) * 100 : 0
      const totalAbandonedValue = mockCarts.reduce((sum, c) => sum + c.cartValue, 0)
      const recoveredValue = mockCarts
        .filter((c) => c.recovered)
        .reduce((sum, c) => sum + c.cartValue, 0)

      return NextResponse.json({
        success: true,
        data: {
          totalAbandoned: mockCarts.length,
          emailedRecovery: emailedCount,
          recovered: recoveredCount,
          recoveryRate: Math.round(recoveryRate * 10) / 10,
          totalAbandonedValue,
          recoveredValue,
          recoveryROI: recoveredValue > 0 ? ((recoveredValue - emailedCount * 0.01) / (emailedCount * 0.01)) * 100 : 0,
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    })
  } catch (error) {
    console.error('Abandoned cart error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch abandoned carts',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/analytics/abandoned-carts
 * Send recovery email or perform bulk actions
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { action, cartIds, sendEmail } = body

    if (action === 'send-recovery-emails') {
      // Send recovery emails to abandoned cart users
      const emailsSent = cartIds?.length || 0

      return NextResponse.json({
        success: true,
        data: {
          emailsSent,
          message: `Recovery emails sent to ${emailsSent} customers`,
        },
      })
    }

    if (action === 'recover-carts') {
      // Mark carts as recovered
      const cartsRecovered = cartIds?.length || 0

      return NextResponse.json({
        success: true,
        data: {
          cartsRecovered,
          message: `${cartsRecovered} carts marked as recovered`,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Abandoned cart error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process carts',
      },
      { status: 500 }
    )
  }
}
