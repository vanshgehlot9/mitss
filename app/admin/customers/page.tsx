'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Download, 
  Filter, 
  X,
  Users,
  TrendingUp,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Tag,
  Star
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    pincode: string
  }
  createdAt: Date
  lastOrderDate?: Date
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  status: 'active' | 'inactive'
  tags: string[]
}

interface Order {
  id: string
  items: any[]
  total: number
  status: string
  createdAt: Date
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 10

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, tagFilter, statusFilter])

  const loadCustomers = async () => {
    try {
      // Load all orders first to calculate customer metrics
      const ordersSnapshot = await getDocs(collection(db, 'orders'))
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))

      // Group orders by user
      const customerMap = new Map<string, any>()

      orders.forEach((order: any) => {
        const userId = order.userId
        if (!userId) return

        if (!customerMap.has(userId)) {
          customerMap.set(userId, {
            id: userId,
            name: order.userName || 'Unknown',
            email: order.userEmail || '',
            phone: order.userPhone,
            address: order.shippingAddress,
            orders: [],
            totalSpent: 0,
            totalOrders: 0,
            createdAt: order.createdAt,
            lastOrderDate: order.createdAt,
            status: 'active' as const,
            tags: [] as string[]
          })
        }

        const customer = customerMap.get(userId)
        customer.orders.push(order)
        customer.totalSpent += order.total || 0
        customer.totalOrders += 1
        
        if (order.createdAt > customer.lastOrderDate) {
          customer.lastOrderDate = order.createdAt
        }
        if (order.createdAt < customer.createdAt) {
          customer.createdAt = order.createdAt
        }
      })

      // Convert to array and calculate metrics
      const customersData: Customer[] = Array.from(customerMap.values()).map(customer => {
        const averageOrderValue = customer.totalOrders > 0 
          ? customer.totalSpent / customer.totalOrders 
          : 0

        const tags: string[] = []
        
        // Auto-tag customers
        if (customer.totalSpent > 50000) tags.push('VIP')
        if (customer.totalSpent > 25000) tags.push('High Value')
        if (customer.totalOrders >= 5) tags.push('Loyal')
        
        const daysSinceCreation = (new Date().getTime() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 30) tags.push('New')
        
        const daysSinceLastOrder = customer.lastOrderDate 
          ? (new Date().getTime() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
          : 999
        
        if (daysSinceLastOrder > 90) tags.push('At Risk')

        return {
          ...customer,
          averageOrderValue,
          tags
        }
      })

      // Sort by total spent
      customersData.sort((a, b) => b.totalSpent - a.totalSpent)

      setCustomers(customersData)
      setFilteredCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = [...customers]

    if (tagFilter !== 'all') {
      filtered = filtered.filter(customer => customer.tags.includes(tagFilter))
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCustomers(filtered)
    setCurrentPage(1)
  }

  const loadCustomerOrders = async (customerId: string) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', customerId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(ordersQuery)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Order[]

      setCustomerOrders(orders)
    } catch (error) {
      console.error('Error loading customer orders:', error)
      toast.error('Failed to load customer orders')
    }
  }

  const openCustomerDetail = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
    await loadCustomerOrders(customer.id)
  }

  const exportToCSV = () => {
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Avg Order Value', 'Last Order', 'Tags', 'Status']
    const rows = filteredCustomers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone || '',
      customer.totalOrders,
      customer.totalSpent,
      customer.averageOrderValue.toFixed(2),
      customer.lastOrderDate?.toLocaleDateString('en-IN') || '',
      customer.tags.join('; '),
      customer.status
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Customers exported successfully')
  }

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    )
  }

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.id))
    }
  }

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'VIP': 'bg-purple-100 text-purple-800 border-purple-300',
      'High Value': 'bg-blue-100 text-blue-800 border-blue-300',
      'Loyal': 'bg-green-100 text-green-800 border-green-300',
      'New': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'At Risk': 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[tag] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  // Calculate stats
  const stats = {
    total: filteredCustomers.length,
    vip: filteredCustomers.filter(c => c.tags.includes('VIP')).length,
    highValue: filteredCustomers.filter(c => c.tags.includes('High Value')).length,
    loyal: filteredCustomers.filter(c => c.tags.includes('Loyal')).length,
    new: filteredCustomers.filter(c => c.tags.includes('New')).length,
    atRisk: filteredCustomers.filter(c => c.tags.includes('At Risk')).length,
    totalRevenue: filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: filteredCustomers.length > 0 
      ? filteredCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / filteredCustomers.length
      : 0
  }

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage
  const paginatedCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-gray-500 mt-1">View and manage customer information</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">VIP</p>
                  <p className="text-2xl font-bold">{stats.vip}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">High Value</p>
                  <p className="text-2xl font-bold">{stats.highValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Loyal</p>
                  <p className="text-2xl font-bold">{stats.loyal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">New</p>
                  <p className="text-2xl font-bold">{stats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">At Risk</p>
                  <p className="text-2xl font-bold">{stats.atRisk}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">₹{(stats.totalRevenue / 1000).toFixed(1)}k</p>
                <p className="text-xs text-gray-400 mt-1">Avg: ₹{stats.avgOrderValue.toFixed(0)}</p>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="High Value">High Value</SelectItem>
                  <SelectItem value="Loyal">Loyal</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filteredCustomers.length} customers
                </span>
                {selectedCustomers.length > 0 && (
                  <span className="text-primary font-medium">{selectedCustomers.length} selected</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No customers found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-3 px-6">
                          <Checkbox
                            checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                            onCheckedChange={toggleAllCustomers}
                          />
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Customer</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Contact</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Orders</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Total Spent</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Avg Order</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Last Order</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Tags</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => toggleCustomerSelection(customer.id)}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500 font-mono">#{customer.id.slice(0, 8)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600">{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">{customer.totalOrders}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-primary">
                              ₹{customer.totalSpent.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              ₹{customer.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {customer.lastOrderDate?.toLocaleDateString('en-IN') || 'Never'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1">
                              {customer.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                                  {tag}
                                </Badge>
                              ))}
                              {customer.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{customer.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openCustomerDetail(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                      Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
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

        {/* Customer Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Customer Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Complete customer profile and order history
              </DialogDescription>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Name</div>
                        <div className="font-medium text-lg">{selectedCustomer.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Customer ID</div>
                        <div className="font-mono text-sm">{selectedCustomer.id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Email</div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {selectedCustomer.email}
                        </div>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Phone</div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {selectedCustomer.phone}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Customer Since</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {selectedCustomer.createdAt?.toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.tags.map(tag => (
                            <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Total Orders</div>
                      <div className="text-2xl font-bold">{selectedCustomer.totalOrders}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Total Spent</div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Avg Order Value</div>
                      <div className="text-2xl font-bold">
                        ₹{selectedCustomer.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Address */}
                {selectedCustomer.address && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address
                      </h3>
                      <div className="text-sm space-y-1">
                        <div>{selectedCustomer.address.street}</div>
                        <div>{selectedCustomer.address.city}, {selectedCustomer.address.state}</div>
                        <div>{selectedCustomer.address.pincode}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order History */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Order History ({customerOrders.length})</h3>
                    {customerOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No orders yet</p>
                    ) : (
                      <div className="space-y-4">
                        {customerOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-mono text-sm">#{order.id.slice(0, 8)}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {order.items?.length || 0} items • {order.createdAt?.toLocaleDateString('en-IN')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{order.total?.toLocaleString('en-IN')}</div>
                              <div className="text-sm text-gray-500 capitalize">{order.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
