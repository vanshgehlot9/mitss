'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  FileText
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: any[]
  total: number
  status: string
  createdAt: Date
  paymentMethod?: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface AnalyticsData {
  revenue: {
    total: number
    change: number
    byDay: { date: string; revenue: number }[]
    byMonth: { month: string; revenue: number }[]
  }
  orders: {
    total: number
    change: number
    byStatus: { status: string; count: number }[]
  }
  customers: {
    total: number
    new: number
    returning: number
    lifetimeValue: number
  }
  products: {
    topSelling: { name: string; quantity: number; revenue: number }[]
    byCategory: { category: string; revenue: number; count: number }[]
    lowStock: { name: string; stock: number }[]
  }
  paymentMethods: { method: string; count: number; revenue: number }[]
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      // Load orders
      const ordersSnapshot = await getDocs(
        query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        )
      )

      const allOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Order[]

      // Filter by date range
      const orders = allOrders.filter(order => 
        order.createdAt >= startDate && order.createdAt <= endDate
      )

      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - parseInt(timeRange))
      const previousOrders = allOrders.filter(order =>
        order.createdAt >= previousStartDate && order.createdAt < startDate
      )

      // Load products
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      // Calculate revenue metrics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0

      // Revenue by day
      const revenueByDay: { [key: string]: number } = {}
      orders.forEach(order => {
        const dateKey = order.createdAt.toLocaleDateString('en-IN')
        revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + order.total
      })

      const revenueByDayArray = Object.entries(revenueByDay)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Revenue by month
      const revenueByMonth: { [key: string]: number } = {}
      allOrders.forEach(order => {
        const monthKey = order.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.total
      })

      const revenueByMonthArray = Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .slice(-12)

      // Orders metrics
      const orderChange = previousOrders.length > 0 
        ? ((orders.length - previousOrders.length) / previousOrders.length) * 100 
        : 0

      const ordersByStatus: { [key: string]: number } = {}
      orders.forEach(order => {
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
      })

      const ordersByStatusArray = Object.entries(ordersByStatus)
        .map(([status, count]) => ({ 
          status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
          count 
        }))

      // Customer metrics
      const uniqueCustomers = new Set(orders.map(o => o.userId)).size
      const allUniqueCustomers = new Set(allOrders.map(o => o.userId))
      const customerFirstOrder: { [key: string]: Date } = {}
      
      allOrders.forEach(order => {
        if (!customerFirstOrder[order.userId] || order.createdAt < customerFirstOrder[order.userId]) {
          customerFirstOrder[order.userId] = order.createdAt
        }
      })

      const newCustomers = orders.filter(order => {
        const firstOrder = customerFirstOrder[order.userId]
        return firstOrder && firstOrder >= startDate && firstOrder <= endDate
      })

      const uniqueNewCustomers = new Set(newCustomers.map(o => o.userId)).size
      const returningCustomers = uniqueCustomers - uniqueNewCustomers

      // Customer Lifetime Value
      const customerSpending: { [key: string]: number } = {}
      allOrders.forEach(order => {
        customerSpending[order.userId] = (customerSpending[order.userId] || 0) + order.total
      })
      const lifetimeValue = allUniqueCustomers.size > 0
        ? Object.values(customerSpending).reduce((sum, val) => sum + val, 0) / allUniqueCustomers.size
        : 0

      // Top selling products
      const productSales: { [key: string]: { quantity: number; revenue: number; name: string } } = {}
      
      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { quantity: 0, revenue: 0, name: item.name }
          }
          productSales[item.id].quantity += item.quantity || 1
          productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1)
        })
      })

      const topSelling = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Products by category
      const categoryRevenue: { [key: string]: { revenue: number; count: number } } = {}
      
      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          const product = products.find(p => p.id === item.id)
          const category = product?.category || 'Uncategorized'
          
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = { revenue: 0, count: 0 }
          }
          categoryRevenue[category].revenue += (item.price || 0) * (item.quantity || 1)
          categoryRevenue[category].count += item.quantity || 1
        })
      })

      const productsByCategory = Object.entries(categoryRevenue)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.revenue - a.revenue)

      // Payment methods
      const paymentMethodStats: { [key: string]: { count: number; revenue: number } } = {}
      
      orders.forEach(order => {
        const method = order.paymentMethod || 'Unknown'
        if (!paymentMethodStats[method]) {
          paymentMethodStats[method] = { count: 0, revenue: 0 }
        }
        paymentMethodStats[method].count += 1
        paymentMethodStats[method].revenue += order.total
      })

      const paymentMethods = Object.entries(paymentMethodStats)
        .map(([method, data]) => ({ 
          method: method.charAt(0).toUpperCase() + method.slice(1), 
          ...data 
        }))

      setAnalytics({
        revenue: {
          total: totalRevenue,
          change: revenueChange,
          byDay: revenueByDayArray,
          byMonth: revenueByMonthArray
        },
        orders: {
          total: orders.length,
          change: orderChange,
          byStatus: ordersByStatusArray
        },
        customers: {
          total: uniqueCustomers,
          new: uniqueNewCustomers,
          returning: returningCustomers,
          lifetimeValue
        },
        products: {
          topSelling,
          byCategory: productsByCategory,
          lowStock: []
        },
        paymentMethods
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!analytics) return

    const sections = [
      ['REVENUE SUMMARY'],
      ['Total Revenue', analytics.revenue.total],
      ['Change', `${analytics.revenue.change.toFixed(2)}%`],
      [''],
      ['ORDERS SUMMARY'],
      ['Total Orders', analytics.orders.total],
      ['Change', `${analytics.orders.change.toFixed(2)}%`],
      [''],
      ['CUSTOMER SUMMARY'],
      ['Total Customers', analytics.customers.total],
      ['New Customers', analytics.customers.new],
      ['Returning Customers', analytics.customers.returning],
      ['Lifetime Value', analytics.customers.lifetimeValue.toFixed(2)],
      [''],
      ['TOP SELLING PRODUCTS'],
      ['Product', 'Quantity', 'Revenue'],
      ...analytics.products.topSelling.map(p => [p.name, p.quantity, p.revenue])
    ]

    const csv = sections.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Analytics exported to CSV')
  }

  const exportToPDF = () => {
    if (!analytics) return

    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Analytics Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 30)
    doc.text(`Period: Last ${timeRange} days`, 14, 36)

    // Revenue Summary
    doc.setFontSize(14)
    doc.text('Revenue Summary', 14, 50)
    ;(doc as any).autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `₹${analytics.revenue.total.toLocaleString('en-IN')}`],
        ['Change', `${analytics.revenue.change.toFixed(2)}%`]
      ]
    })

    // Orders Summary
    let finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text('Orders Summary', 14, finalY)
    ;(doc as any).autoTable({
      startY: finalY + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', analytics.orders.total.toString()],
        ['Change', `${analytics.orders.change.toFixed(2)}%`]
      ]
    })

    // Customer Summary
    finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text('Customer Summary', 14, finalY)
    ;(doc as any).autoTable({
      startY: finalY + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Total Customers', analytics.customers.total.toString()],
        ['New Customers', analytics.customers.new.toString()],
        ['Returning Customers', analytics.customers.returning.toString()],
        ['Avg Lifetime Value', `₹${analytics.customers.lifetimeValue.toLocaleString('en-IN')}`]
      ]
    })

    // Top Products
    finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text('Top Selling Products', 14, finalY)
    ;(doc as any).autoTable({
      startY: finalY + 5,
      head: [['Product', 'Quantity', 'Revenue']],
      body: analytics.products.topSelling.slice(0, 10).map(p => [
        p.name,
        p.quantity,
        `₹${p.revenue.toLocaleString('en-IN')}`
      ])
    })

    doc.save(`analytics-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Analytics exported to PDF')
  }

  const COLORS = ['#D4AF37', '#1A2642', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Comprehensive business insights and reports</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(analytics.revenue.total / 1000).toFixed(1)}k
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${analytics.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.revenue.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(analytics.revenue.change).toFixed(1)}%
                  </div>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold mt-2">{analytics.orders.total}</p>
                  <div className={`flex items-center mt-2 text-sm ${analytics.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.orders.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(analytics.orders.change).toFixed(1)}%
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Customers</p>
                  <p className="text-2xl font-bold mt-2">{analytics.customers.total}</p>
                  <div className="text-sm text-gray-600 mt-2">
                    {analytics.customers.new} new
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Lifetime Value</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(analytics.customers.lifetimeValue / 1000).toFixed(1)}k
                  </p>
                  <div className="text-sm text-gray-600 mt-2">
                    Per customer
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Daily)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenue.byDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenue.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#D4AF37" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Orders and Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.orders.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.orders.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Customers</p>
                    <p className="text-sm text-gray-500">First purchase this period</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{analytics.customers.new}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Returning Customers</p>
                    <p className="text-sm text-gray-500">Repeat purchases</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.customers.returning}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Average Lifetime Value</p>
                    <p className="text-sm text-gray-500">Per customer</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{analytics.customers.lifetimeValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.products.topSelling.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                    </div>
                    <p className="font-bold text-primary">
                      ₹{(product.revenue / 1000).toFixed(1)}k
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.products.byCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#1A2642" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.paymentMethods.map((method, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{method.method}</p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    ₹{(method.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{method.count} transactions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
