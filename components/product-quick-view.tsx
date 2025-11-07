"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/lib/products-data"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface ProductQuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      })
    }
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to your cart`,
    })
    onClose()
  }

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    let updated: number[]
    
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter((id: number) => id !== product.id)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} removed from your wishlist`,
      })
    } else {
      updated = [...wishlist, product.id]
      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to your wishlist`,
      })
    }
    
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Quick View</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.badge && (
              <Badge className={`absolute top-4 left-4 ${product.badgeColor}`}>
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#D4AF37] font-semibold mb-2">{product.category}</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
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
                  <span className="ml-1 text-sm font-semibold">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <p className="text-muted-foreground text-sm">{product.description}</p>
            </div>

            {/* Price */}
            <div className="border-y border-border py-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-[#D4AF37]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <Badge className="bg-red-500">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Color Selection */}
            {product.color && product.color.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Available Colors
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md border-2 text-sm transition-all ${
                        selectedColor === color
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-semibold min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Key Features</label>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-[#D4AF37] mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={toggleWishlist}
                variant="outline"
                className="h-12 px-4"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link href={`/products/${product.id}`} onClick={onClose}>
              <Button variant="link" className="w-full text-[#D4AF37]">
                View Full Details →
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
