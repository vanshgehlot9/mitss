"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { products } from "@/lib/products-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, X, ShoppingCart, Check, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function ComparePage() {
  const [compareIds, setCompareIds] = useState<number[]>([])
  const [compareProducts, setCompareProducts] = useState<typeof products>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('compare') || '[]')
    setCompareIds(ids)
    const prods = ids
      .map((id: number) => products.find(p => p.id === id))
      .filter((p: any) => p !== undefined)
    setCompareProducts(prods)
  }, [])

  const removeFromCompare = (productId: number) => {
    const updated = compareIds.filter(id => id !== productId)
    localStorage.setItem('compare', JSON.stringify(updated))
    setCompareIds(updated)
    const prods = updated
      .map(id => products.find(p => p.id === id))
      .filter((p): p is typeof products[0] => p !== undefined)
    setCompareProducts(prods)
    toast({
      title: "Removed from Comparison",
      description: "Product removed from comparison",
    })
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    })
  }

  const clearAll = () => {
    localStorage.setItem('compare', JSON.stringify([]))
    setCompareIds([])
    setCompareProducts([])
    toast({
      title: "Comparison Cleared",
      description: "All products removed from comparison",
    })
  }

  // Comparison attributes
  const attributes = [
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'originalPrice', label: 'Original Price', type: 'price' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'reviews', label: 'Reviews', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'color', label: 'Available Colors', type: 'array' },
    { key: 'dimensions.width', label: 'Width', type: 'text' },
    { key: 'dimensions.height', label: 'Height', type: 'text' },
    { key: 'dimensions.depth', label: 'Depth', type: 'text' },
    { key: 'deliveryTime', label: 'Delivery Time', type: 'text' },
    { key: 'inStock', label: 'In Stock', type: 'boolean' },
  ]

  const getValue = (product: any, key: string) => {
    const keys = key.split('.')
    let value = product
    for (const k of keys) {
      value = value?.[k]
    }
    return value
  }

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-'
    
    switch (type) {
      case 'price':
        return `₹${value.toLocaleString('en-IN')}`
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
            {value}
          </div>
        )
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value
      case 'boolean':
        return value ? (
          <Check className="w-5 h-5 text-green-600 mx-auto" />
        ) : (
          <X className="w-5 h-5 text-red-600 mx-auto" />
        )
      case 'number':
        return value.toLocaleString('en-IN')
      default:
        return value
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compare Products</h1>
            <p className="text-muted-foreground">
              Compare up to 4 products side by side
            </p>
          </div>
          {compareProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {compareProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-24 h-24 mx-auto mb-6 text-muted-foreground/30" />
            <h2 className="text-2xl font-semibold mb-4">No Products to Compare</h2>
            <p className="text-muted-foreground mb-8">
              Add products from the product listing page to compare them
            </p>
            <Link href="/products">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-semibold w-48 sticky left-0 bg-background z-10">
                    Specification
                  </th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="p-4 min-w-[280px]">
                      <Card className="p-4 text-center relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {product.badge && (
                            <Badge className={`absolute top-2 left-2 ${product.badgeColor}`}>
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold mb-2 hover:text-[#D4AF37] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white mt-4"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </Card>
                    </th>
                  ))}
                  {/* Empty slots */}
                  {[...Array(4 - compareProducts.length)].map((_, idx) => (
                    <th key={`empty-${idx}`} className="p-4 min-w-[280px]">
                      <Card className="p-8 text-center border-dashed">
                        <p className="text-muted-foreground text-sm">Empty Slot</p>
                      </Card>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attr, idx) => (
                  <tr
                    key={attr.key}
                    className={`border-b border-border ${idx % 2 === 0 ? 'bg-muted/30' : ''}`}
                  >
                    <td className="p-4 font-semibold sticky left-0 bg-background z-10">
                      {attr.label}
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        {formatValue(getValue(product, attr.key), attr.type)}
                      </td>
                    ))}
                    {[...Array(4 - compareProducts.length)].map((_, idx) => (
                      <td key={`empty-${idx}`} className="p-4 text-center text-muted-foreground">
                        -
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="font-semibold mb-3">How to Compare Products</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Browse products and look for the "Compare" checkbox</li>
            <li>Select up to 4 products you want to compare</li>
            <li>Click on "Compare Products" button or visit this page</li>
            <li>View side-by-side comparison of specifications</li>
          </ol>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
