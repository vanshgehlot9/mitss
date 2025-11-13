import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"

    // Calculate date ranges
    const now = new Date()
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
    const days = daysMap[range] || 7
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')

    // Fetch orders for current period
    const currentOrders = await db.collection("orders")
      .find({ createdAt: { $gte: startDate } })
      .toArray()

    // Fetch orders for previous period
    const previousOrdersDocs = await db.collection("orders")
      .find({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      })
      .toArray()

    // Calculate current period stats
    let totalRevenue = 0
    let totalOrders = currentOrders.length
    const revenueByDate: Record<string, { revenue: number; orders: number }> = {}

    currentOrders.forEach((order) => {
      const revenue = order.pricing?.total || 0
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

    previousOrdersDocs.forEach((order) => {
      previousRevenue += order.pricing?.total || 0
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

    // Fetch customers
    const currentCustomers = await db.collection("users")
      .countDocuments({ createdAt: { $gte: startDate } })

    const previousCustomers = await db.collection("users")
      .countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      })

    const customersChange =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0

    // Fetch products
    const products = await db.collection("products").find({}).toArray()
    const totalProducts = products.length

    let lowStockProducts = 0
    const productSales: Record<string, { name: string; category: string; image: string; revenue: number; units: number; stock: number }> = {}

    products.forEach((product) => {
      if ((product.stock || 0) < 10) {
        lowStockProducts++
      }

      // Initialize product sales tracking
      productSales[product._id.toString()] = {
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
    const recentOrdersDocs = await db.collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const recentOrders = recentOrdersDocs.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber || "",
      customer: order.userName || "Unknown",
      total: order.pricing?.total || 0,
      status: order.status || "pending",
      date: new Date(order.createdAt).toLocaleDateString(),
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
    const pendingOrders = await db.collection("orders")
      .countDocuments({ status: "pending" })

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
}
