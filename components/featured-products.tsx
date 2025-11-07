"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Star, Heart, MessageCircle, Eye, ArrowRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/hooks/use-products"
import { toast } from "sonner"
import Image from "next/image"

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const { products, loading } = useProducts({ limit: 5 })
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const handleWhatsAppClick = (product: typeof products[0]) => {
    const isExclusive = (product as any).isExclusive
    const message = encodeURIComponent(
      `Hi! I'm interested in ${product.name}${!isExclusive ? ` (₹${product.price.toLocaleString('en-IN')})` : ''}. Can you provide more details?`
    )
    window.open(`https://wa.me/919950036077?text=${message}`, '_blank')
  }

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

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FAF9F6] relative overflow-hidden" ref={ref}>
      <div className="absolute top-20 left-0 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-[#1A2642]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10 border border-[#D4AF37]/20"
          >
            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-[#1A2642] text-xs sm:text-sm font-medium">Top Picks</span>
          </motion.div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1A2642] mb-4 sm:mb-6 leading-tight">
            Bestsellers from <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">Mitss</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#1A2642]/60 max-w-3xl mx-auto leading-relaxed px-4">
            Handpicked pieces that our customers love the most
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {(product as any).isExclusive && (
                <div className="absolute top-2 left-2 z-20">
                  <Badge className="bg-[#D4AF37] text-white border-0 shadow-md text-xs px-2 py-0.5">
                    Exclusive
                  </Badge>
                </div>
              )}

              <Link href={`/products/${product._id || product.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-20">🪑</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-3">
                <p className="text-xs text-[#D4AF37] font-semibold mb-1">{product.category}</p>
                <Link href={`/products/${product._id || product.id}`}>
                  <h3 className="text-sm font-bold mb-2 text-[#1A2642] dark:text-white line-clamp-2 hover:text-[#D4AF37] transition-colors cursor-pointer h-10">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? "fill-[#D4AF37] text-[#D4AF37]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                </div>

                <div className="mb-3">
                  {(product as any).isExclusive && (product as any).exclusivePrice ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {(product as any).exclusivePrice}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#D4AF37]">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  )}
                </div>

                {(product as any).isExclusive ? (
                  <Button 
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs h-8"
                    onClick={() => handleWhatsAppClick(product)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white text-xs h-8"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Buy Now
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link href="/products">
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-[#1A2642] text-[#1A2642] hover:bg-[#1A2642] hover:text-white px-10 py-6 text-lg rounded-2xl transition-all duration-500 font-semibold group"
            >
              View All Products
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
