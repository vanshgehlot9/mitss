import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    // Fetch recent orders
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(200)
    )
    
    const snapshot = await getDocs(ordersQuery)
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        total: data.total || data.pricing?.total || 0,
        createdAt: data.createdAt?.toDate?.() || new Date()
      }
    })
    
    // Group by customer
    const customerMap = new Map()
    
    orders.forEach(order => {
      if (!order.userId) return
      
      if (!customerMap.has(order.userId)) {
        customerMap.set(order.userId, {
          id: order.userId,
          name: order.userName || 'Unknown',
          email: order.userEmail || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt
        })
      }
      
      const customer = customerMap.get(order.userId)
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
