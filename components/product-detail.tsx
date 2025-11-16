"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Heart, Star, Check, Truck, Shield, Clock, Share2, ArrowLeft, Minus, Plus, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { Product } from "@/lib/products-data"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import ProductReviews from "@/components/product-reviews"
import RelatedProducts from "@/components/related-products"
import RecentlyViewed from "@/components/recently-viewed"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    // Track recently viewed
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const filtered = viewed.filter((id: number) => id !== product.id)
    const updated = [product.id, ...filtered].slice(0, 10)
    localStorage.setItem('recentlyViewed', JSON.stringify(updated))

    // Check if wishlisted
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setIsWishlisted(wishlist.includes(product.id))
  }, [product.id])

  const stock = (product as any).stock ?? null
  const lowStockThreshold = (product as any).lowStockThreshold ?? 5
  const isOutOfStock = stock !== null && stock <= 0
  const isLowStock = stock !== null && stock > 0 && stock <= lowStockThreshold

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }

    if (stock !== null && quantity > stock) {
      toast.error(`Only ${stock} units available`)
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      })
    }
    toast.success(`${quantity} x ${product.name} added to cart!`)
  }

  const handleBuyNow = () => {
    // Add to cart first
    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }

    if (stock !== null && quantity > stock) {
      toast.error(`Only ${stock} units available`)
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      })
    }
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in the ${product.name}. Can you provide more details about pricing and customization?`
    window.open(`https://wa.me/919950036077?text=${encodeURIComponent(message)}`, '_blank')
  }

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    let updated: number[]
    
    if (isWishlisted) {
      updated = wishlist.filter((id: number) => id !== product.id)
      toast.success(`${product.name} removed from wishlist`)
    } else {
      updated = [...wishlist, product.id]
      toast.success(`${product.name} added to wishlist`)
    }
    
    localStorage.setItem('wishlist', JSON.stringify(updated))
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="ghost" className="mb-8 hover:text-[#D4AF37]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A2642] to-[#2A3652] border border-border">
              {product.badge && (
                <Badge className={`absolute top-4 left-4 z-10 ${product.badgeColor} text-white border-0`}>
                  {product.badge}
                </Badge>
              )}
              
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-9xl opacity-30">🪑</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[#D4AF37] font-semibold mb-2">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="border-y border-border py-6">
              {(product as any).isExclusive && (product as any).exclusivePrice ? (
                <div>
                  <span className="text-4xl font-bold text-[#D4AF37]">
                    {(product as any).exclusivePrice}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is an exclusive product. Contact us on WhatsApp for personalized pricing and customization options.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-4xl font-bold text-[#D4AF37]">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-2xl text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <Badge className="bg-red-500">
                          Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Tax included. Shipping calculated at checkout.</p>
                </>
              )}
            </div>

            {/* Quantity - Only for non-exclusive products */}
            {!(product as any).isExclusive && (
              <div>
                <p className="font-semibold mb-3">Quantity:</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {(product as any).isExclusive ? (
              // Exclusive products: Only WhatsApp button
              <div className="flex gap-4">
                <Button 
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white h-14 text-lg"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact on WhatsApp
                </Button>
              </div>
            ) : (
              // Regular products: Buy Now, Add to Cart, Wishlist, and Share
              <>
                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white h-14 text-lg font-semibold"
                    onClick={handleBuyNow}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                  <Button 
                    className="flex-1 bg-[#1A2642] hover:bg-[#2A3652] text-white h-14 text-lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={toggleWishlist}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </>
            )}

            {/* Stock Status */}
            <div className={`rounded-lg p-4 ${isOutOfStock ? 'bg-red-50 border border-red-200' : isLowStock ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              {isOutOfStock ? (
                <p className="text-red-600 font-semibold flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Out of Stock
                </p>
              ) : (
                <>
                  <p className={`${isLowStock ? 'text-yellow-800' : 'text-green-600'} font-semibold flex items-center gap-2`}>
                    <Check className="w-5 h-5" />
                    {isLowStock ? `Only ${stock} left — order soon` : 'In Stock - Ready to Ship'}
                  </p>
                </>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Orders over ₹25,000</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                <p className="text-sm font-semibold">5 Year Warranty</p>
                <p className="text-xs text-muted-foreground">Quality guaranteed</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                <p className="text-sm font-semibold">{product.deliveryTime}</p>
                <p className="text-xs text-muted-foreground">Delivery time</p>
              </div>
            </div>

            {/* Powered by */}
            <p className="text-xs text-center text-muted-foreground pt-6 border-t">
              🔒 Secure shopping powered by{" "}
              <a href="https://www.shivkaradigital.com" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">
                Shivkara Digital
              </a>
            </p>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start mb-8">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <p className="text-muted-foreground leading-relaxed">
                Crafted with meticulous attention to detail, this piece represents the perfect marriage of form and function. 
                Each element has been carefully considered to ensure both aesthetic appeal and practical durability.
              </p>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Product Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="dimensions" className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Dimensions & Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Width:</span>
                    <span className="text-muted-foreground">{product.dimensions.width}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Height:</span>
                    <span className="text-muted-foreground">{product.dimensions.height}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Depth:</span>
                    <span className="text-muted-foreground">{product.dimensions.depth}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Material:</span>
                    <span className="text-muted-foreground">{product.material}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Delivery:</span>
                    <span className="text-muted-foreground">{product.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Stock:</span>
                    <span className="text-green-600">In Stock</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} category={product.category} />

        {/* Recently Viewed */}
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </div>
  )
}
