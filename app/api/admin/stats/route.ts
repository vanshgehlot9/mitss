import { NextRequest, NextResponse } from "next/server"
// Firestore disabled - using Realtime Database
// import { db } from "@/lib/firebase"
// import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"

// Force dynamic rendering - don't try to statically analyze this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Firestore not configured - return mock data or error
  return NextResponse.json(
    { 
      error: "Firestore not configured. Admin stats temporarily unavailable.",
      message: "Using Firebase Realtime Database for all operations. Admin dashboard stats will be available soon."
    },
    { status: 503 }
  )
  
  /* FIRESTORE CODE DISABLED
  try {
    // Check if Firestore is available
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured. Please configure Firestore in environment variables." },
        { status: 503 }
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

    // Fetch all orders from Firestore
    const ordersSnapshot = await getDocs(collection(db, "orders"))
    const allOrders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))

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

    // Fetch customers from Firestore
    const usersSnapshot = await getDocs(collection(db, "users"))
    const allUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))

    const currentCustomers = allUsers.filter(user => 
      user.createdAt && user.createdAt >= startDate
    ).length

    const previousCustomers = allUsers.filter(user =>
      user.createdAt && 
      user.createdAt >= previousStartDate && 
      user.createdAt < startDate
    ).length

    const customersChange =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0

    // Fetch products from Firestore
    const productsSnapshot = await getDocs(collection(db, "products"))
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    const totalProducts = products.length

    let lowStockProducts = 0
    const productSales: Record<string, { name: string; category: string; image: string; revenue: number; units: number; stock: number }> = {}

    products.forEach((product: any) => {
      if ((product.stock || 0) < 10) {
        lowStockProducts++
      }

      // Initialize product sales tracking
      productSales[product.id] = {
        name: product.name || "",
        category: product.category || "",
        image: product.images?.[0] || "/placeholder.jpg",
        revenue: 0,
        units: 0,
        stock: product.stock || 0,
      }
    })

    // Calculate product sales from orders
    currentOrders.forEach((order) => {
      order.items?.forEach((item: any) => {
        if (productSales[item.id]) {
          productSales[item.id].revenue += item.price * item.quantity
          productSales[item.id].units += item.quantity
        }
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
        totalCustomers: currentCustomers,
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
  */
}
