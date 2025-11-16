import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from '@/lib/ensure-admin'
import { database, ref, get } from '@/lib/firebase-realtime'

// Force dynamic rendering - don't try to statically analyze this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Server-side admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"

    // Calculate date ranges
    const now = new Date()
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
    const days = daysMap[range] || 7
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Fetch all orders from Realtime Database
    const ordersRef = ref(database, 'orders')
    const ordersSnapshot = await get(ordersRef)
    
    const allOrders: any[] = []
    if (ordersSnapshot.exists()) {
      const ordersData = ordersSnapshot.val()
      Object.entries(ordersData).forEach(([id, data]: [string, any]) => {
        allOrders.push({
          id,
          ...data,
          createdAt: new Date(data.createdAt)
        })
      })
    }

    // Filter orders for current period
    const currentOrders = allOrders.filter(order => 
      order.createdAt && order.createdAt >= startDate
    )

    // Filter orders for previous period
    const previousOrdersDocs = allOrders.filter(order =>
      order.createdAt && 
      order.createdAt >= previousStartDate && 
      order.createdAt < startDate
    )

    // Calculate current period stats
    let totalRevenue = 0
    let totalOrders = currentOrders.length
    const revenueByDate: Record<string, { revenue: number; orders: number }> = {}

    currentOrders.forEach((order: any) => {
      const revenue = order.total || order.pricing?.total || 0
      totalRevenue += revenue

      // Group by date for chart
      const date = order.createdAt
      if (date) {
        const dateKey = new Date(date).toISOString().split("T")[0]
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = { revenue: 0, orders: 0 }
        }
        revenueByDate[dateKey].revenue += revenue
        revenueByDate[dateKey].orders += 1
      }
    })

    // Calculate previous period stats
    let previousRevenue = 0
    let previousOrders = previousOrdersDocs.length

    previousOrdersDocs.forEach((order: any) => {
      previousRevenue += order.total || order.pricing?.total || 0
    })

    // Calculate changes
    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0
    const ordersChange =
      previousOrders > 0
        ? ((totalOrders - previousOrders) / previousOrders) * 100
        : 0

    // Calculate customers from orders (unique emails)
    const uniqueEmails = new Set()
    allOrders.forEach(order => {
      if (order.userEmail) uniqueEmails.add(order.userEmail)
    })
    
    const currentCustomerEmails = new Set()
    currentOrders.forEach(order => {
      if (order.userEmail) currentCustomerEmails.add(order.userEmail)
    })
    
    const previousCustomerEmails = new Set()
    previousOrdersDocs.forEach(order => {
      if (order.userEmail) previousCustomerEmails.add(order.userEmail)
    })

    const currentCustomers = currentCustomerEmails.size
    const previousCustomers = previousCustomerEmails.size

    const customersChange =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0

    // Use mock data for products (since we're using initial-products)
    const totalProducts = 50 // Approximate number
    const lowStockProducts = 0

    // Calculate product sales from orders
    const productSales: Record<string, { name: string; category: string; image: string; revenue: number; units: number; stock: number }> = {}

    currentOrders.forEach((order) => {
      order.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name || "",
            category: item.category || "",
            image: item.image || "/placeholder.jpg",
            revenue: 0,
            units: 0,
            stock: 999,
          }
        }
        productSales[item.id].revenue += item.price * item.quantity
        productSales[item.id].units += item.quantity
      })
    })

    // Get top products
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent orders
    const recentOrdersDocs = allOrders
      .sort((a: any, b: any) => {
        const dateA = a.createdAt || new Date(0)
        const dateB = b.createdAt || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 5)

    const recentOrders = recentOrdersDocs.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber || "",
      customer: order.userName || "Unknown",
      total: order.total || order.pricing?.total || 0,
      status: order.status || "pending",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
    }))

    // Format revenue data for chart
    const revenueData = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate avg order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate pending orders
    const pendingOrders = allOrders.filter((order: any) => 
      order.status === "pending"
    ).length

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue),
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalOrders,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalCustomers: uniqueEmails.size,
        customersChange: Math.round(customersChange * 10) / 10,
        totalProducts,
        productsChange: 0,
        lowStockProducts,
        avgOrderValue: Math.round(avgOrderValue),
        conversionRate: 0,
        pendingOrders,
      },
      revenueData,
      topProducts,
      recentOrders,
    })
  } catch (error: any) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
