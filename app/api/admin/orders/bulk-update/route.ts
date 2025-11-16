import { NextRequest, NextResponse } from 'next/server'
import { database, ref, update } from '@/lib/firebase-realtime'
import { requireAdmin } from '@/lib/ensure-admin'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { orderIds, status } = body
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid orderIds provided' },
        { status: 400 }
      )
    }
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }
    
    // Update each order
    const updates: any = {}
    const timestamp = new Date().toISOString()
    
    orderIds.forEach((orderId: string) => {
      updates[`orders/${orderId}/status`] = status
      updates[`orders/${orderId}/updatedAt`] = timestamp
    })
    
    const dbRef = ref(database)
    await update(dbRef, updates)

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} orders updated successfully`
    })
  } catch (error: any) {
    console.error('Error bulk updating orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
