'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, query, orderBy, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Eye, 
  Download, 
  Filter, 
  FileText, 
  X,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'
import { sendOrderNotification } from '@/lib/notification-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  items: OrderItem[]
  total: number
  subtotal?: number
  shippingCost?: number
  tax?: number
  discount?: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    pincode: string
    country?: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    pincode: string
    country?: string
  }
  createdAt: Date
  updatedAt?: Date
  trackingNumber?: string
  notes?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const loadOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(ordersQuery)
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Order[]

      setOrders(ordersData)
      setFilteredOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, order: Order) => {
    setUpdating(orderId)
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      })

      await sendOrderNotification(
        order.userId,
        orderId,
        {
          status: newStatus,
          items: order.items,
          total: order.total,
          trackingNumber: order.trackingNumber
        },
        {
          email: order.userEmail,
          phone: order.userPhone,
          name: order.userName
        }
      )

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o
      ))
      
      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      toast.error('No orders selected')
      return
    }

    try {
      const batch = writeBatch(db)
      
      selectedOrders.forEach(orderId => {
        const orderRef = doc(db, 'orders', orderId)
        batch.update(orderRef, {
          status: newStatus,
          updatedAt: new Date()
        })
      })

      await batch.commit()

      setOrders(orders.map(o => 
        selectedOrders.includes(o.id) ? { ...o, status: newStatus, updatedAt: new Date() } : o
      ))

      setSelectedOrders([])
      toast.success(`${selectedOrders.length} orders updated successfully`)
    } catch (error) {
      console.error('Error bulk updating orders:', error)
      toast.error('Failed to update orders')
    }
  }

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Subtotal', 'Shipping', 'Tax', 'Total', 'Status', 'Payment Method', 'Tracking Number', 'Date']
    const rows = filteredOrders.map(order => [
      order.id,
      order.userName,
      order.userEmail,
      order.userPhone || '',
      order.items?.length || 0,
      order.subtotal || 0,
      order.shippingCost || 0,
      order.tax || 0,
      order.total,
      order.status,
      order.paymentMethod || '',
      order.trackingNumber || '',
      order.createdAt?.toLocaleDateString('en-IN')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Orders exported successfully')
  }

  const printInvoice = (order: Order) => {
    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #D4AF37; }
            .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #D4AF37; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">MITSS</div>
            <p>Premium Handicrafts & Wooden Furniture</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <strong>Invoice #:</strong> ${order.id}<br>
              <strong>Date:</strong> ${order.createdAt?.toLocaleDateString('en-IN')}<br>
              <strong>Status:</strong> ${order.status.toUpperCase()}
            </div>
            <div>
              <strong>Bill To:</strong><br>
              ${order.userName}<br>
              ${order.userEmail}<br>
              ${order.userPhone || ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            ${order.shippingAddress.country || 'India'}
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString('en-IN')}</td>
                    <td>₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="total">
            ${order.subtotal ? `<div>Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}</div>` : ''}
            ${order.shippingCost ? `<div>Shipping: ₹${order.shippingCost.toLocaleString('en-IN')}</div>` : ''}
            ${order.tax ? `<div>Tax: ₹${order.tax.toLocaleString('en-IN')}</div>` : ''}
            ${order.discount ? `<div>Discount: -₹${order.discount.toLocaleString('en-IN')}</div>` : ''}
            <div style="font-size: 20px; margin-top: 10px; color: #D4AF37;">Grand Total: ₹${order.total.toLocaleString('en-IN')}</div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For queries, contact: support@mitss.com</p>
          </div>
        </body>
      </html>
    `

    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()
    invoiceWindow.print()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      out_for_delivery: 'Out for Delivery',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    )
  }

  const toggleAllOrders = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id))
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    shipped: filteredOrders.filter(o => o.status === 'shipped').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
    totalRevenue: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  }

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const paginatedOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Shipped</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, customer, email, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filteredOrders.length} orders
                </span>
                {selectedOrders.length > 0 && (
                  <span className="text-primary font-medium">{selectedOrders.length} selected</span>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg flex items-center justify-between">
                <span className="font-medium">{selectedOrders.length} order(s) selected</span>
                <div className="flex gap-2">
                  <Select onValueChange={bulkUpdateStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Bulk Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                      <SelectItem value="shipped">Mark as Shipped</SelectItem>
                      <SelectItem value="delivered">Mark as Delivered</SelectItem>
                      <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-3 px-6">
                          <Checkbox
                            checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                            onCheckedChange={toggleAllOrders}
                          />
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Customer</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Items</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Total</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono text-sm">#{order.id.slice(0, 8)}</div>
                            {order.trackingNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                Track: {order.trackingNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium">{order.userName}</p>
                              <p className="text-sm text-gray-500">{order.userEmail}</p>
                              {order.userPhone && (
                                <p className="text-xs text-gray-400">{order.userPhone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <div className="font-medium">{order.items?.length || 0} items</div>
                            <div className="text-xs text-gray-500">
                              {order.items?.reduce((sum, item) => sum + item.quantity, 0)} units
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold">₹{order.total?.toLocaleString('en-IN')}</div>
                            {order.paymentMethod && (
                              <div className="text-xs text-gray-500 capitalize">{order.paymentMethod}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value, order)}
                              disabled={updating === order.id}
                            >
                              <SelectTrigger className={`w-40 border ${getStatusColor(order.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            <div>{order.createdAt?.toLocaleDateString('en-IN')}</div>
                            <div className="text-xs text-gray-400">
                              {order.createdAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openOrderDetail(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => printInvoice(order)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order Details - #{selectedOrder?.id.slice(0, 8)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Order placed on {selectedOrder?.createdAt?.toLocaleDateString('en-IN')}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Status and Tracking */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-2">Order Status</div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-2">Tracking Number</div>
                      <div className="font-mono">{selectedOrder.trackingNumber || 'Not Available'}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium">{selectedOrder.userName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div>{selectedOrder.userEmail}</div>
                      </div>
                      {selectedOrder.userPhone && (
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {selectedOrder.userPhone}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </h3>
                      <div className="text-sm space-y-1">
                        <div>{selectedOrder.shippingAddress.street}</div>
                        <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</div>
                        <div>{selectedOrder.shippingAddress.pincode}</div>
                        <div>{selectedOrder.shippingAddress.country || 'India'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedOrder.billingAddress && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Billing Address
                        </h3>
                        <div className="text-sm space-y-1">
                          <div>{selectedOrder.billingAddress.street}</div>
                          <div>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state}</div>
                          <div>{selectedOrder.billingAddress.pincode}</div>
                          <div>{selectedOrder.billingAddress.country || 'India'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Items */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                            <div className="text-sm text-gray-500">₹{item.price.toLocaleString('en-IN')} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      {selectedOrder.subtotal && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedOrder.shippingCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span>₹{selectedOrder.shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedOrder.tax && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span>₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedOrder.discount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {selectedOrder.paymentMethod && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">Payment Method</div>
                        <div className="font-medium capitalize">{selectedOrder.paymentMethod}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedOrder.notes && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Order Notes</h3>
                      <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => printInvoice(selectedOrder)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                  <Button onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
