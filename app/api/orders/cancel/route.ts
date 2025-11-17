import { NextRequest, NextResponse } from 'next/server'
import { database, ref, update, get } from '@/lib/firebase-realtime'
import { runTransaction } from 'firebase/database'
import { createRefund } from '@/lib/razorpay-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch the order
    const orderSnapshot = await get(ref(database, `orders/${orderId}`))
    if (!orderSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderSnapshot.val()

    // Check if order can be cancelled (not already cancelled, shipped, delivered)
    if (['cancelled', 'shipped', 'delivered'].includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot cancel order with status: ${order.status}` 
        },
        { status: 400 }
      )
    }

    // Use transaction for atomic updates
    await runTransaction(ref(database, `orders/${orderId}`), (currentData: any) => {
      if (currentData === null) {
        throw new Error('Order does not exist')
      }
      return {
        ...currentData,
        status: 'cancelled',
        paymentStatus: 'refunded',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason || 'Customer requested cancellation',
        updatedAt: new Date().toISOString()
      }
    })

    // Process refund if payment was successful
    if (order.paymentStatus === 'completed' && order.razorpayPaymentId) {
      try {
        // Initiate refund via Razorpay
        const refundResult = await createRefund(
          order.razorpayPaymentId,
          order.pricing.total
        )

        // Update refund status
        await update(ref(database, `orders/${orderId}`), {
          refundId: refundResult.id,
          refundAmount: order.pricing.total,
          refundStatus: 'processed',
          refundInitiatedAt: new Date().toISOString()
        })
      } catch (refundError: any) {
        console.error('Refund error:', refundError)
        // Log but don't fail the cancellation
        await update(ref(database, `orders/${orderId}`), {
          refundError: refundError.message,
          refundStatus: 'pending'
        })
      }
    }

    // Restore stock if order was using reservations
    if (order.reservationId) {
      try {
        const resSnapshot = await get(ref(database, `stock_reservations/${order.reservationId}`))
        if (resSnapshot.exists()) {
          const reservation = resSnapshot.val()
          
          // Restore stock for each item
          for (const item of order.items) {
            await runTransaction(ref(database, `products/${item.productId}`), (currentData: any) => {
              if (currentData === null) return currentData
              return {
                ...currentData,
                stock: (currentData.stock || 0) + item.quantity
              }
            })
          }

          // Mark reservation as restored
          await update(ref(database, `stock_reservations/${order.reservationId}`), {
            status: 'restored',
            restoredAt: new Date().toISOString()
          })
        }
      } catch (stockError: any) {
        console.error('Stock restoration error:', stockError)
        // Log but don't fail the cancellation
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId,
      refundStatus: order.paymentStatus === 'completed' ? 'refund_initiated' : 'no_refund_needed'
    })
  } catch (error: any) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
