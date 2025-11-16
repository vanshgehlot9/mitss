'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle,
  Download,
  Mail,
  Target,
  Zap,
} from 'lucide-react'

interface CustomerMetrics {
  customerId: string
  email: string
  totalSpent: number
  orderCount: number
  averageOrderValue: number
  clv: number
  segment: 'vip' | 'loyal' | 'regular' | 'at-risk' | 'new'
  churnRisk: 'low' | 'medium' | 'high'
}

interface AbandonedCart {
  _id: string
  customerId: string
  customerEmail: string
  cartValue: number
  items: any[]
  recoveryEmailSent: boolean
}

interface ConversionStage {
  stage: string
  users: number
  conversionRate: number
  dropoffRate: number
}

export default function AdvancedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [topCustomers, setTopCustomers] = useState<CustomerMetrics[]>([])
  const [atRiskCustomers, setAtRiskCustomers] = useState<CustomerMetrics[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([])
  const [funnel, setFunnel] = useState<ConversionStage[]>([])
  const [customerSegments, setCustomerSegments] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecoveryEmails, setSelectedRecoveryEmails] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)

      // Fetch top customers
      const customersRes = await fetch('/api/admin/analytics/customers?action=top-customers')
      const customersData = await customersRes.json()
      if (customersData.success) {
        setTopCustomers(customersData.data.customers)
      }

      // Fetch at-risk customers
      const atRiskRes = await fetch('/api/admin/analytics/customers?action=at-risk')
      const atRiskData = await atRiskRes.json()
      if (atRiskData.success) {
        setAtRiskCustomers(atRiskData.data.customers)
      }

      // Fetch customer segments
      const segmentsRes = await fetch('/api/admin/analytics/customers?action=segments')
      const segmentsData = await segmentsRes.json()
      if (segmentsData.success) {
        setCustomerSegments(segmentsData.data)
      }

      // Fetch abandoned carts
      const cartsRes = await fetch('/api/admin/analytics/abandoned-carts?action=list')
      const cartsData = await cartsRes.json()
      if (cartsData.success) {
        setAbandonedCarts(cartsData.data.carts)
      }

      // Fetch conversion funnel
      const funnelRes = await fetch('/api/admin/analytics/funnel?action=stages')
      const funnelData = await funnelRes.json()
      if (funnelData.success) {
        setFunnel(funnelData.data.funnel)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRecoveryEmails = async () => {
    try {
      const cartIds = Array.from(selectedRecoveryEmails)
      const res = await fetch('/api/admin/analytics/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-recovery-emails',
          cartIds,
        }),
      })

      if (res.ok) {
        alert(`Recovery emails sent to ${cartIds.length} customers`)
        setSelectedRecoveryEmails(new Set())
        fetchAnalyticsData()
      }
    } catch (error) {
      console.error('Failed to send recovery emails:', error)
    }
  }

  const segmentColors = {
    vip: '#FFD700',
    loyal: '#4CAF50',
    regular: '#2196F3',
    atRisk: '#FF9800',
    new: '#9C27B0',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-gray-500 mt-1">Comprehensive business metrics and insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-gray-500 mt-1">+15% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" />
              Avg CLV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8,450</div>
            <p className="text-xs text-gray-500 mt-1">Customer Lifetime Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCustomers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Customers to retain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.04%</div>
            <p className="text-xs text-gray-500 mt-1">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="carts">Abandoned</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(customerSegments).map(([key, value]) => ({
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          value: value,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {Object.keys(customerSegments).map((key) => (
                          <Cell
                            key={key}
                            fill={segmentColors[key as keyof typeof segmentColors]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Churn Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk</CardTitle>
                <CardDescription>Customer risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Low Risk</span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Medium Risk</span>
                      <span className="text-sm font-bold">15%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '15%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">High Risk</span>
                      <span className="text-sm font-bold">7%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '7%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by CLV</CardTitle>
                <CardDescription>Highest lifetime value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, idx) => (
                    <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{customer.email}</p>
                        <p className="text-sm text-gray-500">
                          {customer.orderCount} orders • ₹{customer.totalSpent.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{customer.clv}</p>
                        <Badge className="mt-1">{customer.segment}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  At-Risk Customers
                </CardTitle>
                <CardDescription>Needs retention attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {atRiskCustomers.length > 0 ? (
                    atRiskCustomers.map((customer) => (
                      <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{customer.email}</p>
                          <p className="text-sm text-gray-500">
                            CLV: ₹{customer.clv}
                          </p>
                        </div>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No at-risk customers</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Customer journey from visitor to buyer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnel}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" name="Users" />
                    <Bar dataKey="dropoffRate" fill="#ef4444" name="Dropoff %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Funnel Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnel.map((stage, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-sm text-gray-500">{stage.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(stage.conversionRate * 20, 100)}%` }}
                      />
                    </div>
                    {stage.dropoffRate > 0 && (
                      <p className="text-xs text-red-500">Dropoff: {stage.dropoffRate.toFixed(1)}%</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="carts" className="space-y-6">
          {/* Recovery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Abandoned Carts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{abandonedCarts.length}</p>
                <p className="text-xs text-gray-500">Active carts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cart Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{abandonedCarts.reduce((sum, c) => sum + c.cartValue, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{Math.round(abandonedCarts.reduce((sum, c) => sum + c.cartValue, 0) / Math.max(abandonedCarts.length, 1))}
                </p>
                <p className="text-xs text-gray-500">Average value</p>
              </CardContent>
            </Card>
          </div>

          {/* Carts List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recovery Campaigns</CardTitle>
                  <CardDescription>Send recovery emails to recover revenue</CardDescription>
                </div>
                <Button
                  onClick={handleSendRecoveryEmails}
                  disabled={selectedRecoveryEmails.size === 0}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send ({selectedRecoveryEmails.size})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {abandonedCarts.map((cart) => (
                  <div
                    key={cart._id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecoveryEmails.has(cart._id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedRecoveryEmails)
                        if (e.target.checked) {
                          newSet.add(cart._id)
                        } else {
                          newSet.delete(cart._id)
                        }
                        setSelectedRecoveryEmails(newSet)
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{cart.customerEmail}</p>
                      <p className="text-sm text-gray-500">
                        {cart.items.length} items • ₹{cart.cartValue}
                      </p>
                    </div>
                    {cart.recoveryEmailSent && (
                      <Badge variant="outline">Email Sent</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download analytics data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Customer Metrics', format: 'CSV', icon: Users },
                  { name: 'Product Performance', format: 'PDF', icon: TrendingUp },
                  { name: 'Conversion Funnel', format: 'CSV', icon: Target },
                  { name: 'Revenue Report', format: 'PDF', icon: Zap },
                ].map((report) => (
                  <Button
                    key={report.name}
                    variant="outline"
                    className="h-24 justify-start gap-3"
                  >
                    <report.icon className="h-6 w-6" />
                    <div className="text-left">
                      <p className="font-semibold">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.format}</p>
                    </div>
                    <Download className="h-4 w-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
