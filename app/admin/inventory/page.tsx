'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  Package,
  TrendingDown,
  Upload,
  Edit,
  History,
  ArrowUpDown,
  FileSpreadsheet
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  lowStockThreshold: number
  sku?: string
  supplier?: string
  lastRestocked?: Date
}

interface StockHistory {
  id: string
  productId: string
  productName: string
  action: 'restock' | 'sale' | 'adjustment' | 'return'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  createdAt: Date
  createdBy: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [bulkUpdateValue, setBulkUpdateValue] = useState('')
  const [bulkUpdateType, setBulkUpdateType] = useState<'add' | 'subtract' | 'set'>('add')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 15

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, statusFilter])

  const loadInventory = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lowStockThreshold: doc.data().lowStockThreshold || 10,
        lastRestocked: doc.data().lastRestocked?.toDate()
      })) as Product[]

      // Load stock history
      const historySnapshot = await getDocs(collection(db, 'stockHistory'))
      const historyData = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as StockHistory[]

      setProducts(productsData.sort((a, b) => (a.stock || 0) - (b.stock || 0)))
      setStockHistory(historyData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (statusFilter === 'low') {
      filtered = filtered.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 10))
    } else if (statusFilter === 'out') {
      filtered = filtered.filter(p => (p.stock || 0) === 0)
    } else if (statusFilter === 'good') {
      filtered = filtered.filter(p => (p.stock || 0) > (p.lowStockThreshold || 10))
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  const updateStock = async (productId: string, newStock: number, action: string, reason?: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const productRef = doc(db, 'products', productId)
      await updateDoc(productRef, {
        stock: newStock,
        lastRestocked: new Date()
      })

      // Add to history
      await addDoc(collection(db, 'stockHistory'), {
        productId,
        productName: product.name,
        action,
        quantity: Math.abs(newStock - (product.stock || 0)),
        previousStock: product.stock || 0,
        newStock,
        reason,
        createdAt: new Date(),
        createdBy: 'Admin'
      })

      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: newStock, lastRestocked: new Date() } : p
      ))

      toast.success('Stock updated successfully')
      loadInventory()
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock')
    }
  }

  const bulkUpdateStock = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected')
      return
    }

    const value = parseInt(bulkUpdateValue)
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      const batch = writeBatch(db)
      
      selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        let newStock = product.stock || 0
        if (bulkUpdateType === 'add') {
          newStock += value
        } else if (bulkUpdateType === 'subtract') {
          newStock = Math.max(0, newStock - value)
        } else {
          newStock = value
        }

        const productRef = doc(db, 'products', productId)
        batch.update(productRef, {
          stock: newStock,
          lastRestocked: new Date()
        })
      })

      await batch.commit()

      setProducts(products.map(p => {
        if (!selectedProducts.includes(p.id)) return p
        
        let newStock = p.stock || 0
        if (bulkUpdateType === 'add') {
          newStock += value
        } else if (bulkUpdateType === 'subtract') {
          newStock = Math.max(0, newStock - value)
        } else {
          newStock = value
        }

        return { ...p, stock: newStock, lastRestocked: new Date() }
      }))

      setSelectedProducts([])
      setShowBulkUpdateModal(false)
      setBulkUpdateValue('')
      toast.success(`${selectedProducts.length} products updated successfully`)
      loadInventory()
    } catch (error) {
      console.error('Error bulk updating stock:', error)
      toast.error('Failed to update stock')
    }
  }

  const exportToCSV = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Price', 'Stock', 'Low Stock Threshold', 'Status', 'Supplier', 'Last Restocked']
    const rows = filteredProducts.map(p => [
      p.name,
      p.sku || '',
      p.category,
      p.price,
      p.stock || 0,
      p.lowStockThreshold || 10,
      getStockStatus(p),
      p.supplier || '',
      p.lastRestocked?.toLocaleDateString('en-IN') || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Inventory exported successfully')
  }

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const headers = lines[0].split(',')
        
        const updates: { [key: string]: number } = {}
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length < 2) continue
          
          const productName = values[0]
          const newStock = parseInt(values[4]) // Stock column
          
          if (!isNaN(newStock)) {
            const product = products.find(p => p.name === productName)
            if (product) {
              updates[product.id] = newStock
            }
          }
        }

        // Update products
        const batch = writeBatch(db)
        Object.entries(updates).forEach(([productId, stock]) => {
          const productRef = doc(db, 'products', productId)
          batch.update(productRef, { stock, lastRestocked: new Date() })
        })

        await batch.commit()
        await loadInventory()
        toast.success(`${Object.keys(updates).length} products updated from CSV`)
      } catch (error) {
        console.error('Error importing CSV:', error)
        toast.error('Failed to import CSV')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0
    const threshold = product.lowStockThreshold || 10
    
    if (stock === 0) return 'Out of Stock'
    if (stock <= threshold) return 'Low Stock'
    return 'In Stock'
  }

  const getStatusColor = (product: Product) => {
    const stock = product.stock || 0
    const threshold = product.lowStockThreshold || 10
    
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-300'
    if (stock <= threshold) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const toggleAllProducts = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id))
    }
  }

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 10) && (p.stock || 0) > 0).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    inStock: products.filter(p => (p.stock || 0) > (p.lowStockThreshold || 10)).length,
    totalValue: products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0)
  }

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const paginatedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

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
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage product stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={importFromCSV}
                />
              </label>
            </Button>
            <Button onClick={() => setShowHistoryModal(true)} variant="outline">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">In Stock</p>
                  <p className="text-2xl font-bold">{stats.inStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold">{stats.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                <p className="text-xl font-bold text-primary">
                  ₹{(stats.totalValue / 1000).toFixed(0)}k
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {stats.lowStock > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {stats.lowStock} product{stats.lowStock > 1 ? 's' : ''} running low on stock. 
                    {stats.outOfStock > 0 && ` ${stats.outOfStock} product${stats.outOfStock > 1 ? 's' : ''} out of stock.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, SKU, or category..."
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
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filteredProducts.length} products
                </span>
                {selectedProducts.length > 0 && (
                  <span className="text-primary font-medium">{selectedProducts.length} selected</span>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg flex items-center justify-between">
                <span className="font-medium">{selectedProducts.length} product(s) selected</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowBulkUpdateModal(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bulk Update Stock
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProducts([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-3 px-6">
                          <Checkbox
                            checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                            onCheckedChange={toggleAllProducts}
                          />
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Product</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">SKU</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Price</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Current Stock</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Threshold</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">{product.name}</div>
                            {product.supplier && (
                              <div className="text-xs text-gray-500">Supplier: {product.supplier}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono text-sm">{product.sku || '-'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">{product.category}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold">₹{product.price.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={product.stock || 0}
                                onChange={(e) => {
                                  const newStock = parseInt(e.target.value) || 0
                                  updateStock(product.id, newStock, 'adjustment', 'Manual adjustment')
                                }}
                                className="w-24"
                              />
                              <span className="text-sm text-gray-500">units</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600">{product.lowStockThreshold || 10}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={getStatusColor(product)}>
                              {getStockStatus(product)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(product.id, (product.stock || 0) + 10, 'restock', 'Quick restock')}
                              >
                                +10
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(product.id, (product.stock || 0) + 50, 'restock', 'Bulk restock')}
                              >
                                +50
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
                      Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
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

        {/* Bulk Update Modal */}
        <Dialog open={showBulkUpdateModal} onOpenChange={setShowBulkUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Update Stock</DialogTitle>
              <DialogDescription>
                Update stock for {selectedProducts.length} selected product(s)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Update Type</Label>
                <Select value={bulkUpdateType} onValueChange={(value: any) => setBulkUpdateType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add to Current Stock</SelectItem>
                    <SelectItem value="subtract">Subtract from Current Stock</SelectItem>
                    <SelectItem value="set">Set Stock to Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={bulkUpdateValue}
                  onChange={(e) => setBulkUpdateValue(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkUpdateModal(false)}>
                Cancel
              </Button>
              <Button onClick={bulkUpdateStock}>
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock History Modal */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Stock History</DialogTitle>
              <DialogDescription>
                Recent stock movements and adjustments
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {stockHistory.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No stock history available</p>
              ) : (
                stockHistory.slice(0, 50).map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{entry.productName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="capitalize">{entry.action}</span> • 
                          Quantity: {entry.quantity} units •
                          {entry.previousStock} → {entry.newStock}
                        </div>
                        {entry.reason && (
                          <div className="text-xs text-gray-500 mt-1">Reason: {entry.reason}</div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{entry.createdAt?.toLocaleDateString('en-IN')}</div>
                        <div className="text-xs">{entry.createdBy}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
