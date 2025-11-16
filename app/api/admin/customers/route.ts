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

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '100')
    
    // Fetch orders to extract customer data
    const ordersRef = ref(database, 'orders')
    const snapshot = await get(ordersRef)
    
    let customers: any[] = []
    const customerMap = new Map<string, any>()
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val()
      
      // Extract unique customers from orders
      Object.entries(ordersData).forEach(([orderId, orderData]: [string, any]) => {
        const email = orderData.userEmail || orderData.shippingAddress?.email
        
        if (email) {
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: email,
              email,
              name: orderData.userName || orderData.shippingAddress?.firstName + ' ' + orderData.shippingAddress?.lastName,
              phone: orderData.shippingAddress?.phone || '',
              address: orderData.shippingAddress ? {
                street: orderData.shippingAddress.address,
                city: orderData.shippingAddress.city,
                state: orderData.shippingAddress.state,
                pincode: orderData.shippingAddress.pincode
              } : null,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: orderData.createdAt,
              status: 'active',
              tags: []
            })
          }
          
          const customer = customerMap.get(email)
          customer.totalOrders++
          customer.totalSpent += orderData.total || orderData.pricing?.total || 0
          
          // Update last order date if this order is more recent
          if (new Date(orderData.createdAt) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = orderData.createdAt
          }
        }
      })
      
      // Convert map to array and add automatic tags
      customers = Array.from(customerMap.values()).map(customer => {
        const tags = []
        
        // Auto-tag based on spending
        if (customer.totalSpent > 50000) tags.push('VIP')
        else if (customer.totalSpent > 20000) tags.push('High Value')
        
        // Auto-tag based on order frequency
        if (customer.totalOrders >= 5) tags.push('Repeat Customer')
        else if (customer.totalOrders === 1) tags.push('New Customer')
        
        // Auto-tag based on recent activity
        const daysSinceLastOrder = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLastOrder <= 30) tags.push('Active')
        else if (daysSinceLastOrder > 90) tags.push('Inactive')
        
        return {
          ...customer,
          tags
        }
      })
      
      // Sort by total spent descending
      customers.sort((a, b) => b.totalSpent - a.totalSpent)
      
      // Apply limit
      customers = customers.slice(0, limitParam)
    }
    
    // Calculate stats
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.tags.includes('Active')).length,
      vip: customers.filter(c => c.tags.includes('VIP')).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)
        : 0
    }

    return NextResponse.json({
      success: true,
      customers,
      stats
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
