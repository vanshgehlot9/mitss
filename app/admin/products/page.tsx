'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Eye, Upload, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { products } from '@/lib/products-data'
import ProductActions from '@/components/admin/product-actions'
import BulkImportManager from '@/components/admin/bulk-import-manager'
import BulkOperationsManager from '@/components/admin/bulk-operations-manager'

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState(products)
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    filterProducts()
  }, [searchTerm])

  const filterProducts = () => {
    let filtered = [...allProducts]

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleProductDeleted = (id: number) => {
    setAllProducts(allProducts.filter(p => p.id !== id))
  }

  const handleProductDuplicated = () => {
    // Refresh products - in a real app this would fetch from API
    window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="bulk-operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Bulk Operations
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {product.inStock ? (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/products/${product.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ProductActions
                        productId={product.id.toString()}
                        productName={product.name}
                        onDelete={() => handleProductDeleted(product.id)}
                        onDuplicate={handleProductDuplicated}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No products found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk-import">
            <BulkImportManager />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk-operations">
            <BulkOperationsManager products={allProducts.map(p => ({
              _id: p.id.toString(),
              name: p.name,
              category: p.category,
              price: p.price,
              stock: 10, // placeholder
            }))} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
