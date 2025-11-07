"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { ShoppingCart, Eye, Heart, Star, Clock, Tag, Percent, Gift, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { products } from "@/lib/products-data"
import Link from "next/link"
import { toast } from "sonner"

export default function DealsPage() {
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState("all")

  // Filter products with discounts
  const dealsProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price)

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    toast.success(`${product.name} added to cart!`)
  }

  const getDiscountPercent = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1A2642] via-[#D4AF37] to-[#1A2642] text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="bg-red-600 text-white mb-4 text-lg px-6 py-2">
              <Percent className="w-5 h-5 mr-2" />
              LIMITED TIME OFFERS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Exclusive <span className="text-[#FFD700]">Deals</span> & Offers
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-6">
              Save up to 70% on premium furniture. Don't miss out on these incredible savings!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="w-5 h-5" />
              <span>Hurry! Offers end soon</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Deal Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Special Offers Banner */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-red-500 to-red-700 p-8 rounded-2xl text-white"
            >
              <Zap className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Flash Sale</h3>
              <p className="mb-4">Up to 50% OFF</p>
              <p className="text-sm opacity-90">Today Only!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-2xl text-white"
            >
              <Tag className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Bundle Deals</h3>
              <p className="mb-4">Buy 2 Get 20% OFF</p>
              <p className="text-sm opacity-90">Mix & Match</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 rounded-2xl text-white"
            >
              <Gift className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">First Order</h3>
              <p className="mb-4">Extra 10% OFF</p>
              <p className="text-sm opacity-90">Use code: FIRST10</p>
            </motion.div>
          </div>

          {/* Tabs for Different Deal Types */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">All Deals</TabsTrigger>
              <TabsTrigger value="hot">Hot Deals</TabsTrigger>
              <TabsTrigger value="clearance">Clearance</TabsTrigger>
              <TabsTrigger value="bundle">Bundles</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dealsProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-white dark:bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-red-200">
                      {/* Deal Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-red-600 text-white font-bold text-lg px-4 py-2">
                          {getDiscountPercent(product.originalPrice!, product.price)}% OFF
                        </Badge>
                      </div>

                      {/* Limited Stock Badge */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <Badge variant="destructive" className="font-semibold">
                          Only {Math.floor(Math.random() * 5) + 3} left
                        </Badge>
                      </div>

                      {/* Image */}
                      <Link href={`/products/${product.id}`}>
                        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <span className="text-7xl opacity-30">🪑</span>
                          </div>
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-5">
                        <p className="text-sm text-[#D4AF37] font-semibold mb-2">
                          {product.category}
                        </p>
                        
                        <Link href={`/products/${product.id}`}>
                          <h3 className="text-lg font-bold mb-3 hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="ml-1 text-sm font-semibold">{product.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold text-red-600">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-lg text-muted-foreground line-through">
                              ₹{product.originalPrice!.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-green-600 text-sm font-semibold">
                            You save: ₹{(product.originalPrice! - product.price).toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Add to Cart Button */}
                        <Button 
                          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold h-11 rounded-lg"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hot">
              <p className="text-center text-muted-foreground py-12">
                Hot deals coming soon! Check back later.
              </p>
            </TabsContent>

            <TabsContent value="clearance">
              <p className="text-center text-muted-foreground py-12">
                Clearance items coming soon! Check back later.
              </p>
            </TabsContent>

            <TabsContent value="bundle">
              <div className="bg-[#D4AF37]/10 p-8 rounded-2xl text-center">
                <h3 className="text-2xl font-bold mb-4">Bundle & Save More!</h3>
                <p className="text-muted-foreground mb-6">
                  Buy 2 products and get 20% off, Buy 3 and get 30% off!
                </p>
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                  Shop All Products
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Coupon Codes Section */}
          <div className="bg-gradient-to-r from-[#1A2642] to-[#2A3652] text-white p-8 rounded-2xl mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Available <span className="text-[#D4AF37]">Coupon Codes</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 p-6 rounded-xl border-2 border-dashed border-[#D4AF37]">
                <p className="text-sm mb-2">First Order Discount</p>
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">FIRST10</h3>
                <p className="text-sm opacity-90">Get 10% off on your first order</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl border-2 border-dashed border-[#D4AF37]">
                <p className="text-sm mb-2">Festive Special</p>
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">FESTIVE15</h3>
                <p className="text-sm opacity-90">15% off on orders above ₹50,000</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl border-2 border-dashed border-[#D4AF37]">
                <p className="text-sm mb-2">Free Shipping</p>
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">FREESHIP</h3>
                <p className="text-sm opacity-90">Free delivery on orders above ₹25,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
