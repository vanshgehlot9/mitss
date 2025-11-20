"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Link from "next/link"
import Image from "next/image"

interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalCustomers: number
  customersChange: number
  totalProducts: number
  productsChange: number
  avgOrderValue: number
  conversionRate: number
  lowStockProducts: number
  pendingOrders: number
}

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  id: string
  name: string
  image: string
  category: string
  revenue: number
  unitsSold: number
  stock: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  total: number
  status: string
  date: string
}

export default function AdminDashboard() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d")
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([])

  useEffect(() => {
    if (!user) {
      router.push("/admin/login")
      return
    }

    // Allow any authenticated user to access admin dashboard
    fetchDashboardData()
  }, [user, router, timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard statistics
      const statsRes = await fetch(`/api/admin/stats?range=${timeRange}`)
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
        setRevenueData(data.revenueData || [])
        setTopProducts(data.topProducts || [])
        setRecentOrders(data.recentOrders || [])
        
        // Set category data from API or use default
        if (data.categoryData && data.categoryData.length > 0) {
          setCategoryData(data.categoryData)
        } else {
          // Use default data if no real data available
          setCategoryData([
            { name: "Living Room", value: 35, color: "#F4C430" },
            { name: "Dining Room", value: 25, color: "#D4AF37" },
            { name: "Seating", value: 20, color: "#1A2642" },
            { name: "Bedroom", value: 15, color: "#8B7355" },
            { name: "Kitchen", value: 5, color: "#FF6B6B" },
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Default category colors for fallback
  const defaultCategoryData = [
    { name: "Living Room", value: 35, color: "#F4C430" },
    { name: "Dining Room", value: 25, color: "#D4AF37" },
    { name: "Seating", value: 20, color: "#1A2642" },
    { name: "Bedroom", value: 15, color: "#8B7355" },
    { name: "Kitchen", value: 5, color: "#FF6B6B" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#1A2642]/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A2642] mb-2">Dashboard</h1>
              <p className="text-[#1A2642]/60">
                Welcome back, {userData?.displayName || "Admin"}
              </p>
            </div>
            <div className="flex gap-3">
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <TabsList>
                  <TabsTrigger value="7d">7 Days</TabsTrigger>
                  <TabsTrigger value="30d">30 Days</TabsTrigger>
                  <TabsTrigger value="90d">90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Revenue Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-l-4 border-l-[#D4AF37]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#1A2642]">
                      ₹{stats?.totalRevenue?.toLocaleString() || "0"}
                    </div>
                    <div className={`flex items-center text-sm mt-1 ${
                      (stats?.revenueChange || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {(stats?.revenueChange || 0) >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats?.revenueChange || 0)}% from last period
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#1A2642]">
                      {stats?.totalOrders || 0}
                    </div>
                    <div className={`flex items-center text-sm mt-1 ${
                      (stats?.ordersChange || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {(stats?.ordersChange || 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats?.ordersChange || 0)}% from last period
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customers Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60">
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#1A2642]">
                      {stats?.totalCustomers || 0}
                    </div>
                    <div className={`flex items-center text-sm mt-1 ${
                      (stats?.customersChange || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {(stats?.customersChange || 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats?.customersChange || 0)}% from last period
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#1A2642]">
                      {stats?.totalProducts || 0}
                    </div>
                    <div className="flex items-center text-sm mt-1 text-[#1A2642]/60">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {stats?.lowStockProducts || 0} low stock
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      name="Revenue (₹)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#1A2642"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Product category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : defaultCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(categoryData.length > 0 ? categoryData : defaultCategoryData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.length > 0 ? (
                    topProducts.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 text-lg font-bold text-[#D4AF37] w-8">
                          #{index + 1}
                        </div>
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#1A2642] truncate">{product.name}</h4>
                          <p className="text-sm text-[#1A2642]/60">{product.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-[#1A2642]">
                            ₹{product.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-[#1A2642]/60">{product.unitsSold} sold</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#1A2642]/60">
                      No product data available
                    </div>
                  )}
                </div>
                <Link href="/admin/products">
                  <Button variant="outline" className="w-full mt-4">
                    View All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-[#1A2642]">#{order.orderNumber}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#1A2642]/60 mt-1">{order.customer}</p>
                          <p className="text-xs text-[#1A2642]/40 mt-1">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#1A2642]">
                            ₹{order.total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#1A2642]/60">No recent orders</div>
                  )}
                </div>
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full mt-4">
                    View All Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/add-product">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Package className="w-6 h-6" />
                    <span>Add Product</span>
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span>Manage Orders</span>
                  </Button>
                </Link>
                <Link href="/admin/customers">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>View Customers</span>
                  </Button>
                </Link>
                <Link href="/admin/traffic">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Traffic Analytics</span>
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  )
}
