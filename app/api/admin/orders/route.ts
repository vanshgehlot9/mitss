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

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '50')
    
    // Fetch orders with limit
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(limitParam)
    )
    
    const snapshot = await getDocs(ordersQuery)
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        orderNumber: data.orderNumber,
        userName: data.userName,
        userEmail: data.userEmail,
        status: data.status,
        paymentStatus: data.paymentStatus,
        total: data.total || data.pricing?.total || 0,
        subtotal: data.subtotal || data.pricing?.subtotal || 0,
        shipping: data.shipping || data.pricing?.shipping || 0,
        gst: data.gst || data.pricing?.gst || 0,
        items: data.items || [],
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        trackingNumber: data.trackingNumber,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      }
    })
    
    // Calculate stats
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    }

    return NextResponse.json({
      success: true,
      orders,
      stats
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
