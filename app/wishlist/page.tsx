"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { products } from "@/lib/products-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, X, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<typeof products>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = () => {
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const items = wishlistIds
      .map((id: number) => products.find(p => p.id === id))
      .filter((p: any) => p !== undefined)
    setWishlistItems(items)
  }

  const removeFromWishlist = (productId: number) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const updated = wishlist.filter((id: number) => id !== productId)
    localStorage.setItem('wishlist', JSON.stringify(updated))
    loadWishlist()
    toast({
      title: "Removed from Wishlist",
      description: "Product removed from your wishlist",
    })
  }

  const moveToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    removeFromWishlist(product.id)
    toast({
      title: "Moved to Cart",
      description: `${product.name} moved to your cart`,
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground/30" />
            <h2 className="text-2xl font-semibold mb-4">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-8">
              Start adding products you love to your wishlist!
            </p>
            <Link href="/products">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.badge && (
                        <Badge className={`absolute top-3 left-3 ${product.badgeColor}`}>
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>

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

                  <div className="flex gap-2">
                    <Button
                      onClick={() => moveToCart(product)}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Move to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
