import { NextRequest, NextResponse } from 'next/server'
import { database, ref, update } from '@/lib/firebase-realtime'
import { requireAdmin } from '@/lib/ensure-admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const { orderId } = params
    const body = await request.json()
    
    // Update order in Realtime Database
    const orderRef = ref(database, `orders/${orderId}`)
    
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    // Add fields from request body
    if (body.status) updates.status = body.status
    if (body.trackingNumber) updates.trackingNumber = body.trackingNumber
    if (body.paymentStatus) updates.paymentStatus = body.paymentStatus
    
    await update(orderRef, updates)

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
