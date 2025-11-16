'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, AlertCircle, Loader, Download, Trash2, Archive, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BulkOperation {
  operation: 'delete' | 'archive' | 'restore' | 'updatePrice' | 'updateCategory' | 'updateStock' | 'updateDiscount'
  productIds: string[]
  data?: Record<string, any>
}

interface BulkOperationResult {
  success: boolean
  message: string
  modifiedCount?: number
}

interface ProductItem {
  _id: string
  name: string
  category: string
  price: number
  stock: number
  archived?: boolean
}

interface BulkOperationsManagerProps {
  products?: ProductItem[]
}

export default function BulkOperationsManager({ products = [] }: BulkOperationsManagerProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [operation, setOperation] = useState<BulkOperation['operation']>('delete')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<BulkOperationResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDataInput, setShowDataInput] = useState(false)
  const [operationData, setOperationData] = useState({
    price: '',
    category: '',
    stock: '',
    discount: '',
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(new Set(products.map(p => p._id)))
    } else {
      setSelectedProductIds(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSet = new Set(selectedProductIds)
    if (checked) {
      newSet.add(productId)
    } else {
      newSet.delete(productId)
    }
    setSelectedProductIds(newSet)
  }

  const getOperationTitle = () => {
    const titles: Record<BulkOperation['operation'], string> = {
      delete: 'Delete Products',
      archive: 'Archive Products',
      restore: 'Restore Products',
      updatePrice: 'Update Prices',
      updateCategory: 'Update Category',
      updateStock: 'Update Stock',
      updateDiscount: 'Apply Discount',
    }
    return titles[operation]
  }

  const getOperationDescription = () => {
    const descriptions: Record<BulkOperation['operation'], string> = {
      delete: 'Permanently delete selected products',
      archive: 'Hide products from store (can be restored)',
      restore: 'Restore archived products to store',
      updatePrice: 'Update price for all selected products',
      updateCategory: 'Change category for all selected products',
      updateStock: 'Update inventory for all selected products',
      updateDiscount: 'Apply discount to all selected products',
    }
    return descriptions[operation]
  }

  const performOperation = async () => {
    if (selectedProductIds.size === 0) {
      alert('Please select at least one product')
      return
    }

    setIsLoading(true)
    try {
      const payload: BulkOperation = {
        operation,
        productIds: Array.from(selectedProductIds),
      }

      if (
        operation === 'updatePrice' ||
        operation === 'updateCategory' ||
        operation === 'updateStock' ||
        operation === 'updateDiscount'
      ) {
        const dataKey = {
          updatePrice: 'price',
          updateCategory: 'category',
          updateStock: 'stock',
          updateDiscount: 'discount',
        }[operation]

        const value = operationData[dataKey as keyof typeof operationData]
        if (!value) {
          alert(`Please enter a ${dataKey}`)
          setIsLoading(false)
          return
        }

        payload.data = {
          [dataKey]: dataKey === 'price' || dataKey === 'discount' ? parseFloat(value) : 
                    dataKey === 'stock' ? parseInt(value) : value,
        }
      }

      const response = await fetch('/api/admin/products/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully ${operation}d ${data.modifiedCount} products!`,
          modifiedCount: data.modifiedCount,
        })
        setSelectedProductIds(new Set())
        setShowConfirm(false)
      } else {
        setResult({
          success: false,
          message: data.message || 'Operation failed',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportAsCSV = async () => {
    try {
      const response = await fetch('/api/admin/products/bulk-operations?operation=export', {
        method: 'GET',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      alert('Failed to export products')
    }
  }

  const operationIcons: Record<BulkOperation['operation'], React.ReactNode> = {
    delete: <Trash2 className="h-4 w-4" />,
    archive: <Archive className="h-4 w-4" />,
    restore: <RotateCcw className="h-4 w-4" />,
    updatePrice: <Badge className="h-4 w-4" />,
    updateCategory: <Badge className="h-4 w-4" />,
    updateStock: <Badge className="h-4 w-4" />,
    updateDiscount: <Badge className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bulk Operations</h2>
          <p className="text-gray-500 mt-1">Manage multiple products at once</p>
        </div>
        <Button onClick={exportAsCSV} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation</CardTitle>
          <CardDescription>Choose what you want to do with selected products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="operation">Operation</Label>
            <Select value={operation} onValueChange={(val) => setOperation(val as BulkOperation['operation'])}>
              <SelectTrigger id="operation" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Products
                  </div>
                </SelectItem>
                <SelectItem value="archive">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archive Products
                  </div>
                </SelectItem>
                <SelectItem value="restore">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restore Products
                  </div>
                </SelectItem>
                <SelectItem value="updatePrice">Update Prices</SelectItem>
                <SelectItem value="updateCategory">Update Category</SelectItem>
                <SelectItem value="updateStock">Update Stock</SelectItem>
                <SelectItem value="updateDiscount">Apply Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(operation === 'updatePrice' ||
            operation === 'updateCategory' ||
            operation === 'updateStock' ||
            operation === 'updateDiscount') && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
              {operation === 'updatePrice' && (
                <div>
                  <Label htmlFor="price">New Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 15000"
                    value={operationData.price}
                    onChange={(e) => setOperationData({ ...operationData, price: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}
              {operation === 'updateCategory' && (
                <div>
                  <Label htmlFor="category">New Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Bedroom"
                    value={operationData.category}
                    onChange={(e) => setOperationData({ ...operationData, category: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}
              {operation === 'updateStock' && (
                <div>
                  <Label htmlFor="stock">New Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="e.g., 50"
                    value={operationData.stock}
                    onChange={(e) => setOperationData({ ...operationData, stock: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}
              {operation === 'updateDiscount' && (
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="e.g., 15"
                    value={operationData.discount}
                    onChange={(e) => setOperationData({ ...operationData, discount: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Products</span>
            <Badge variant="outline">
              {selectedProductIds.size} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            {selectedProductIds.size} of {products.length} products selected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="select-all"
              checked={selectedProductIds.size === products.length && products.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="cursor-pointer font-semibold">
              Select All Products
            </Label>
          </div>

          {/* Product List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products available</p>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`product-${product._id}`}
                    checked={selectedProductIds.has(product._id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product._id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`product-${product._id}`}
                      className="cursor-pointer font-semibold truncate"
                    >
                      {product.name}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ₹{product.price.toLocaleString()}
                      </Badge>
                      {product.archived && (
                        <Badge variant="destructive" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={selectedProductIds.size === 0}
        className="w-full"
        size="lg"
        variant={operation === 'delete' ? 'destructive' : 'default'}
      >
        {operationIcons[operation]}
        <span className="ml-2">
          {getOperationTitle()} ({selectedProductIds.size})
        </span>
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Operation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">
                {getOperationTitle()}
              </p>
              <p className="text-sm text-gray-600">
                {getOperationDescription()}
              </p>
              <p className="text-sm font-semibold mt-3">
                Affected Products: {selectedProductIds.size}
              </p>
            </div>

            {operation === 'delete' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. Products will be permanently deleted.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={performOperation}
                disabled={isLoading}
                variant={operation === 'delete' ? 'destructive' : 'default'}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <div className="flex gap-3">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <AlertDescription className="flex-1">
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
