import { NextRequest, NextResponse } from 'next/server'
import { database, ref, get } from '@/lib/firebase-realtime'
import { requireAdmin } from '@/lib/ensure-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch orders from Realtime Database
    const ordersRef = ref(database, 'orders')
    const snapshot = await get(ordersRef)
    
    const orders: any[] = []
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val()
      
      // Convert to array
      Object.entries(ordersData).forEach(([id, data]: [string, any]) => {
        orders.push({
          userId: data.userId || data.userEmail,
          userName: data.userName,
          userEmail: data.userEmail,
          total: data.total || data.pricing?.total || 0,
          createdAt: new Date(data.createdAt)
        })
      })
      
      // Sort by date descending and limit to 200
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      orders.splice(200)
    }
    
    // Group by customer
    const customerMap = new Map()
    
    orders.forEach(order => {
      const customerId = order.userId || order.userEmail
      if (!customerId) return
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: order.userName || 'Unknown',
          email: order.userEmail || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt
        })
      }
      
      const customer = customerMap.get(customerId)
      customer.totalOrders++
      customer.totalSpent += order.total || 0
      
      if (order.createdAt > customer.lastOrderDate) {
        customer.lastOrderDate = order.createdAt
      }
    })
    
    const customers = Array.from(customerMap.values()).map(c => ({
      ...c,
      averageOrderValue: c.totalOrders > 0 ? c.totalSpent / c.totalOrders : 0,
      lastOrderDate: c.lastOrderDate.toISOString()
    }))

    return NextResponse.json({
      success: true,
      customers,
      stats: {
        total: customers.length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
