'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Package, TrendingDown, Bell, RefreshCw, Calendar } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface InventoryAlert {
  productId: string
  productName: string
  currentStock: number
  threshold: number
  alertType: 'low_stock' | 'out_of_stock' | 'restock_needed'
  status: 'active' | 'resolved'
  createdAt: Date
}

interface RestockRecommendation {
  productId: string
  productName: string
  recommendedQuantity: number
  supplierInfo?: string
}

interface InventoryForecast {
  currentStock: number
  avgDailySales: number
  daysUntilOutOfStock: number
  forecastDate: Date
}

export default function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [recommendations, setRecommendations] = useState<RestockRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [notifying, setNotifying] = useState(false)

  useEffect(() => {
    fetchAlerts()
    fetchRecommendations()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/alerts')
      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/inventory/alerts?action=recommendations')
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const handleNotifyAdmins = async () => {
    setNotifying(true)
    try {
      const response = await fetch('/api/inventory/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify' })
      })
      
      const data = await response.json()
      if (data.success) {
        alert('Inventory check completed and admins notified!')
      }
    } catch (error) {
      console.error('Error notifying admins:', error)
      alert('Failed to send notifications')
    } finally {
      setNotifying(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchAlerts()
    fetchRecommendations()
  }

  const outOfStock = alerts.filter(a => a.alertType === 'out_of_stock')
  const lowStock = alerts.filter(a => a.alertType === 'low_stock')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-red-600">
                {outOfStock.length}
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Critical - Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-orange-600">
                {lowStock.length}
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Needs restocking soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Restock Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">
                {recommendations.length}
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Products to reorder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleNotifyAdmins} disabled={notifying || alerts.length === 0}>
          <Bell className="w-4 h-4 mr-2" />
          {notifying ? 'Sending...' : 'Notify Admins'}
        </Button>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Out of Stock Products
            </CardTitle>
            <CardDescription>
              These products need immediate restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {outOfStock.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No out of stock products</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outOfStock.map((alert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {alert.productName}
                          </h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Current Stock: <strong className="text-red-600">0 units</strong></p>
                            <p>Threshold: {alert.threshold} units</p>
                          </div>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Low Stock Products
            </CardTitle>
            <CardDescription>
              Products running low on inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {lowStock.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All products have sufficient stock</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((alert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {alert.productName}
                          </h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Current Stock: <strong className="text-orange-600">{alert.currentStock} units</strong></p>
                            <p>Threshold: {alert.threshold} units</p>
                            <p className="text-xs text-gray-500">
                              {alert.threshold - alert.currentStock} units below threshold
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                          Warning
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Restock Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Restock Recommendations
          </CardTitle>
          <CardDescription>
            Suggested restock quantities based on sales history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No restock recommendations at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {rec.productName}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Recommended Quantity: <strong className="text-blue-600">{rec.recommendedQuantity} units</strong></p>
                          {rec.supplierInfo && (
                            <p className="text-xs text-gray-500">{rec.supplierInfo}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Order Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
