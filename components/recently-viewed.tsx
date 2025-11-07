"use client"

import { useState, useEffect } from "react"
import { products } from "@/lib/products-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface RecentlyViewedProps {
  currentProductId: number
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<typeof products>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    
    // Filter out current product and get product details
    const recentProducts = viewedIds
      .filter((id: number) => id !== currentProductId)
      .slice(0, 4)
      .map((id: number) => products.find(p => p.id === id))
      .filter((p: any) => p !== undefined)
    
    setViewedProducts(recentProducts)
  }, [currentProductId])

  if (viewedProducts.length === 0) {
    return null
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

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-8">Recently Viewed</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {viewedProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
            <Link href={`/products/${product.id}`}>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.reviews})
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-[#D4AF37]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
